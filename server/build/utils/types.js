"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = exports.messageDeployType = exports.messageDomain = void 0;
// Define the domain and types for EIP-712
exports.messageDomain = {
    name: "AngzaarPlazaDeployment",
    version: "1",
    chainId: 1,
};
exports.messageDeployType = {
    Deploy: [
        { name: "message", type: "string" },
        { name: "deployHash", type: "string" },
    ],
};
var Blockchain;
(function (Blockchain) {
    Blockchain["ETHEREUM"] = "ethereum";
    Blockchain["POLYGON"] = "matic";
    Blockchain["SOLANA"] = "solana";
})(Blockchain || (exports.Blockchain = Blockchain = {}));
