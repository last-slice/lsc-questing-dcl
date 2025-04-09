
export const DEBUG = false

export enum LSCQUEST_EVENTS {
  QUEST_CONNECTION = 'QUEST_CONNECTION',
  QUEST_ERROR = 'QUEST_ERROR',
  QUEST_DATA = 'QUEST_DATA',
  QUEST_STARTED = 'QUEST_STARTED',
  QUEST_COMPLETE = 'QUEST_COMPLETE',
  QUEST_END = 'QUEST_END',
  QUEST_UPDATE = 'QUEST_UPDATE',
  QUEST_DISCONNECT = 'QUEST_DISCONNECT',
  QUEST_ACTION = 'QUEST_ACTION',
  QUEST_START = 'QUEST_START',
  QUEST_STEP_COMPLETE = 'STEP_COMPLETE',
  QUEST_TASK_COMPLETE = 'TASK_COMPLETE'
}

export interface TaskDefinition {
  taskId: string;
  requiredCount: number;
  count: number;
  completed: boolean;
  description: string;
  metaverse: 'DECENTRALAND' | 'HYPERFY';
  prerequisiteTaskIds: string[];
}

export interface StepDefinition {
  stepId: string;
  name?: string;
  completed: boolean;
  tasks: TaskDefinition[];
  prerequisiteStepIds?: string[];
}

export interface QuestDefinition {
    questId: string;
    version: number;
    enabled:boolean,
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
