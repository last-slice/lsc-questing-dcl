"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileExists = void 0;
exports.resetAllProfiles = resetAllProfiles;
exports.resetAllBlitzProfiles = resetAllBlitzProfiles;
const cache_1 = require("./cache");
const initializer_1 = require("./initializer");
const profileExists = (options) => {
    const { userId, ipAddress } = options;
    const profiles = (0, cache_1.getCache)(initializer_1.PROFILES_CACHE_KEY);
    return profiles.find((profile) => profile.ethAddress === userId && profile.ipAddress === ipAddress);
};
exports.profileExists = profileExists;
function resetAllProfiles() {
    let profiles = (0, cache_1.getCache)(initializer_1.PROFILES_CACHE_KEY);
    profiles.forEach((profile) => {
        profile.deployments = 0,
            profile.dust = 0,
            profile.goals = 0,
            profile.wins = 0,
            profile.losses = 0,
            profile.distance = 0,
            profile.blitzPlays = 0,
            profile.arcadePlays = 0;
    });
}
function resetAllBlitzProfiles() {
    let profiles = (0, cache_1.getCache)(initializer_1.PROFILES_CACHE_KEY);
    profiles.forEach((profile) => {
        profile.goals = 0,
            profile.wins = 0,
            profile.losses = 0,
            profile.distance = 0,
            profile.blitzPlays = 0,
            profile.arcadePlays = 0;
    });
}
