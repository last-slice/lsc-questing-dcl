import dotenv from "dotenv";
import path from "path";
import { cacheSyncToFile, getCache, loadCache, updateCache } from "./cache";
import { initPlayfab } from "./Playfab";

dotenv.config();

export const DATA_LOCATION = process.env.ENV === "Development" ? process.env.DEV_DATA_DIR : process.env.PROD_DATA_DIR

export const PROFILES_FILE = path.join(DATA_LOCATION, process.env.PROFILES_FILE )
export const TEMPLATES_FILE = path.join(DATA_LOCATION, process.env.TEMPLATES_FILE)

export const PROFILES_CACHE_KEY = process.env.PROFILE_CACHE_KEY
export const TEMPLATES_FILE_CACHE_KEY = process.env.TEMPLATES_FILE_CACHE_KEY

export function initServer(){
    initPlayfab()

    // Initialize cache
    loadCache(PROFILES_FILE, PROFILES_CACHE_KEY);
    loadCache(TEMPLATES_FILE, TEMPLATES_FILE_CACHE_KEY);

    // Save cache to disk periodically
    setInterval(async () => {
        const profiles = getCache(PROFILES_CACHE_KEY);
        const templates = getCache(TEMPLATES_FILE_CACHE_KEY);

        await cacheSyncToFile(PROFILES_FILE, PROFILES_CACHE_KEY, profiles);
        await cacheSyncToFile(TEMPLATES_FILE, TEMPLATES_FILE_CACHE_KEY, templates);
    }, Number(process.env.CACHE_REFRESH_INTERVAL_S) * 1000);
}