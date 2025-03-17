"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATES_FILE_CACHE_KEY = exports.PROFILES_CACHE_KEY = exports.TEMPLATES_FILE = exports.PROFILES_FILE = exports.DATA_LOCATION = void 0;
exports.initServer = initServer;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cache_1 = require("./cache");
const Playfab_1 = require("./Playfab");
dotenv_1.default.config();
exports.DATA_LOCATION = process.env.ENV === "Development" ? process.env.DEV_DATA_DIR : process.env.PROD_DATA_DIR;
exports.PROFILES_FILE = path_1.default.join(exports.DATA_LOCATION, process.env.PROFILES_FILE);
exports.TEMPLATES_FILE = path_1.default.join(exports.DATA_LOCATION, process.env.TEMPLATES_FILE);
exports.PROFILES_CACHE_KEY = process.env.PROFILE_CACHE_KEY;
exports.TEMPLATES_FILE_CACHE_KEY = process.env.TEMPLATES_FILE_CACHE_KEY;
function initServer() {
    (0, Playfab_1.initPlayfab)();
    // Initialize cache
    (0, cache_1.loadCache)(exports.PROFILES_FILE, exports.PROFILES_CACHE_KEY);
    (0, cache_1.loadCache)(exports.TEMPLATES_FILE, exports.TEMPLATES_FILE_CACHE_KEY);
    // Save cache to disk periodically
    setInterval(async () => {
        const profiles = (0, cache_1.getCache)(exports.PROFILES_CACHE_KEY);
        const templates = (0, cache_1.getCache)(exports.TEMPLATES_FILE);
        await (0, cache_1.cacheSyncToFile)(exports.PROFILES_FILE, exports.PROFILES_CACHE_KEY, profiles);
        await (0, cache_1.cacheSyncToFile)(exports.TEMPLATES_FILE, exports.TEMPLATES_FILE, templates);
    }, Number(process.env.CACHE_REFRESH_INTERVAL_S) * 1000);
}
