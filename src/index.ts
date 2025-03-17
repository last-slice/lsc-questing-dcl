import { Client, Room } from 'colyseus.js'
import mitt from 'mitt'
import { getRealm } from '~system/Runtime'
import * as utils from '@dcl-sdk/utils'
import {getPlayer} from "@dcl/sdk/players";
import './polyfill'
import { engine } from '@dcl/sdk/ecs';

const DEBUG = true
let player:any
let pendingQuestConnections:string[] = []

export const lscQuestEvent = mitt()

export interface QuestAction {
  actionId: string
}

export interface TaskDefinition {
  taskId: string;
  requiredCount?: number;
  description?: string;
  metaverse: 'DECENTRALAND' | 'HYPERFY';
}

export interface StepDefinition {
  stepId: string;
  name?: string;
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
    startTime?: number;        // Unix timestamp in ms
    endTime?: number;          // Unix timestamp in ms
    allowReplay?: boolean;
    creator: string;   // e.g. an ethAddress
    // The new field:
    steps: StepDefinition[];        // array of steps in the quest
}

export const lscQuestConnections = new Map<string, Room>()
export const lscQuestUserData = new Map<string, QuestDefinition>()

/**
 * An example of how you might wrap your quest-connection logic in an async function.
 *
 * @param questId - The LSC Quest Id to connect
 */
export async function LSCQuestConnect(questId:string) {
  console.log('connecting to player quest system')
  engine.addSystem(CheckPlayerSystem)
  engine.addSystem(ConnectQuestSystem)

  if(lscQuestConnections.has(questId))  return

  pendingQuestConnections.push(questId)
  console.log('added quest to pending')
}

export function LSCQuestStart(questId:string){
  let questConnection = lscQuestConnections.get(questId)
  if(!questConnection)  return

  try{
    questConnection.send('QUEST_START', {questId})
  }
  catch(e:any){
    console.log('error sending quest action', e)
  }
}

export function LSCQuestAction(questId:string, stepId:string, taskId:string){
  let questConnection = lscQuestConnections.get(questId)
  if(!questConnection)  return

  try{
    questConnection.send('QUEST_ACTION', {questId, stepId, taskId})
  }
  catch(e:any){
    console.log('error sending quest action', e)
  }
}

function setLSCQuestListeners(room:Room, userId:string){
  room.onMessage("ERROR", (info:any)=>{
    console.log('quest error ', info)
    lscQuestEvent.emit("QUEST_ERROR", {info})
  })

  room.onMessage("QUEST_DATA", (info:any)=>{
    console.log('user quest data ', info)
    lscQuestUserData.set(userId, info)
    lscQuestEvent.emit("QUEST_DATA", {info})
  })

  room.onMessage("QUEST_STARTED", (info:any)=>{
    console.log('started quest ', info)
    lscQuestEvent.emit("QUEST_STARTED", {info})
  })

  room.onMessage("QUEST_COMPLETE", (info:any)=>{
    console.log('complete quest ', info)
    lscQuestEvent.emit("QUEST_COMPLETE", {info})
  })

  room.onMessage("QUEST_END", (info:any)=>{
    console.log('ended quest ', info)
    lscQuestEvent.emit("QUEST_END", {info})
  })

  room.onMessage("QUEST_UPDATE", (info:any)=>{
    console.log('update quest ', info)
    lscQuestEvent.emit("QUEST_UPDATE", {info})
  })
}

let time:number = 0
function CheckPlayerSystem(dt:number){
  if(time > 0){
    time -= dt
  }else{
    player = getPlayer()
    if(!player){
      time = 1
    }else{
      engine.removeSystem(CheckPlayerSystem)
    }
  }
}

function ConnectQuestSystem(){
  console.log('connect quest system')
  if(!player) return

  console.log('player is found')

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
    "http://localhost:5335" : 
    "http://localhost:5335"
  )

  try {
    const room: Room = await client.joinOrCreate('angzaar_questing', options)
    lscQuestConnections.set(questId, room)
    setLSCQuestListeners(room, player.userId)

    return room
  } catch (error: any) {
    console.error('Error connecting to quest system', error)
    throw error
  }
}