import { Vector3 } from '@dcl/sdk/math';
import { Room } from 'colyseus.js';
import './polyfill';
export declare const lscQuestEvent: import("mitt").Emitter<Record<import("mitt").EventType, unknown>>;
export declare enum LSCQUEST_EVENTS {
    QUEST_CONNECTION = "QUEST_CONNECTION",
    QUEST_ERROR = "QUEST_ERROR",
    QUEST_DATA = "QUEST_DATA",
    QUEST_STARTED = "QUEST_STARTED",
    QUEST_COMPLETE = "QUEST_COMPLETE",
    QUEST_END = "QUEST_END",
    QUEST_UPDATE = "QUEST_UPDATE",
    QUEST_DISCONNECT = "QUEST_DISCONNECT",
    QUEST_ACTION = "QUEST_ACTION",
    QUEST_START = "QUEST_START",
    QUEST_STEP_COMPLETE = "STEP_COMPLETE",
    QUEST_TASK_COMPLETE = "TASK_COMPLETE"
}
interface TaskDefinition {
    taskId: string;
    requiredCount?: number;
    description?: string;
    metaverse: 'DECENTRALAND' | 'HYPERFY';
}
interface StepDefinition {
    stepId: string;
    name?: string;
    tasks: TaskDefinition[];
    prerequisiteStepIds?: string[];
}
interface QuestDefinition {
    questId: string;
    version: number;
    enabled: boolean;
    questType: 'LINEAR' | 'OPEN_ENDED' | 'ONE_SHOT';
    startTrigger?: 'EXPLICIT' | 'FIRST_TASK';
    title?: string;
    startTime?: number;
    endTime?: number;
    allowReplay: boolean;
    creator: string;
    steps: StepDefinition[];
}
export declare const lscQuestConnections: Map<string, Room<any>>;
export declare const lscQuestUserData: Map<string, QuestDefinition>;
export declare function LSCQuestConnect(engine: any, getPlayer: any, questId: string): Promise<void>;
export declare function LSCQuestStart(questId: string): void;
export declare function LSCQuestAction(questId: string, stepId: string, taskId: string): void;
export declare function LSCQuestLeaderboard(questId: string, position: Vector3, updateInterval: number, limit: number, order?: 'asc' | 'asc', sortBy?: string, completed?: boolean, showBackground?: boolean, title?: string): void;
export {};
