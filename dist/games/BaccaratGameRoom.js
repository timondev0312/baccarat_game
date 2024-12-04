"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const colyseus_1 = require("colyseus");
const types_1 = require("../types");
const BaccaratGameLogic_1 = require("../logics/BaccaratGameLogic");
const auth2_1 = require("../controllers/auth/auth2");
const baccarat_1 = require("../controllers/baccarat");
const axios_1 = require("../utils/axios");
const BotManager_1 = require("./BotManager");
const WAIT_TIME = Number(process.env.WAIT_TIME || 5000); // 5 seconds
const BETTING_TIME = Number(process.env.BETTING_TIME || 15000); // 30 seconds
const CALCULATION_TIME = Number(process.env.CALCULATION_TIME || 15000); // 30 seconds
const Suits = { 4: types_1.Suit.Spades, 3: types_1.Suit.Hearts, 2: types_1.Suit.Clubs, 1: types_1.Suit.Diamonds };
const multipliers = {
    'Player': 2,
    'Banker': 1.95,
    'Tie': 9,
    'PPair': 12,
    'BPair': 12,
};
const placeNames = {
    "Banker": "a",
    "BPair": "b",
    "PPair": "d",
    "Player": "c",
    "Tie": "e"
};
class GameRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.gameLogic = new BaccaratGameLogic_1.BaccaratGame();
        this.players = new Map();
        this.users = new Map();
        this.outUserIds = new Map();
        this.Bets = [];
        this.room_id = "";
        this.realroomId = 1;
        this.chipValues = [100, 200, 500, 1000, 5000];
        this.bankers = [];
        this.gid = (Number(process.env.GAME_ID || 31));
        this.timeDiff = 0; // 本地时间和服务器时间差距
        this.startBetTime = Date.now(); // 本局游戏开始时间
    }
    onCreate(options) {
        console.log(`Room created with ID: ${options.room_id}`);
        this.room_id = options.room_id;
        this.realroomId = options.customRoomId;
        this.botManager = new BotManager_1.BotManager(this, ['Player', 'Banker', 'Tie', 'PPair', 'BPair']);
        this.setMetadata({
            room_id: this.room_id,
            WAIT_TIME,
            BETTING_TIME,
            CALCULATION_TIME,
            PlayerCount: 0
        });
        this.chipValues = options.chips;
        this.autoDispose = false;
        this.setState(new types_1.GameState());
        this.onMessage("bet-place", this.onBet.bind(this));
        this.onMessage("refresh_token", this.onRefreshToken.bind(this));
        this.onMessage("apply-banker", this.onApplyBanker.bind(this));
        this.onMessage("cancel-banker", this.onCancelBanker.bind(this));
        this.onMessage("over-banker", this.onOverBanker.bind(this));
        this.startGameTimer();
        this.fetchBankers();
        this.changeGameStatus(types_1.GameStatusType.STOPPED);
        setInterval(() => {
            if (this.state.bankerId !== undefined) {
                this.botManager.performBotActions();
            }
        }, Math.floor(Math.random() * 5000) + 1500);
        this.botManager.addBot(200);
    }
    onAuth(client, options, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const ipaddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            console.log(`Client joined: ${options.room_id} ${ipaddress}`);
            const token = options.token || "";
            client.send("metadata", this.metadata);
            setTimeout(() => {
                client.send("status", { status: this.status, dt: this.getDT() });
                if (this.status === types_1.GameStatusType.BETTING) {
                    client.send("bets", this.Bets);
                }
                else if (this.status === types_1.GameStatusType.CALCULATING && this.getDT() > 3500) {
                    if (this.resultData) {
                        client.send("result", Object.assign(Object.assign({}, this.resultData), { set: true }));
                    }
                    else {
                        client.send("bets", this.Bets);
                    }
                }
                client.send("bankers", this.bankers.map(b => b.getInfo()));
            }, 500);
            if (!token) {
                client.send("invalid_token");
                return false;
            }
            try {
                const userInfo = yield (0, auth2_1.getUserInfo)(token, "Bearer");
                if (userInfo.code === 0) {
                    const userId = String(userInfo.data.uid);
                    if (this.outUserIds.has(userId)) {
                        this.outUserIds.delete(userId);
                    }
                    const player = this.createPlayer(userId, userInfo.data, token);
                    this.users.set(client.sessionId, userId);
                    this.players.set(userId, player);
                    player.ip = ipaddress;
                    this.broadcast("join-player", player.getInfo());
                    client.send("join-success", player.getInfo());
                    client.send("players", Array.from(this.players.values()).map((v) => v.getInfo()));
                    this.updatePlayerCount();
                    return player;
                }
                else {
                    client.send("invalid_token");
                    return false;
                }
            }
            catch (error) {
                console.error("Authentication error:", error);
                client.send("invalid_token");
                return false;
            }
        });
    }
    onJoin(client, options) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    updatePlayerCount() {
        this.setMetadata(Object.assign(Object.assign({}, this.metadata), { playerCount: this.players.size }));
    }
    createPlayer(userId, data, token) {
        const player = new types_1.Player();
        player.uid = userId;
        player.username = data.username;
        player.nickname = data.nickname;
        player.avatar = data.avatar;
        player.VIP = data.vip;
        player.balance = data.balance;
        player.access_token = token;
        return player;
    }
    onRefreshToken(client, data) {
        const userId = this.users.get(client.sessionId);
        if (userId && this.players.has(userId)) {
            const player = this.players.get(userId);
            player.access_token = data;
        }
    }
    onApplyBanker(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { amount, wantAmount, wantTime } = data;
            let _amount = amount;
            if (!this.users.has(client.sessionId)) {
                client.send("apply-banker-res", {
                    status: false,
                    msg: "did_not_joing_in_game"
                });
            }
            const userId = this.users.get(client.sessionId);
            const player = this.players.get(userId);
            const index = this.bankers.findIndex((b) => b.uid === userId);
            if (index === -1) {
                if (player.balance < _amount) {
                    return client.send("apply-banker-res", { status: false, msg: "not_enough_balance" });
                }
                const res = yield (0, baccarat_1.applyBanker)(this.realroomId, _amount, player.access_token, wantTime, wantAmount, this.gid);
                if (res.code === 0) {
                    const newBanker = new types_1.Banker();
                    newBanker.uid = (0, axios_1.getUserId)(res.data.uid);
                    newBanker.id = res.data.id;
                    newBanker.amount = res.data.amount;
                    newBanker.roomId = res.data.roomId;
                    newBanker.username = res.data.username;
                    newBanker.status = res.data.status;
                    newBanker.startPeriod = res.data.startPeriod;
                    newBanker.createdAt = res.data.createdAt;
                    newBanker.total = res.data.total;
                    newBanker.wantAmount = res.data.wantAmount;
                    newBanker.wantTimes = res.data.wantTimes;
                    this.bankers.push(newBanker);
                    this.bankers = this.bankers.sort((a, b) => b.amount - a.amount);
                    client.send("apply-banker-res", { status: true, msg: "successful_banker_applied" });
                    this.fetchBankers();
                }
                else {
                    client.send("banker-res", { status: false, msg: res.message });
                }
            }
        });
    }
    onCancelBanker(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.users.has(client.sessionId)) {
                client.send("cancel-banker-res", {
                    status: false,
                    msg: "did_not_joing_in_game"
                });
            }
            const userId = this.users.get(client.sessionId);
            const player = this.players.get(userId);
            const index = this.bankers.findIndex((b) => b.uid === userId);
            if (index !== -1) {
                if (this.bankers[index].status == 0) {
                    const res1 = yield (0, baccarat_1.cancelBanker)(this.bankers[index].id, new Date().getTime(), player.access_token, this.gid);
                    if (res1.code === 0) {
                        client.send("cancel-banker-res", { status: true, msg: "successful_banker_canceled" });
                        this.fetchBankers();
                    }
                    else {
                        client.send("cancel-banker-res", { status: false, msg: res1.message });
                    }
                }
            }
        });
    }
    onOverBanker(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.users.has(client.sessionId)) {
                return;
            }
            const userId = this.users.get(client.sessionId);
            const player = this.players.get(userId);
            const index = this.bankers.findIndex((b) => b.uid == this.state.bankerId);
            if (this.state.bankerId !== player.uid || index === -1) {
                return client.send("over-banker-res", { status: false, msg: "you_are_not_current_banker" });
            }
            ;
            const res = yield (0, baccarat_1.overBanker)(this.bankers[index].id, this.state.period, player.access_token, this.gid);
            if (res.code == 0) {
                client.send("over-banker-res", { status: true, msg: res.message });
                this.fetchBankers();
            }
            else {
                client.send("over-banker-res", { status: false, msg: res.message });
            }
        });
    }
    onLeave(client) {
        console.log(`Client left: ${client.sessionId}`);
        const userId = this.users.get(client.sessionId);
        if (userId)
            this.outUserIds.set(userId, client.sessionId);
    }
    onDispose() {
        console.log("Room disposed!");
    }
    onBet(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chipValues[data.chip])
                return client.send("invalid-bet", { status: false, msg: "chip_err" });
            if (this.status !== types_1.GameStatusType.BETTING) {
                return client.send("invalid-bet", { status: false, msg: "game_status_err" });
            }
            const fingerprint = data.fingerprint;
            const userId = this.users.get(client.sessionId);
            const player = this.players.get(userId);
            if (!player) {
                return client.send("invalid-bet", { status: false, msg: "not_found_player" });
            }
            const amount = this.chipValues[data.chip];
            if (player.balance < amount) {
                return client.send("invalid-bet", { status: false, msg: "insufficient_balance" });
            }
            const res = yield (0, baccarat_1.placeBet)(this.realroomId, this.state.period, this.gid, placeNames[data.place], amount, player.access_token, player.ip, fingerprint);
            if (res.code === 0) {
                player.balance = res.data.amount;
                this.Bets.push({ uid: userId, chip: data.chip, place: data.place });
                this.broadcast("bet-place", {
                    chip: data.chip,
                    place: data.place,
                    uid: player.uid,
                    balance: player.balance,
                });
            }
            else {
                if (res.error !== 'period_is_over') {
                    return client.send("invalid-bet", { status: false, msg: res === null || res === void 0 ? void 0 : res.message });
                }
            }
        });
    }
    startGameTimer() {
        this.setSimulationInterval(() => {
            let dt = Date.now() - this.startBetTime - this.timeDiff;
            this.updateGameStatus(dt);
        });
    }
    updateGameStatus(dt) {
        if (dt < 0 || this.status === types_1.GameStatusType.STOPPED)
            return;
        if (dt > WAIT_TIME + BETTING_TIME + CALCULATION_TIME && this.status === types_1.GameStatusType.CALCULATING) {
            this.changeGameStatus(types_1.GameStatusType.STOPPED);
        }
        else if (dt > WAIT_TIME + BETTING_TIME && this.status === types_1.GameStatusType.BETTING) {
            this.changeGameStatus(types_1.GameStatusType.CALCULATING);
        }
        else if (dt > WAIT_TIME && this.status === types_1.GameStatusType.WAITING) {
            this.changeGameStatus(types_1.GameStatusType.BETTING);
        }
    }
    changeGameStatus(status) {
        if (this.status !== status) {
            this.status = status;
            console.log("GAME STATUS:", types_1.GameStatusType[status]);
            switch (status) {
                case types_1.GameStatusType.STOPPED:
                    this.resetGame();
                    break;
                case types_1.GameStatusType.WAITING:
                    break;
                case types_1.GameStatusType.BETTING:
                    break;
                case types_1.GameStatusType.CALCULATING:
                    this.startGame();
                    break;
            }
            this.broadcast("status", { status, dt: this.getDT() });
        }
    }
    getDT() {
        let dt = Date.now() - this.startBetTime - this.timeDiff;
        switch (this.status) {
            case types_1.GameStatusType.WAITING:
                break;
            case types_1.GameStatusType.BETTING:
                dt -= WAIT_TIME;
                break;
            case types_1.GameStatusType.CALCULATING:
                dt -= BETTING_TIME + WAIT_TIME;
                break;
        }
        return dt;
    }
    resetGame() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.Bets = [];
            this.cardData = undefined;
            this.resultData = undefined;
            for (let [userId, sessionId] of this.outUserIds) {
                if (this.users.has(sessionId)) {
                    this.users.delete(sessionId);
                }
                if (this.players.has(userId)) {
                    this.players.delete(userId);
                }
                this.broadcast("out-player", userId);
                this.updatePlayerCount();
                if (this.players.size == 0) {
                    this.autoDispose = true;
                    return;
                }
            }
            const res = yield (0, baccarat_1.getPeriod)(this.realroomId, this.gid);
            const { code, data } = res;
            console.log("get period===>", res);
            if (code === 0) {
                const period = data.period;
                const banker = data.banker;
                this.timeDiff = Date.now() - data.curent * 1000;
                this.startBetTime = period.startBetAt * 1000;
                this.state.period = period.period;
                this.state.round = data.banker.times;
                this.state.roundCount = banker.times > banker.wantTimes ? banker.times : banker.wantTimes;
                this.state.round = banker.times;
                if (banker.uid !== 0) {
                    if (this.state.bankerId !== (0, axios_1.getUserId)(banker.uid)) {
                        if (this.state.bankerId !== "") {
                            this.fetchBankers();
                        }
                        this.state.bankerId = (0, axios_1.getUserId)(banker.uid);
                        if (this.botManager) {
                            this.botManager.bankerAmount = 0;
                        }
                    }
                    this.state.amount = banker.amount + (((_a = this.botManager) === null || _a === void 0 ? void 0 : _a.bankerAmount) || 0);
                }
                else {
                    this.state.bankerId = undefined;
                    this.state.amount = 0;
                    this.state.round = 1;
                }
                this.changeGameStatus(types_1.GameStatusType.WAITING);
            }
            else if (code === 1) {
                setTimeout(() => {
                    this.resetGame();
                }, 2000);
            }
            else if (code === -1) {
                setTimeout(() => {
                    this.fetchBankers();
                }, 2500);
                this.state.bankerId = undefined;
                this.state.amount = 0;
                this.state.round = 1;
            }
        });
    }
    drawGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cardData = undefined;
            const res = yield (0, baccarat_1.drawGame)(this.state.period, this.gid);
            console.log("draw ===> ", this.state.period, res);
            if (res.code == -1) {
                return;
            }
            else if (res.code == 0) {
                if (res.data.period === 0) {
                    return false;
                }
                else {
                    this.cardData = res.data;
                    return;
                }
            }
        });
    }
    startGame() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cardData || this.cardData['status'] == 0) {
                yield this.drawGame();
                if (!this.cardData || this.cardData['status'] == 0) {
                    setTimeout(() => {
                        this.startGame();
                    }, 2000);
                    return;
                }
            }
            ;
            const { id, period, hash, card, bankerSize, userSize, aResult, bResult, cResult, dResult, eResult, status, createdAt, updatedAt } = this.cardData;
            if (status == 2) {
                const resultPlacesByPlayer = {};
                let totalBet = 0;
                let bankerPayout = 0;
                for (const bet of this.Bets) {
                    const chipV = this.chipValues[bet.chip];
                    totalBet += chipV;
                    const payout = chipV * 1;
                    bankerPayout += payout;
                    resultPlacesByPlayer[bet.uid] = resultPlacesByPlayer[bet.uid] || {};
                    resultPlacesByPlayer[bet.uid][bet.place] = (resultPlacesByPlayer[bet.uid][bet.place] || 0) + payout;
                }
                const updatedBalances = [];
                for (const [uid, places] of Object.entries(resultPlacesByPlayer)) {
                    const player = this.players.get(uid);
                    if (player) {
                        for (const [place, amount] of Object.entries(places)) {
                            player.balance += amount;
                        }
                        updatedBalances.push({
                            userId: uid,
                            balance: player.balance
                        });
                    }
                }
                this.resultData = {
                    winSpaces: {
                        winner: "Tie",
                        playerPair: false,
                        bankerPair: false
                    },
                    status: 2,
                    updatedBalances,
                    resultPlacesByPlayer,
                    set: false
                };
                this.broadcast("result", this.resultData);
                return;
            }
            const playerCardData = JSON.parse(userSize);
            const bankerCardData = JSON.parse(bankerSize);
            let playerHand = [];
            let bankerHand = [];
            for (let i = 0; i < 3; i++) {
                let pcard = String(playerCardData[2 + i]);
                if (pcard) {
                    if (i < 2 || playerCardData[5] == "1") {
                        let suitIndex = pcard.slice(0, 1);
                        let rank = pcard.slice(1, 3);
                        playerHand.push({
                            suit: Suits[suitIndex],
                            rank: Number(rank),
                        });
                    }
                }
                let bcard = String(bankerCardData[2 + i]);
                if (bcard) {
                    if (i < 2 || bankerCardData[5] == "1") {
                        let suitIndex = bcard.slice(0, 1);
                        let rank = bcard.slice(1, 3);
                        bankerHand.push({
                            suit: Suits[suitIndex],
                            rank: Number(rank)
                        });
                    }
                }
            }
            // this.gameLogic.initGame((playerHand, bankerHand) => {
            const winner = this.gameLogic.determineWinner(playerHand, bankerHand);
            const { playerPair, bankerPair } = this.gameLogic.checkPairs(playerHand, bankerHand);
            const resultPlacesByPlayer = {};
            let totalBet = 0;
            let bankerPayout = 0;
            for (const bet of this.Bets) {
                let isWin = false;
                if (bet.place === winner)
                    isWin = true;
                if (bet.place === "PPair" && playerPair)
                    isWin = true;
                if (bet.place === "BPair" && bankerPair)
                    isWin = true;
                const chipV = this.chipValues[bet.chip];
                totalBet += chipV;
                if (isWin) {
                    const payout = chipV * multipliers[bet.place];
                    bankerPayout += payout;
                    resultPlacesByPlayer[bet.uid] = resultPlacesByPlayer[bet.uid] || {};
                    resultPlacesByPlayer[bet.uid][bet.place] = (resultPlacesByPlayer[bet.uid][bet.place] || 0) + payout;
                }
            }
            let bankerProfit = totalBet - bankerPayout;
            const updatedBalances = [];
            for (const [uid, places] of Object.entries(resultPlacesByPlayer)) {
                const player = this.players.get(uid);
                if (player) {
                    for (const [place, amount] of Object.entries(places)) {
                        player.balance += amount;
                        if (player.isBot && this.botManager) {
                            this.botManager.bankerAmount -= amount;
                        }
                    }
                    updatedBalances.push({
                        userId: uid,
                        balance: player.balance
                    });
                }
            }
            this.resultData = {
                winSpaces: {
                    winner,
                    playerPair,
                    bankerPair
                },
                playerHand,
                bankerHand,
                resultPlacesByPlayer,
                updatedBalances,
                totalBet,
                bankerProfit,
                status,
                set: false
            };
            setTimeout(() => {
                this.broadcast("result", this.resultData);
            }, 1500);
            // });
        });
    }
    fetchBankers() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const res = yield (0, baccarat_1.getBankers)(1, 10, this.realroomId, this.gid);
            if (res.code === 0) {
                console.log(res.data);
                if ((_a = res.data) === null || _a === void 0 ? void 0 : _a.list) {
                    this.bankers = res.data.list.map((b) => {
                        const newBanker = new types_1.Banker();
                        newBanker.id = b.id;
                        newBanker.uid = (0, axios_1.getUserId)(b.uid);
                        newBanker.amount = b.amount;
                        newBanker.roomId = b.roomId;
                        newBanker.username = b.username;
                        newBanker.status = b.status;
                        newBanker.wantTimes = b.wantTimes;
                        newBanker.wantAmount = b.wantAmount;
                        newBanker.startPeriod = b.startPeriod;
                        newBanker.createdAt = b.createdAt;
                        newBanker.total = b.total;
                        return newBanker;
                    });
                    this.broadcast("bankers", this.bankers.map(b => b.getInfo()));
                }
            }
        });
    }
}
exports.GameRoom = GameRoom;
