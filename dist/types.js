"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rank = exports.Suit = exports.Banker = exports.Player = exports.GameState = exports.GameStatusType = void 0;
const schema_1 = require("@colyseus/schema");
var GameStatusType;
(function (GameStatusType) {
    GameStatusType[GameStatusType["STOPPED"] = 0] = "STOPPED";
    GameStatusType[GameStatusType["WAITING"] = 1] = "WAITING";
    GameStatusType[GameStatusType["BETTING"] = 2] = "BETTING";
    GameStatusType[GameStatusType["CALCULATING"] = 3] = "CALCULATING";
})(GameStatusType || (exports.GameStatusType = GameStatusType = {}));
class GameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.period = 0;
        this.bankerId = undefined;
        this.amount = 0;
        this.round = 0;
        this.roundCount = 0;
    }
}
exports.GameState = GameState;
__decorate([
    (0, schema_1.type)("number")
], GameState.prototype, "period", void 0);
__decorate([
    (0, schema_1.type)("string")
], GameState.prototype, "bankerId", void 0);
__decorate([
    (0, schema_1.type)("number")
], GameState.prototype, "amount", void 0);
__decorate([
    (0, schema_1.type)("number")
], GameState.prototype, "round", void 0);
__decorate([
    (0, schema_1.type)("number")
], GameState.prototype, "roundCount", void 0);
class Player {
    constructor() {
        this.uid = "";
        this.username = "";
        this.nickname = "";
        this.balance = 0;
        this.avatar = "default";
        this.VIP = 0;
        this.access_token = "";
        this.ip = "";
        this.isBot = false;
    }
    getInfo() {
        return {
            userId: this.uid,
            username: this.username,
            nickname: this.nickname,
            avatar: this.avatar,
            balance: this.balance,
            VIP: this.VIP,
        };
    }
}
exports.Player = Player;
class Banker {
    getInfo() {
        return {
            id: this.id,
            userId: this.uid,
            amount: this.amount,
            username: this.username,
            total: this.total,
            status: this.status,
            wantAmount: this.wantAmount,
            wantTimes: this.wantTimes,
            createdAt: this.createdAt,
        };
    }
}
exports.Banker = Banker;
var Suit;
(function (Suit) {
    Suit[Suit["Diamonds"] = 0] = "Diamonds";
    Suit[Suit["Clubs"] = 1] = "Clubs";
    Suit[Suit["Hearts"] = 2] = "Hearts";
    Suit[Suit["Spades"] = 3] = "Spades";
})(Suit || (exports.Suit = Suit = {}));
var Rank;
(function (Rank) {
    Rank[Rank["Ace"] = 1] = "Ace";
    Rank[Rank["Two"] = 2] = "Two";
    Rank[Rank["Three"] = 3] = "Three";
    Rank[Rank["Four"] = 4] = "Four";
    Rank[Rank["Five"] = 5] = "Five";
    Rank[Rank["Six"] = 6] = "Six";
    Rank[Rank["Seven"] = 7] = "Seven";
    Rank[Rank["Eight"] = 8] = "Eight";
    Rank[Rank["Nine"] = 9] = "Nine";
    Rank[Rank["Ten"] = 10] = "Ten";
    Rank[Rank["Jack"] = 11] = "Jack";
    Rank[Rank["Queen"] = 12] = "Queen";
    Rank[Rank["King"] = 13] = "King";
})(Rank || (exports.Rank = Rank = {}));
