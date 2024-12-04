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
exports.drawGame = exports.placeBet = exports.cancelBanker = exports.overBanker = exports.startBanker = exports.grabBanker = exports.getBankers = exports.getPeriod = void 0;
const axios_1 = require("../../utils/axios");
/**
 *
 * @param roomId
 * @param access_token
 * @returns
 */
const getPeriod = (roomId, gid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/get-period", { roomId, gid });
        return data;
    }
    catch (error) {
        console.log(error);
        return { code: -1 };
    }
});
exports.getPeriod = getPeriod;
const getBankers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page_num = 1, limit = 10) {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/banker-list", { page_num, limit });
        return data;
    }
    catch (error) {
        return { code: -1 };
    }
});
exports.getBankers = getBankers;
/**
 * 用户申请上庄
 * @param roomId :1, 房间id
 * @param amount:10000 申请金额，需要转化为整数，即实际金额乘以100
 * @returns
 */
const grabBanker = (roomId, amount, access_token, wantTimes, wantAmount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/grab-banker", {
            roomId,
            amount,
            wantTimes,
            wantAmount
        }, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });
        console.log(roomId, data);
        return data;
    }
    catch (error) {
        console.log(error);
        return { code: -1 };
    }
});
exports.grabBanker = grabBanker;
/**
 * 用户开始做庄
 * @param id 抢庄id
 * @param preiod :202405160001 当前期数
 * @returns
 */
const startBanker = (id, preiod, access_token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/start-banker", {
            id,
            StartPeriod: preiod
        }, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });
        console.log("start banker", data);
        return data;
    }
    catch (error) {
        console.log("start banker error=>", error);
        return { code: -1 };
    }
});
exports.startBanker = startBanker;
/**
 * 结束抢庄
 * @param id : 12,    抢庄id
 * @param period : 202405160001 当前期数
 * @returns
 */
const overBanker = (id, period, access_token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/over-banker", {
            id,
            period
        }, { headers: { "Authorization": `Bearer ${access_token}` } });
        console.log("over banker", data);
        return data;
    }
    catch (error) {
        console.log("over banker error", error);
        return { code: -1 };
    }
});
exports.overBanker = overBanker;
/**
 * 用户抢庄还没有开始的时候可以取消
 * @param id 12,    抢庄id
 * @param period :202405160001 当前期数
 * @returns
 */
const cancelBanker = (id, period, access_token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/cancel-banker", {
            id,
            period
        }, { headers: { "Authorization": `Bearer ${access_token}` } });
        console.log("cancel banker", data);
        return data;
    }
    catch (error) {
        console.log("cancel banker error", error);
        return { code: -1 };
    }
});
exports.cancelBanker = cancelBanker;
/**
 * @param roomId
 * @param period
 * @param gid
 * @param content
 * @param amount
 * @returns
 */
const placeBet = (roomId, period, gid, content, amount, access_token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/bet", {
            roomId,
            period,
            gid,
            content,
            amount
        }, { headers: { "Authorization": `Bearer ${access_token}` } });
        console.log("place a bet", data);
        return data;
    }
    catch (error) {
        console.log("bet place error", error);
        return { code: -1 };
    }
});
exports.placeBet = placeBet;
const drawGame = (period) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/cocos/niu/draw", {
            period
        });
        return data;
    }
    catch (error) {
        console.log(error);
        return { code: -1 };
    }
});
exports.drawGame = drawGame;
