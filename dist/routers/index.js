"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const auth_1 = require("./auth");
const auth2_1 = require("./auth2");
const niuniu_1 = require("./niuniu");
const router = express.Router();
router.use("/auth", auth_1.default);
router.use("/auth2", auth2_1.default);
router.use("/niuniu", niuniu_1.default);
exports.default = router;
