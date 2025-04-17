import { engine, Entity, Material, MeshRenderer, TextAlignMode, TextShape, Transform, TransformType } from '@dcl/sdk/ecs'
import { ReactEcsRenderer} from '@dcl/sdk/react-ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import {getPlayer} from "@dcl/sdk/players";
import { getRealm } from '~system/Runtime'
import { Client, Room } from 'colyseus.js'
import mitt from 'mitt'
import './polyfill'
import { LSCQUEST_EVENTS, QuestDefinition } from './definitions';
import { ConnectQuestSystem } from './connection';
import { CheckPlayerSystem } from './connection';

export let LOCAL_CREATOR = false

export let pendingQuestConnections:string[] = []

export const lscQuestEvent = mitt()
export const lscQuestConnections = new Map<string, Room>()
export const lscQuestUserData = new Map<string, QuestDefinition>()

/**
 * Set the local creator for testing
 *
 * @param questId
 */
export async function LSCQuestLocalCreator(value:boolean) {
  LOCAL_CREATOR = value
}

/**
 * Connect to a Quest within the LSC Quest System
 *
 * @param questId
 */
export async function LSCQuestConnect(questId:string) {
  console.log('connecting to quest', questId)
  engine.addSystem(CheckPlayerSystem)
  engine.addSystem(ConnectQuestSystem)

  if(lscQuestConnections.has(questId))  return
  pendingQuestConnections.push(questId)
}

/**
 * Disconnect from a Quest within the LSC Quest System
 *
 * @param questId
 */
export async function LSCQuestDisconnect(questId:string) {
  console.log('disconnecting from quest', questId)
  let connection = lscQuestConnections.get(questId)
  if(!connection)  return

  connection.leave(true)
  lscQuestConnections.delete(questId)
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