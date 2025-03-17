"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.executeCloudScript = exports.getAllPlayers = exports.updatePlayerInternalData = exports.updatePlayerDisplayName = exports.getPlayerInternalData = exports.getPlayerData = exports.updatePlayerData = exports.playerLogin = exports.UpdateCatalogItems = exports.setCatalogItems = exports.getCatalogItems = exports.setTitleData = exports.getTitleData = exports.getEnemies = exports.getItem = exports.updatePlayerItem = exports.addItem = exports.revokeUserItem = exports.consumeItem = exports.updateItemUses = exports.grantUserItem = exports.incrementPlayerStatistic = exports.getPlayerStatistics = exports.getPlayerFiles = exports.updatePlayerStatistic = exports.updatePlayerStatisticDefinition = exports.addEvent = exports.getDropTables = exports.getRandomItemFromDropTable = exports.getStoreItems = exports.getLimitedItemCount = void 0;
exports.initPlayfab = initPlayfab;
exports.addPlayfabEvent = addPlayfabEvent;
const playfab_sdk_1 = require("playfab-sdk");
//Test Data
const playFabTitleId = process.env.PLAYFAB_ID;
const playFabSecretKey = process.env.PLAYFAB_KEY;
// Initialize the PlayFab client
playfab_sdk_1.PlayFabServer.settings.titleId = playFabTitleId;
playfab_sdk_1.PlayFabServer.settings.developerSecretKey = playFabSecretKey;
playfab_sdk_1.PlayFabData.settings.titleId = playFabTitleId;
playfab_sdk_1.PlayFabData.settings.developerSecretKey = playFabSecretKey;
playfab_sdk_1.PlayFabAdmin.settings.titleId = playFabTitleId;
playfab_sdk_1.PlayFabAdmin.settings.developerSecretKey = playFabSecretKey;
let eventQueue = [];
let postingEvents = false;
let eventInterval;
function initPlayfab() {
    eventInterval = setInterval(async () => {
        checkEventQueue();
    }, 1000 * 5);
}
function addPlayfabEvent(event) {
    if (process.env.ENV === "Production") {
        eventQueue.push(event);
    }
}
async function checkEventQueue() {
    if (!postingEvents && eventQueue.length > 0) {
        postingEvents = true;
        let event = eventQueue.shift();
        event.PlayFabId = process.env.PLAYFAB_DATA_ACCOUNT;
        console.log('event queue has item, post to playfab', event.EventName);
        try {
            await (0, exports.addEvent)(event);
            postingEvents = false;
        }
        catch (e) {
            console.log('error posting event', e);
            postingEvents = false;
        }
    }
}
const c = (resolve, reject) => {
    return (error, result) => {
        if (error) {
            console.log("PlayFab Error", error);
            console.log("PlayFab Result", result);
            reject(error);
        }
        else {
            resolve(result.data);
        }
    };
};
const getLimitedItemCount = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.CheckLimitedEditionItemAvailability(request, c(resolve, reject));
    });
};
exports.getLimitedItemCount = getLimitedItemCount;
const getStoreItems = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetStoreItems(request, c(resolve, reject));
    });
};
exports.getStoreItems = getStoreItems;
const getRandomItemFromDropTable = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.EvaluateRandomResultTable(request, c(resolve, reject));
    });
};
exports.getRandomItemFromDropTable = getRandomItemFromDropTable;
const getDropTables = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetRandomResultTables(request, c(resolve, reject));
    });
};
exports.getDropTables = getDropTables;
const addEvent = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.WritePlayerEvent(request, c(resolve, reject));
    });
};
exports.addEvent = addEvent;
const updatePlayerStatisticDefinition = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdatePlayerStatisticDefinition(request, c(resolve, reject));
    });
};
exports.updatePlayerStatisticDefinition = updatePlayerStatisticDefinition;
const updatePlayerStatistic = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdatePlayerStatistics(request, c(resolve, reject));
    });
};
exports.updatePlayerStatistic = updatePlayerStatistic;
const getPlayerFiles = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabData.GetFiles(request, c(resolve, reject));
    });
};
exports.getPlayerFiles = getPlayerFiles;
const getPlayerStatistics = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetPlayerStatistics(request, c(resolve, reject));
    });
};
exports.getPlayerStatistics = getPlayerStatistics;
const incrementPlayerStatistic = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.IncrementPlayerStatisticVersion(request, c(resolve, reject));
    });
};
exports.incrementPlayerStatistic = incrementPlayerStatistic;
const grantUserItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GrantItemsToUser(request, c(resolve, reject));
    });
};
exports.grantUserItem = grantUserItem;
const updateItemUses = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.ModifyItemUses(request, c(resolve, reject));
    });
};
exports.updateItemUses = updateItemUses;
const consumeItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabClient.ConsumeItem(request, c(resolve, reject));
    });
};
exports.consumeItem = consumeItem;
const revokeUserItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.RevokeInventoryItem(request, c(resolve, reject));
    });
};
exports.revokeUserItem = revokeUserItem;
const addItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdateCatalogItems(request, c(resolve, reject));
    });
};
exports.addItem = addItem;
const updatePlayerItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdateUserInventoryItemCustomData(request, c(resolve, reject));
    });
};
exports.updatePlayerItem = updatePlayerItem;
const getItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetCatalogItems(request, c(resolve, reject));
    });
};
exports.getItem = getItem;
const getEnemies = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetCatalogItems(request, c(resolve, reject));
    });
};
exports.getEnemies = getEnemies;
const getTitleData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetTitleData(request, c(resolve, reject));
    });
};
exports.getTitleData = getTitleData;
const setTitleData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.SetTitleData(request, c(resolve, reject));
    });
};
exports.setTitleData = setTitleData;
const getCatalogItems = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetCatalogItems(request, c(resolve, reject));
    });
};
exports.getCatalogItems = getCatalogItems;
const setCatalogItems = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.SetCatalogItems(request, c(resolve, reject));
    });
};
exports.setCatalogItems = setCatalogItems;
const UpdateCatalogItems = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdateCatalogItems(request, c(resolve, reject));
    });
};
exports.UpdateCatalogItems = UpdateCatalogItems;
const playerLogin = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.LoginWithServerCustomId(request, c(resolve, reject));
    });
};
exports.playerLogin = playerLogin;
const updatePlayerData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdateUserData(request, c(resolve, reject));
    });
};
exports.updatePlayerData = updatePlayerData;
const getPlayerData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetUserData(request, c(resolve, reject));
    });
};
exports.getPlayerData = getPlayerData;
const getPlayerInternalData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetUserInternalData(request, c(resolve, reject));
    });
};
exports.getPlayerInternalData = getPlayerInternalData;
const updatePlayerDisplayName = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdateUserTitleDisplayName(request, c(resolve, reject));
    });
};
exports.updatePlayerDisplayName = updatePlayerDisplayName;
const updatePlayerInternalData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdateUserInternalData(request, c(resolve, reject));
    });
};
exports.updatePlayerInternalData = updatePlayerInternalData;
const getAllPlayers = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetPlayersInSegment(request, c(resolve, reject));
    });
};
exports.getAllPlayers = getAllPlayers;
const executeCloudScript = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.ExecuteCloudScript(request, c(resolve, reject));
    });
};
exports.executeCloudScript = executeCloudScript;
const getLeaderboard = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetLeaderboard(request, c(resolve, reject));
    });
};
exports.getLeaderboard = getLeaderboard;
