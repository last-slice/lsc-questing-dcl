import { TransformType } from '@dcl/sdk/ecs';
import { Room } from 'colyseus.js';
import './polyfill';
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
    requiredCount: number;
    count: number;
    completed: boolean;
    description: string;
    metaverse: 'DECENTRALAND' | 'HYPERFY';
    prerequisiteTaskIds: string[];
}
interface StepDefinition {
    stepId: string;
    name?: string;
    completed: boolean;
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
    completed: boolean;
    creator: string;
    steps: StepDefinition[];
}
export declare const lscQuestEvent: import("mitt").Emitter<Record<import("mitt").EventType, unknown>>;
export declare const lscQuestConnections: Map<string, Room<any>>;
export declare const lscQuestUserData: Map<string, QuestDefinition>;
export declare function LSCQuestLocalCreator(value: boolean): Promise<void>;
export declare function LSCQuestConnect(questId: string): Promise<void>;
export declare function LSCQuestStart(questId: string): void;
export declare function LSCQuestAction(questId: string, stepId: string, taskId: string): void;
export declare function LSCQuestLeaderboard(questId: string, transform: TransformType, updateInterval: number, limit: number, order?: 'asc' | 'asc', sortBy?: string, completed?: boolean, showBackground?: boolean, title?: string): void;
export {};
