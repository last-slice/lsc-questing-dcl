"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("@colyseus/tools"));
const monitor_1 = require("@colyseus/monitor");
const playground_1 = require("@colyseus/playground");
const ws_transport_1 = require("@colyseus/ws-transport");
const cors_1 = __importDefault(require("cors"));
const initializer_1 = require("./utils/initializer");
const router_1 = require("./router");
const QuestRoom_1 = require("./rooms/QuestRoom");
exports.default = (0, tools_1.default)({
    initializeGameServer: (gameServer) => {
        (0, initializer_1.initServer)();
        gameServer.define('angzaar_questing', QuestRoom_1.QuestRoom);
    },
    initializeTransport: function (opts) {
        return new ws_transport_1.WebSocketTransport({
            ...opts,
            pingInterval: 6000,
            pingMaxRetries: 4,
            maxPayload: 1024 * 1024 * 300, // 300MB Max Payload
        });
    },
    initializeExpress: (app) => {
        // app.use(bodyParser.json({ limit: '300mb' }));
        // app.use(bodyParser.urlencoded({limit: '300mb', extended: true }));
        app.use((0, cors_1.default)({ origin: true }));
        app.options('*', (0, cors_1.default)());
        app.use('/colyseus', (0, monitor_1.monitor)());
        app.use("/playground", playground_1.playground);
        // app.use((req:any, res:any, next) => {
        //   console.log("Headers:", req.headers);
        //   console.log("Body:", req.body);
        //   console.log("Files:", req.files);
        //   next();
        // });
        app.use("/", router_1.router);
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
