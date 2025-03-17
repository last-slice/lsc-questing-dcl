"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheSyncToFile = exports.updateCache = exports.getCache = exports.loadCache = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cache = new Map();
// Utility to load data into cache
const loadCache = (filePath, key) => {
    try {
        const data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(filePath), "utf-8"));
        cache.set(key, data);
        return data;
    }
    catch (error) {
        console.error(`Error loading cache for ${key} from ${filePath}:`, error);
        throw new Error("Failed to initialize cache.");
    }
};
exports.loadCache = loadCache;
// Utility to get data from cache
const getCache = (key) => {
    if (!cache.has(key)) {
        throw new Error(`Cache miss for key: ${key}`);
    }
    return cache.get(key);
};
exports.getCache = getCache;
// Utility to update cache and sync to file
const updateCache = async (filePath, key, data) => {
    cache.set(key, data); // Update cache
};
exports.updateCache = updateCache;
const cacheSyncToFile = async (filePath, key, data) => {
    try {
        if (cache.has(key)) {
            const data = cache.get(key);
            fs_1.default.writeFileSync(path_1.default.resolve(filePath), JSON.stringify(data, null, 2));
        }
    }
    catch (error) {
        console.error(`Error writing ${key} to file: ${filePath}`, error);
        throw new Error("Failed to sync cache to file.");
    }
};
exports.cacheSyncToFile = cacheSyncToFile;
