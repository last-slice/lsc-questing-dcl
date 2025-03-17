"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@colyseus/tools");
const app_config_1 = __importDefault(require("./app.config"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, tools_1.listen)(app_config_1.default, parseInt(process.env.PORT));
