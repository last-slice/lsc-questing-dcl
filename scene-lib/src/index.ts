import { AvatarShape, engine, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, Transform } from '@dcl/ecs'
import { Vector3, Quaternion } from "@dcl/sdk/math"
import { LSCQUEST_EVENTS, LSCQuestAction, LSCQuestConnect, lscQuestEvent, LSCQuestStart } from './lib'


export function main() {
  let box = engine.addEntity()
  Transform.create(box, {position:Vector3.create(4,1,8)})
  MeshRenderer.setBox(box)
  MeshCollider.setBox(box)
  pointerEventsSystem.onPointerDown({entity:box, opts:{button:InputAction.IA_POINTER, hoverText:'start quest', maxDistance:7}},()=>{
    LSCQuestStart("rnoMSN")
  })

  LSCQuestConnect("rnoMSN")

  let box2 = engine.addEntity()
  Transform.create(box2, {position:Vector3.create(8,1,8)})
  MeshRenderer.setBox(box2)
  MeshCollider.setBox(box2)
  pointerEventsSystem.onPointerDown({entity:box2, opts:{button:InputAction.IA_POINTER, hoverText:'run quest action', maxDistance:7}},()=>{
    LSCQuestAction("rnoMSN", "Z9nSMe","qHPfm")
  })


  lscQuestEvent.on(LSCQUEST_EVENTS.QUEST_STARTED, (eventInfo:any)=>{
    console.log('received a new quest event action', eventInfo)
  })
}


//