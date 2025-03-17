"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const admin_1 = require("./admin");
const api_1 = require("./api");
exports.router = express_1.default.Router();
(0, admin_1.adminRouter)(exports.router);
(0, api_1.apiRouter)(exports.router);
exports.router.get("/hello-world", async function (req, res) {
    console.log('hello world');
    res.status(200).json({ result: "hello world" });
});
