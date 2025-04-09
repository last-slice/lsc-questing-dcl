import { engine, Entity, Material, MeshRenderer, TextAlignMode, TextShape, Transform, TransformType } from '@dcl/sdk/ecs'
import { ReactEcsRenderer} from '@dcl/sdk/react-ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import {getPlayer} from "@dcl/sdk/players";
import { getRealm } from '~system/Runtime'
import { Client, Room } from 'colyseus.js'
import mitt from 'mitt'
import './polyfill'

const DEBUG = false

let player:any
let pendingQuestConnections:string[] = []

export const lscQuestEvent = mitt()

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

export const lscQuestConnections = new Map<string, Room>()
export const lscQuestUserData = new Map<string, QuestDefinition>()

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
  if(!player) return
  console.log('connecting quest system')

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


/**
 * 
 * @param questId 
 * @param position 
 * @param updateInterval 
 * @param limit 
 * @param order 
 * @param sortBy 
 * @param completed 
 * @param showBackground
 * @param title
 */
export function LSCQuestLeaderboard(
  questId:string, 
  transform:TransformType, 
  updateInterval:number,
  limit:number,
  order: 'asc' | 'asc' = 'asc',
  sortBy:string = 'elapsedTime',
  completed:boolean = true,
  showBackground:boolean = true,
  title:string = "Leaderboard"
  ){
    
  let leaderboard = engine.addEntity()
  Transform.create(leaderboard, transform)
  
  // Row dimensions
  const rowWidth = 3
  const rowHeight = 0.4
  
  // Helper function to format the score type for display
  function formatScoreType(type: string): string {
    if (type === 'elapsedTime') return 'Time';
    return type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
  }
  
  // Create title
  const titleEntity = engine.addEntity()
  Transform.create(titleEntity, {
    parent: leaderboard,
    position: Vector3.create(0, 0.6, 0)
  })
  TextShape.create(titleEntity, {
    text: title,
    fontSize: 2.5,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER
  })
  
  // Row positions (centered)
  const leftPos = -1.2
  const centerPos = 0
  const rightPos = 1.2
  
  // Create header row
  const headerEntity = engine.addEntity()
  Transform.create(headerEntity, {
    parent: leaderboard,
    position: Vector3.create(0, 0.2, 0)
  })
  
  // Header background
  const headerBgEntity = engine.addEntity()
  Transform.create(headerBgEntity, {
    parent: headerEntity,
    position: Vector3.create(0, 0, 0.03),
    scale: Vector3.create(rowWidth, rowHeight, 1)
  })
  MeshRenderer.setPlane(headerBgEntity)
  Material.setPbrMaterial(headerBgEntity, {
    albedoColor: Color4.create(0/255, 255/255, 213/255,1)
  })
  
  // Header labels
  const rankHeaderEntity = engine.addEntity()
  Transform.create(rankHeaderEntity, {
    parent: headerEntity,
    position: Vector3.create(leftPos, 0, 0.02)
  })
  TextShape.create(rankHeaderEntity, {
    text: "Rank",
    fontSize: 1.5,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER
  })
  
  const nameHeaderEntity = engine.addEntity()
  Transform.create(nameHeaderEntity, {
    parent: headerEntity,
    position: Vector3.create(centerPos - 0.4, 0, 0.02)
  })
  TextShape.create(nameHeaderEntity, {
    text: "Player",
    fontSize: 1.5,
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT
  })
  
  const scoreHeaderEntity = engine.addEntity()
  Transform.create(scoreHeaderEntity, {
    parent: headerEntity,
    position: Vector3.create(rightPos, 0, 0.02)
  })
  TextShape.create(scoreHeaderEntity, {
    text: formatScoreType(sortBy),
    fontSize: 1.5,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER
  })
  
  // Array to store references to all leaderboard entities
  const leaderboardRows: Array<{
    rank: number,
    rowEntity: Entity,
    backgroundEntity: Entity,
    rankEntity: Entity,
    profileEntity: Entity,
    nameEntity: Entity,
    scoreEntity: Entity
  }> = []

  // Create placeholder rows
  for(let i = 0; i < limit; i++){
    // Create row container entity
    const rowEntity = engine.addEntity()
    Transform.create(rowEntity, {
      parent: leaderboard,
      position: Vector3.create(0, -i * 0.5 - 0.2, 0)
    })
  
    // Create background entity
    const backgroundEntity = engine.addEntity()
    if (showBackground) {
      Transform.create(backgroundEntity, {
        parent: rowEntity,
        position: Vector3.create(0, 0, 0.01),
        scale: Vector3.create(rowWidth, rowHeight, 1)
      })
      MeshRenderer.setPlane(backgroundEntity)
      Material.setPbrMaterial(backgroundEntity, {
        albedoColor: i % 2 === 0 ? 
          Color4.create(18/255, 23/255,37/255,1) :
          Color4.create(26/255,34/255, 53/255, 1)
      })
    } else {
      Transform.create(backgroundEntity, {
        parent: rowEntity,
        scale: Vector3.Zero()
      })
    }

    // Create rank entity (#1, #2, etc.)
    const rankEntity = engine.addEntity()
    Transform.create(rankEntity, {
      parent: rowEntity,
      position: Vector3.create(leftPos, 0, 0)
    })
    TextShape.create(rankEntity, {text:`#${i + 1}`, fontSize:1.5})

    // Create profile image entity
    const profileEntity = engine.addEntity()
    Transform.create(profileEntity, {
      parent: rowEntity,
      position: Vector3.create(centerPos - 0.8, 0, 0),
      scale: Vector3.create(0.3,0.3,0.3)
    })
    MeshRenderer.setPlane(profileEntity)
    Material.setPbrMaterial(profileEntity, {
      texture: Material.Texture.Avatar({
        userId: '',
      }),
    })

    // Create name entity
    const nameEntity = engine.addEntity()
    Transform.create(nameEntity, {
      parent: rowEntity,
      position: Vector3.create(centerPos - 0.4, 0, 0)
    })
    TextShape.create(nameEntity, {text:`Name`, fontSize:1.5,  textAlign: TextAlignMode.TAM_MIDDLE_LEFT})

    // Create score entity
    const scoreEntity = engine.addEntity()
    Transform.create(scoreEntity, {
      parent: rowEntity,
      position: Vector3.create(rightPos, 0, 0)
    })
    TextShape.create(scoreEntity, {text:`Score`, fontSize:1.5})

    // Store references to all entities
    leaderboardRows.push({
      rank: i + 1,
      rowEntity,
      backgroundEntity,
      rankEntity,
      profileEntity,
      nameEntity,
      scoreEntity
    })
  }

  let time = 0
  function leaderboardUpdate(dt:number){
    if(time > 0){
      time -= dt
    }else{
      time = updateInterval
      updateLSCQuestLeaderboard()
    }
  }

  async function updateLSCQuestLeaderboard(){
    try{
      // Get current player information first
      const playerData = getPlayer();
      const playerID = playerData ? playerData.userId : '';
      const playerName = playerData?.name || 'You';
      
      // Define the user data interface
      interface UserData {
        userId: string;
        name: string;
        elapsedTime: number;
        completed: boolean;
        [key: string]: any; // Allow for dynamic properties //
      }
      
      // Get leaderboard data from API
      let params = [`completed=${completed}`, `order=${order}`, `limit=${limit}`, `sortBy=${sortBy}`]
      let response = await fetch(`http://localhost:5353/api/quests/${questId}/users?` + params.join('&')) 
      let data = await response.json()
      console.log('leaderboard data:', data);
      
      // Update leaderboard with data
      for(let i = 0; i < leaderboardRows.length; i++) {
        const row = leaderboardRows[i]
        const rowData = data[i]
        
        if (rowData) {
          // Show this row and update with user data
          if (!Transform.has(row.rowEntity)) continue
          
          // Make row visible
          Transform.getMutable(row.rowEntity).scale = Vector3.create(1, 1, 1)
          
          // Only update background if it's enabled
          if (showBackground) {
            Transform.getMutable(row.backgroundEntity).scale = Vector3.create(rowWidth, rowHeight, 1)
          }
          
          // Set user rank (#1, #2, etc.)
          const rankText = `#${i + 1}`
          TextShape.getMutable(row.rankEntity).text = rankText

          Material.setPbrMaterial(row.profileEntity, {
            texture: Material.Texture.Avatar({
              userId: rowData.userId,
            }),
          })
          
          // Set user name
          const name = rowData.name || 'Anonymous'
          TextShape.getMutable(row.nameEntity).text = name
          
          // Set user score (time, progress, etc.)
          let scoreText = ''
          if (sortBy === 'elapsedTime') {
            // Format time display
            const ms = rowData.elapsedTime * 1000
            const seconds = Math.floor(ms / 1000)
            const minutes = Math.floor(seconds / 60)
            const hours = Math.floor(minutes / 60)
            
            if (hours > 0) {
              scoreText = `${hours}h ${minutes % 60}m`
            } else if (minutes > 0) {
              scoreText = `${minutes}m ${seconds % 60}s`
            } else {
              scoreText = `${seconds}s`
            }
          } else {
            // For other score types
            scoreText = rowData[sortBy]?.toString() || '0'
          }

          TextShape.getMutable(row.scoreEntity).text = scoreText
        } else {
          // Hide this row as there's no data
          if (Transform.has(row.rowEntity)) {
            Transform.getMutable(row.rowEntity).scale = Vector3.Zero()
            
            // Only update background if it's enabled
            if (showBackground) {
              Transform.getMutable(row.backgroundEntity).scale = Vector3.Zero()
            }
          }
        }
      }
    } catch(e:any) {
      console.log('error updating quest leaderboard', e)
    }
  }

  engine.addSystem(leaderboardUpdate)

  // ReactEcsRenderer.setUiRenderer(uiComponent)
}