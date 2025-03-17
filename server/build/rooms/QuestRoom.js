"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestRoom = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
// Each task in the quest is represented in state
class TaskState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.taskId = '';
        this.completed = false;
        // For open-ended tasks, each time a user triggers it, we increment "count"
        // If the quest is truly open-ended, "completed" may never become "true."
        this.count = 0;
    }
}
__decorate([
    (0, schema_1.type)('string')
], TaskState.prototype, "taskId", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], TaskState.prototype, "completed", void 0);
__decorate([
    (0, schema_1.type)('number')
], TaskState.prototype, "count", void 0);
class QuestState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.questId = '';
        this.questType = ''; // e.g. "LINEAR" or "OPEN_ENDED"
        // Map of taskId -> TaskState
        this.tasks = new schema_1.MapSchema();
        // For open-ended, we might also track if the quest is forcibly ended.
        this.questFinished = false;
    }
}
__decorate([
    (0, schema_1.type)('string')
], QuestState.prototype, "questId", void 0);
__decorate([
    (0, schema_1.type)('string')
], QuestState.prototype, "questType", void 0);
__decorate([
    (0, schema_1.type)({ map: TaskState })
], QuestState.prototype, "tasks", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], QuestState.prototype, "questFinished", void 0);
class QuestRoom extends colyseus_1.Room {
    onCreate(options) {
        // Pull in the master data
        this.questsById = options.questsById;
        // Initialize the state
        this.setState(new QuestState());
        console.log("QuestRoom created with filter questId. Options:", options);
        this.loadQuest(options.questId);
        /**
         * If we want to force a single "questId" to be set at the time the room is created,
         * we can do it here. Usually, the "filterBy()" approach means the first client who
         * tries to create the room will pass "questId", so we can store it in onJoin.
         * Alternatively, we can do:
         *
         * if (options.questId) {
         *   this.loadQuest(options.questId);
         * }
         *
         * But often we wait for the first client’s onJoin, or we do a .on("create", ...) in
         * the server to pass questId. We'll do it in onJoin below.
         */
        this.onMessage("quest_message", (client, message) => { this.handleQuestMessage(client, message); });
    }
    onJoin(client, options) {
        console.log(`Client joined, sessionId=${client.sessionId}, questId=${options.questId}`);
        if (options.questId && !this.state.questId) {
            this.loadQuest(options.questId);
        }
    }
    loadQuest(questId) {
        const questData = this.questsById.get(questId);
        if (!questData) {
            console.error("No quest found for questId=", questId);
            return;
        }
        this.questData = questData;
        // Set the schema fields
        this.state.questId = questData.questId;
        this.state.questType = questData.questType || "LINEAR";
        // Initialize tasks
        if (Array.isArray(questData.tasks)) {
            questData.tasks.forEach((t) => {
                // Create a TaskState for each
                const taskState = new TaskState();
                taskState.taskId = t.taskId;
                // If the quest is "OPEN_ENDED," we might rely on "count" instead of "completed"
                // But you can still keep "completed" around for potential future logic
                this.state.tasks.set(t.taskId, taskState);
            });
        }
        console.log(`Loaded quest [${questId}] with type=${this.state.questType}`);
    }
    onLeave(client, consented) {
        console.log(`Client left: ${client.sessionId} (consented=${consented})`);
        // Clean up if needed
    }
    // Helper for linear quests
    checkIfAllTasksCompleted() {
        const allComplete = Array.from(this.state.tasks.values()).every(t => t.completed);
        if (allComplete) {
            this.state.questFinished = true;
            this.broadcast('QUEST_COMPLETED', { questId: this.state.questId });
        }
    }
    handleQuestMessage(client, message) {
        const { type, payload } = message;
        switch (type) {
            /**
             * "SET_QUEST" is optional. If your front-end doesn't pass questId in onJoin,
             * you could let them pick a quest after they've joined.
             */
            case 'SET_QUEST': {
                const { questId } = payload;
                this.loadQuest(questId);
                break;
            }
            /**
             * For linear tasks, if a user "completes" it, we mark it completed.
             * Then we check if all tasks are done => the quest ends automatically.
             */
            case 'COMPLETE_TASK': {
                if (this.state.questType !== 'LINEAR') {
                    console.warn("COMPLETE_TASK called, but quest type isn't LINEAR");
                    return;
                }
                const { taskId } = payload;
                const task = this.state.tasks.get(taskId);
                if (task && !task.completed) {
                    task.completed = true;
                    this.broadcast('TASK_COMPLETED', { taskId });
                    this.checkIfAllTasksCompleted();
                }
                break;
            }
            /**
             * For open-ended tasks, each time a user triggers it, we increment "count."
             * This might be something like "COLLECT_ITEM" => increment the count on that task.
             */
            case 'RECORD_OPEN_TASK': {
                if (this.state.questType !== 'OPEN_ENDED') {
                    console.warn("RECORD_OPEN_TASK called, but quest type isn't OPEN_ENDED");
                    return;
                }
                const { taskId } = payload;
                const task = this.state.tasks.get(taskId);
                if (task) {
                    task.count += 1;
                    // Optionally broadcast scoreboard info to everyone
                    this.broadcast('TASK_COUNT_UPDATED', { taskId, newCount: task.count });
                }
                break;
            }
            /**
             * For open-ended quests, the quest creator (or admin) can decide to end it
             * at any time, awarding the "highest count" task or summing across tasks, etc.
             */
            case 'END_QUEST': {
                if (this.state.questType !== 'OPEN_ENDED') {
                    console.warn("END_QUEST called, but quest type isn't OPEN_ENDED");
                    return;
                }
                this.state.questFinished = true;
                // Determine a "winner" if there's only 1 open-ended task
                // or if you want the sum of counts across multiple tasks
                let topCount = -Infinity;
                let topTaskId = null;
                this.state.tasks.forEach((task) => {
                    if (task.count > topCount) {
                        topCount = task.count;
                        topTaskId = task.taskId;
                    }
                });
                this.broadcast('QUEST_ENDED', {
                    questId: this.state.questId,
                    topTaskId,
                    topCount
                });
                break;
            }
            default:
                console.log(`Unknown message type: ${type}`, message);
        }
    }
}
exports.QuestRoom = QuestRoom;
