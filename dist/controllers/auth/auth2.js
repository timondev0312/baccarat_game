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
exports.userinfo = exports.getToken = exports.getUserInfo = exports.authorize = void 0;
const axios_1 = require("../../utils/axios");
const authorize = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.axios.post("/oauth2/code", {
            code: code,
            client_id: "4"
        }, { headers: { "Content-Type": "application/json" }, responseType: "json" });
        return data;
    }
    catch (error) {
        console.log(error);
    }
    return { code: -1 };
});
exports.authorize = authorize;
const getUserInfo = (code, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authkey = `${type} ${code}`;
        const { data } = yield axios_1.axios.post("/cocos/user/info", {}, {
            headers: {
                Authorization: authkey,
                "Content-Type": "application/json",
                "Accept": "*/*"
            }
        });
        return data;
    }
    catch (error) {
        console.log("userinfo", error);
    }
    return { code: -1 };
});
exports.getUserInfo = getUserInfo;
const getToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    const result = yield (0, exports.authorize)(code);
    res.json(result);
});
exports.getToken = getToken;
const userinfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    const result = yield (0, exports.getUserInfo)(token, "Bearer");
    res.json(result);
});
exports.userinfo = userinfo;
