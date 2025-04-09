import { LOCAL_CREATOR, lscQuestConnections } from "./quest"
import { Client } from "colyseus.js"
import { Room } from "colyseus.js"
import { LSCQUEST_EVENTS } from "./definitions"
import { lscQuestEvent, lscQuestUserData, pendingQuestConnections } from "./quest"
import { getPlayer } from "@dcl/sdk/players"
import { getRealm } from "~system/Runtime"
import { engine } from "@dcl/sdk/ecs"


let player:any

function setLSCQuestListeners(room:Room, userId:string){
  room.onMessage(LSCQUEST_EVENTS.QUEST_CONNECTION, (info:any)=>{
    console.log('quest connection ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_CONNECTION, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_ERROR, (info:any)=>{
    console.log('quest error ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_ERROR, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_DATA, (info:any)=>{
    console.log('user quest data ', info)
    if(info.userQuestInfo){
      lscQuestUserData.set(info.questId, info.userQuestInfo)
    }
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_DATA, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_STARTED, (info:any)=>{
    console.log('started quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_STARTED, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_COMPLETE, (info:any)=>{
    console.log('complete quest ', info)
    
    // If the server sent complete user quest info, use it directly
    if (info.userQuestInfo) {
      lscQuestUserData.set(info.questId, info.userQuestInfo)
    } 
    // Fallback to old behavior if server doesn't send complete data
    else {
      let userQuestData = lscQuestUserData.get(info.questId)
      if(userQuestData){
        userQuestData.completed = true
      }
    }
    
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_COMPLETE, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_END, (info:any)=>{
    console.log('ended quest ', info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_END, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_UPDATE, (info:any)=>{
    console.log('update quest ', info)
    lscQuestUserData.set(userId, info)
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_UPDATE, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_STEP_COMPLETE, (info:any)=>{
    console.log('step complete quest ', info)
    
    // If the server sent complete user quest info, use it directly
    if (info.userQuestInfo) {
      lscQuestUserData.set(info.questId, info.userQuestInfo)
    }
    // Fallback to old behavior if server doesn't send complete data
    else {
      let userQuestData = lscQuestUserData.get(info.questId)
      if(userQuestData){
        let step = userQuestData.steps.find((step:any)=>step.stepId === info.stepId)
        if(step){
          step.completed = true
        }
      }
    }
    
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_STEP_COMPLETE, info)
  })

  room.onMessage(LSCQUEST_EVENTS.QUEST_TASK_COMPLETE, (info:any)=>{
    console.log('task complete quest ', info)
    
    // If the server sent complete user quest info, use it directly
    if (info.userQuestInfo) {
      lscQuestUserData.set(info.questId, info.userQuestInfo)
    } 
    // Fallback to old behavior if server doesn't send complete data
    else {
      let userQuestData = lscQuestUserData.get(info.questId)
      if(userQuestData){
        let step = userQuestData.steps.find((step:any)=>step.stepId === info.stepId)
        if(step){
          let task = step.tasks.find((task:any)=>task.taskId === info.taskId)
          if(task){
            task.count++
            task.completed = true
          }
        }
      }
    }
    
    lscQuestEvent.emit(LSCQUEST_EVENTS.QUEST_TASK_COMPLETE, info)
  })
}

let time:number = 0
export function CheckPlayerSystem(dt:number){
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

export function ConnectQuestSystem(){
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
    realm: LOCAL_CREATOR ? "local-testing" : realm.realmInfo?.baseUrl,
    questId: questId,
  }

  let client = new Client(DEBUG ? 
    {hostname:'localhost', secure:false, port:5353} : 
    {hostname:'angzaar-plaza.dcl-iwb.co', pathname:'/ws', secure:true}
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