import { Client, Room } from 'colyseus.js'
import mitt from 'mitt'
import { getRealm } from '~system/Runtime'
import './polyfill'

const DEBUG = false

let player:any
let pendingQuestConnections:string[] = []
let dclEngine:any
let dclGetPlayer:any

export const lscQuestEvent = mitt()

export enum LSCQUEST_EVENTS {
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
    enabled:boolean,
    questType: 'LINEAR' | 'OPEN_ENDED' | 'ONE_SHOT'; 
    startTrigger?: 'EXPLICIT' | 'FIRST_TASK';
    title?: string;
    startTime?: number;
    endTime?: number;
    allowReplay: boolean;
    creator: string;
    steps: StepDefinition[];
}

export const lscQuestConnections = new Map<string, Room>()
export const lscQuestUserData = new Map<string, QuestDefinition>()

/**
 * Connect to a Quest within the LSC Quest System
 *
 * @param questId
 */
export async function LSCQuestConnect(engine:any, getPlayer:any, questId:string) {
  dclEngine = engine
  dclGetPlayer = getPlayer
  
  engine.addSystem(CheckPlayerSystem)
  engine.addSystem(ConnectQuestSystem)

  if(lscQuestConnections.has(questId))  return
  pendingQuestConnections.push(questId)
}

/**
 * Start a specific Quest in the LSC Quest System
 *
 * @param questId
 */
export function LSCQuestStart(questId:string){
  let questConnection = lscQuestConnections.get(questId)
  if(!questConnection)  return

  try{
    questConnection.send(LSCQUEST_EVENTS.QUEST_START, {questId})
  }
  catch(e:any){
    console.log('error sending quest action', e)
  }
}

/**
 * Run a Quest Action within the LSC Quest System
 *
 * @param questId
 * @param stepId
 * @param taskId
 */
export function LSCQuestAction(questId:string, stepId:string, taskId:string){
  let questConnection = lscQuestConnections.get(questId)
  if(!questConnection)  return

  try{
    questConnection.send(LSCQUEST_EVENTS.QUEST_ACTION, {questId, stepId, taskId, metaverse:"DECENTRALAND"})
  }
  catch(e:any){
    console.log('error sending quest action', e)
  }
}

function setLSCQuestListeners(room:Room, userId:string){
  room.onMessage(LSCQUEST_EVENTS.QUEST_ERROR, (info:any)=>{
    console.log('quest error ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_ERROR, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_DATA, (info:any)=>{
    console.log('user quest data ', info)
    lscQuestUserData.set(userId, info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_DATA, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_STARTED, (info:any)=>{
    console.log('started quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_STARTED, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_COMPLETE, (info:any)=>{
    console.log('complete quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_COMPLETE, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_END, (info:any)=>{
    console.log('ended quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_END, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_UPDATE, (info:any)=>{
    console.log('update quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_UPDATE, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_STEP_COMPLETE, (info:any)=>{
    console.log('step complete quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_STEP_COMPLETE, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_TASK_COMPLETE, (info:any)=>{
    console.log('task complete quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_TASK_COMPLETE, info)
  })
}

let time:number = 0
function CheckPlayerSystem(dt:number){
  if(time > 0){
    time -= dt
  }else{
    player = dclGetPlayer()
    if(!player){
      time = 1
    }else{
      dclEngine.removeSystem(CheckPlayerSystem)
    }
  }
}

function ConnectQuestSystem(){
  if(!player) return

  if(pendingQuestConnections.length > 0){
    let pendingQuestId:string = "" + pendingQuestConnections.shift()
    makeQuestConnection(pendingQuestId)
  }
}

async function makeQuestConnection(questId:string){
  const realm = await getRealm({})

  const options:any = {
    userId: player.userId,
    name: player.name,
    realm: realm.realmInfo?.baseUrl,
    questId: questId,
  }

  let client = new Client(DEBUG ? 
    {hostname:'localhost', secure:false, port:5335} : 
    {hostname:'lkdcl.co', pathname:'/questing', secure:true, port:5335}
  )

  try {
    const room: Room = await client.joinOrCreate('angzaar_questing', options)
    lscQuestConnections.set(questId, room)
    setLSCQuestListeners(room, player.userId)

    room.onLeave((code:number, reason?:string)=>{
      console.log('left quest room', questId, code, reason)
        lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_DISCONNECT, {questId, code, reason})
    })

    return room
  } catch (error: any) {
    console.error('Error connecting to LSC Quest System', error)
    throw error
  }
}
