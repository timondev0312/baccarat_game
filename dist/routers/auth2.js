"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const auth2_1 = require("../controllers/auth/auth2");
const router = express.Router();
router.get("/authorize", auth2_1.getToken);
router.get("/userinfo", auth2_1.userinfo);
exports.default = router;
