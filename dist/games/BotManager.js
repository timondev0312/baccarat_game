"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotManager = void 0;
const types_1 = require("../types");
class BotManager {
    constructor(room, places) {
        this.botCount = 0;
        this.status = false;
        this.bankerAmount = 0;
        this.places = [];
        this.room = room;
        this.places = places;
        room.onMessage("add-bot", (client, data) => {
            this.addBot(data.count);
        });
        room.onMessage("remove-bot", (client, data) => {
            this.removeBot(data.id);
        });
        room.onMessage("clear-bots", (client) => {
            this.clearBots();
        });
        room.onMessage("stop-bot", (client) => {
            this.status = false;
        });
        room.onMessage("play-bot", (client) => {
            this.status = true;
        });
        this.status = true;
    }
    addBot(botCount) {
        this.botCount += botCount;
        for (let i = 0; i < botCount; i++) {
            const botId = `bot-${Date.now()}-${i}`;
            const botPlayer = new types_1.Player();
            botPlayer.uid = botId;
            botPlayer.username = `Bot_${i + 1}`;
            botPlayer.nickname = `Bot_${i + 1}`;
            botPlayer.avatar = "default";
            botPlayer.VIP = 0;
            botPlayer.isBot = true;
            botPlayer.balance = Math.floor(Math.random() * 100000) + 100000; // Initial bot balance
            this.room.players.set(botId, botPlayer);
            this.room.broadcast("join-player", botPlayer.getInfo());
            this.room.updatePlayerCount();
        }
    }
    removeBot(id) {
        this.room.players.forEach((p) => {
            if (p.isBot && p.uid === id) {
                this.room.outUserIds.set(p.uid, p.uid);
            }
        });
    }
    performBotActions() {
        if (this.room.status === types_1.GameStatusType.BETTING) {
            this.room.players.forEach((bot) => {
                if (bot.isBot && this.status && Math.random() > 0.7) {
                    setTimeout(() => {
                        const randomChipIndex = Math.floor(Math.random() * this.room.chipValues.length);
                        const randomPlaceIndex = Math.floor(Math.random() * this.places.length);
                        const chip = this.room.chipValues[randomChipIndex];
                        const place = this.places[randomPlaceIndex];
                        if (bot.balance >= chip) {
                            bot.balance -= chip;
                            this.bankerAmount += chip;
                            this.room.Bets.push({ uid: bot.uid, chip: randomChipIndex, place: place });
                            this.room.broadcast("bet-place", {
                                chip: randomChipIndex,
                                place: place,
                                uid: bot.uid,
                                balance: bot.balance,
                            });
                        }
                        else {
                            bot.balance = Math.floor(Math.random() * 100000) + 100000; // Initial bot balance
                        }
                    }, Math.floor(Math.random() * 5000));
                }
            });
        }
    }
    clearBots() {
        this.room.players.forEach((p) => {
            if (p.isBot) {
                this.room.outUserIds.set(p.uid, p.uid);
            }
        });
    }
}
exports.BotManager = BotManager;
