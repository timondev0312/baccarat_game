"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
require("dotenv/config");
const express = require("express");
const ws_transport_1 = require("@colyseus/ws-transport");
const colyseus_1 = require("colyseus");
const BaccaratGameRoom_1 = require("./games/BaccaratGameRoom");
const monitor_1 = require("@colyseus/monitor");
const cors = require("cors");
const compression = require("compression");
const routers_1 = require("./routers");
const config = require("../config");
const app = express();
const port = process.env.PORT || 2567;
app.use(compression());
app.use(express.json());
app.use(cors({
    origin: "*", // Allow only your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Add other methods if needed
    credentials: true, // If you want to allow credentials (cookies, authorization headers, etc.)
}));
app.use("/colyseus", (0, monitor_1.monitor)());
app.use("/api", routers_1.default);
app.use(express.static(`${config.DIR}/public`));
const gameServer = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({
        server: app.listen(port),
    }),
});
const initServer = (callback) => {
    try {
        gameServer.define("baccarat", BaccaratGameRoom_1.GameRoom).filterBy(['room_id']);
        callback && callback(null);
    }
    catch (error) {
        callback && callback(error);
    }
};
exports.initServer = initServer;
(0, exports.initServer)((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`Listening on ws://localhost:${port}`);
    }
});
