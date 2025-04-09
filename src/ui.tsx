import ReactEcs, {Dropdown, Input, UiEntity, ReactEcsRenderer} from '@dcl/sdk/react-ecs'
import { UiCanvasInformation, engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { calculateImageDimensions, calculateSquareImageDimensions, getImageAtlasMapping, getAspect, sizeFont, uiSizer, dimensions } from './helpers'
import { uiSizes } from './uiConfig'
import { lscQuestUserData } from './quest'

let showHud = false
let questView = "main"
let currentQuest = ""
let currentStep = ""

let visibleTaskIndex:number = 1
let visibleStepIndex:number = 1

let visibleSteps:any[] = []
let visibleTasks:any[] = []

let atlas2 = 'https://dclstreams.com/media/images/9f2b0cb5-2a9a-473a-8cf8-bdbe5219f131.png'

function questUI(){
    return(
        <UiEntity
        key="angzaar-quest-ui"
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            positionType: 'absolute',
            width:'100%',
            height:'100%',
            position: {
                top: '0%',
                left: '0%',
            }
        }}
        // uiBackground={{color:Color4.Teal()}}
    >
         <UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: calculateSquareImageDimensions(4).width,
            height: calculateSquareImageDimensions(4).height,
            positionType: 'absolute',
            position: {
                top: '13%',
                right: '1%',
            }
        }}
        uiBackground={{
            textureMode: 'stretch',
            texture: {
                src: 'https://dclstreams.com/media/images/9f2b0cb5-2a9a-473a-8cf8-bdbe5219f131.png',
            },
            uvs: getImageAtlasMapping(uiSizes.trophyIcon)
        }}
        onMouseDown={()=>{
            showHud = !showHud
            if(!showHud){
                currentQuest = ""
                questView = "main"
            }
        }}
    />

    {showHud && <QuestHud />}

    </UiEntity>
      )
}

const QuestHud = () => {
    return (
        <UiEntity
        key="angzaar-quest-hud"
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: calculateImageDimensions(45, getAspect(uiSizes.horizRectangle)).width,
            height: calculateImageDimensions(45, getAspect(uiSizes.horizRectangle)).height,
            positionType: 'absolute',
            position: {
                top: '15%',
                right: '25%'
            }
            // borderRadius:'10%',
            // borderWidth: '25%',
            // borderColor: Color4.create(42/255,58/255,90/255,1)
        }}
        uiBackground={{color:Color4.create(18/255,23/255,37/255,1)}}
        // uiBackground={{
        //     textureMode: 'stretch',
        //     texture: {
        //         src: atlas2
        //     },
        //     uvs: getImageAtlasMapping(uiSizes.horizRectangle)
        // }}
    >
        
        {questView === "main" && <QuestViewMain />}
        {questView === "quest" && <QuestViewDetails />}
        {questView === "steps" && <QuestViewSteps />}
        {questView === "tasks" && <QuestViewTasks />}
    </UiEntity>
    )
}

function QuestViewMain(){
    return(
        <UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        }}
    >
        <UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '95%',
            height: '10%'
        }}
        uiText={{value: 'LSC Active Quests', textAlign:'middle-left', color: Color4.White(), fontSize: sizeFont(35,20)}}
    />

<UiEntity
        uiTransform={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            height: '8%'
        }}
        uiBackground={{color:Color4.create(26/255,34/255,53/255,1)}}
        >

<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '30%',
            height: '100%',
            margin:{left:'3%'}
        }}
        uiText={{value: 'Title', textAlign:'middle-left', color: Color4.White(), fontSize: sizeFont(20,15)}}
    />

<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '20%',
            height: '100%'
        }}
        uiText={{value: 'Steps', textAlign:'middle-left', color: Color4.White(), fontSize: sizeFont(20,15)}}
    />

<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '30%',
            height: '100%'
        }}
        uiText={{value: 'Progress', textAlign:'middle-left', color: Color4.White(), fontSize: sizeFont(20,15)}}
    />

<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '30%',
            height: '100%'
        }}
        uiText={{value: 'Actions', textAlign:'middle-left', color: Color4.White(), fontSize: sizeFont(20,15)}}
    />

        </UiEntity>

        {getQuestData()}
    </UiEntity>
    )
}

function QuestViewDetails(){
    let questData = lscQuestUserData.get(currentQuest)
    if(!questData){
        return null
    }
    return(
        <UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        }}
    >
         <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateSquareImageDimensions(3).width,
                        height: calculateSquareImageDimensions(3).height,
                        positionType: 'absolute',
                        position: {
                            top: '2%',
                            right: '5%'
                        }
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: {
                            src: atlas2,
                        },
                        uvs: getImageAtlasMapping(uiSizes.backButton)
                    }}
                    onMouseDown={()=>{
                        currentQuest = ""
                        questView = "main"
                    }}
                />

<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '95%',
                    height: '10%'
                }}
                uiText={{value: lscQuestUserData.get(currentQuest)?.title || "Untitled Quest", color: Color4.White(), fontSize: sizeFont(35,20)}}
            />

<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '95%',
                    height: '10%'
                }}
                uiText={{value: "Steps", color: Color4.White(), textAlign:'middle-left', fontSize: sizeFont(25,20)}}
            />

    {generateQuestSteps(questData)}

    </UiEntity>
    )
}

function QuestViewSteps(){
    let questData = lscQuestUserData.get(currentQuest)
    if(!questData){
        return null
    }
    return(
        <UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        }}
    >
         <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateSquareImageDimensions(3).width,
                        height: calculateSquareImageDimensions(3).height,
                        positionType: 'absolute',
                        position: {
                            top: '2%',
                            right: '5%'
                        }
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: {
                            src: atlas2,
                        },
                        uvs: getImageAtlasMapping(uiSizes.backButton)
                    }}
                    onMouseDown={()=>{
                        questView = "quest"
                    }}
                />

<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '95%',
                    height: '10%'
                }}
                uiText={{value: lscQuestUserData.get(currentQuest)?.title || "Untitled Quest", color: Color4.White(), fontSize: sizeFont(35,20)}}
            />

<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '95%',
                    height: '10%'
                }}
                uiText={{value: "Steps", color: Color4.White(), fontSize: sizeFont(35,20)}}
            />


    {generateQuestSteps(questData)}

    </UiEntity>
    )
}

function generateQuestSteps(questData:any){
    let array:any = []
    questData.steps.forEach((stepData:any)=>{
    console.log('step is', stepData)
        array.push(<QuestStep questId={questData.questId} stepData={stepData} />)
    })
    return array
}

function QuestStep(props:any){
    let stepData = props.stepData
    
    // Calculate step progress based on task completion
    const calculateStepProgress = () => {
        if (stepData.completed) return 100
        
        // Count total tasks and completed tasks
        const totalTasks = stepData.tasks ? stepData.tasks.length : 0
        if (totalTasks === 0) return 0
        
        const completedTasks = stepData.tasks ? stepData.tasks.filter((task: any) => task.completed).length : 0
        
        // Calculate percentage
        return Math.round((completedTasks / totalTasks) * 100)
    }
    
    // Get progress percentage
    const progress = calculateStepProgress()

    return (
        <UiEntity
            key={"lsc-quest-hud-step-"+ stepData.name}
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '95%',
                height: '10%',
                margin: {top:'1%', bottom:'1%'}
            }}
            uiBackground={{color:Color4.Black()}}
        >
            <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
                margin:{left:'3%'}
            }}
            uiText={{textWrap:'nowrap', textAlign:'middle-left', value: stepData.name, color: Color4.White(), fontSize: sizeFont(20,15)}}
            />

        <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
            }}
            >

            <UiEntity
                        uiTransform={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '90%',
                            height: '50%',
                            // borderRadius: 10
                        }}
                        uiBackground={{color: Color4.Gray()}}
                        >
                 <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: props.stepData.completed? '100%' : `${progress}%`,
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }}
                    uiBackground={{color: Color4.create(83/255, 1, 214/255,1)}}
                />

                <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }}
                    uiText={{textAlign:'middle-center',textWrap:'nowrap',value: stepData.completed? 'Completed' : `${progress}%`, color: Color4.White(), fontSize: sizeFont(20,15)}}
                />

                </UiEntity>
            </UiEntity>

        <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                height: '100%',
            }}
            >
                <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateSquareImageDimensions(8).width,
                        height: calculateSquareImageDimensions(3).height,
                    }}
                    // uiBackground={{
                    //     textureMode: 'stretch',
                    //     texture: {
                    //         src: atlas2,
                    //     },
                    //     uvs: getImageAtlasMapping(uiSizes.buttonPillBlue)
                    // }}
                    uiBackground={{color:Color4.create(13/255,110/255,253/255,1)}}
                    uiText={{value:"View", textWrap:'nowrap', fontSize:sizeFont(25,15)}}
                    onMouseDown={()=>{
                        // currentQuest = props.questId
                        currentStep = props.stepData.stepId
                        questView = "tasks"
                        visibleTaskIndex = 1
                        visibleTasks = paginateArray(stepData.tasks, visibleTaskIndex, 5)
                    }}
                />
            </UiEntity>

        </UiEntity>
    )
}

function QuestViewTasks(){
    let questData = lscQuestUserData.get(currentQuest)
    if(!questData){
        return null
    }
    let stepData = questData.steps.find((step:any)=>step.stepId === currentStep)
    if(!stepData){
        return null
    }
    return(
        <UiEntity
        key={"lsc-quest-hud-tasks-"+ questData.questId}
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        }}
    >
         <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateSquareImageDimensions(3).width,
                        height: calculateSquareImageDimensions(3).height,
                        positionType: 'absolute',
                        position: {
                            top: '2%',
                            right: '5%'
                        }
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: {
                            src: atlas2,
                        },
                        uvs: getImageAtlasMapping(uiSizes.backButton)
                    }}
                    onMouseDown={()=>{
                        questView = "quest"
                    }}
                />

<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '95%',
                    height: '10%'
                }}
                uiText={{value: lscQuestUserData.get(currentQuest)?.title || "Untitled Quest", color: Color4.White(), fontSize: sizeFont(35,20)}}
            />

<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '95%',
                    height: '10%'
                }}
                uiText={{value: "Step: " + stepData.name, textAlign:'middle-left', color: Color4.White(), fontSize: sizeFont(35,20)}}
            />

<UiEntity
                uiTransform={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '95%',
                    height: '10%'
                }}
            >
<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '70%',
                    height: '100%'
                }}
                uiText={{value: "Tasks: " + visibleTasks.length, color: Color4.White(), textAlign:'middle-left', fontSize: sizeFont(35,20)}}
            />
            <UiEntity
                uiTransform={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30%',
                    height: '100%'
                }}
            >

<UiEntity
                uiTransform={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50%',
                    height: '100%'
                }}
                uiText={{value: "Page: " + visibleTaskIndex + " of " + Math.ceil(stepData.tasks.length / 5), color: Color4.White(), textAlign:'middle-left', fontSize: sizeFont(20,15)}}
            />

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: calculateSquareImageDimensions(3).width,
        height: calculateSquareImageDimensions(3).height,
        margin:{right:'1%'}
    }}
    uiBackground={{
        textureMode: 'stretch',
        texture: {
            src: atlas2,
        },
        uvs: getImageAtlasMapping(uiSizes.leftArrow)
    }}
    onMouseDown={()=>{
        if(visibleTaskIndex > 1){
            visibleTaskIndex--
            visibleTasks = paginateArray(stepData.tasks, visibleTaskIndex, 5)
        }
    }}
/>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: calculateSquareImageDimensions(3).width,
        height: calculateSquareImageDimensions(3).height,
    }}
    uiBackground={{
        textureMode: 'stretch',
        texture: {
            src: atlas2,
        },
        uvs: getImageAtlasMapping(uiSizes.rightArrow)
    }}
    onMouseDown={()=>{
        if(visibleTaskIndex < Math.ceil(stepData.tasks.length / 5)){
            visibleTaskIndex++
            visibleTasks = paginateArray(stepData.tasks, visibleTaskIndex, 5)
        }
    }}
/>

            </UiEntity>

            </UiEntity>


    {generateQuestStepTasks(stepData)}

    </UiEntity>
    )
}

function generateQuestStepTasks(step:any){
    let array:any = []
    visibleTasks.forEach((task:any)=>{
        array.push(<QuestStepTask taskData={task} />)
    })
    return array
}

function QuestStepTask(props:any){
    let taskData = props.taskData
    
    // Calculate step progress based on task completion
    const calculateStepProgress = () => {
        if (taskData.completed) return 100
        // Calculate percentage
        return Math.round((taskData.count / taskData.requiredCount) * 100)
    }
    
    // Get progress percentage
    const progress = calculateStepProgress()

    return (
        <UiEntity
            key={"lsc-quest-hud-step-task-"+ taskData.description}
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '95%',
                height: '10%',
                margin: {top:'1%', bottom:'1%'}
            }}
            uiBackground={{color:Color4.Black()}}
        >
            <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
                margin:{left:'3%'}
            }}
            uiText={{textWrap:'nowrap', textAlign:'middle-left', value: taskData.description, color: Color4.White(), fontSize: sizeFont(20,15)}}
            />

        <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
            }}
            >

            <UiEntity
                        uiTransform={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '90%',
                            height: '50%',
                            // borderRadius: 10
                        }}
                        uiBackground={{color: Color4.Gray()}}
                        >
                 <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: taskData.completed? '100%' : `${progress}%`,
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }}
                    uiBackground={{color: Color4.create(83/255, 1, 214/255,1)}}
                />

                <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }}
                    uiText={{textAlign:'middle-center',textWrap:'nowrap',value: taskData.completed? 'Completed' : `${progress}%`, color: Color4.White(), fontSize: sizeFont(20,15)}}
                />

                </UiEntity>
            </UiEntity>

        <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                height: '100%',
            }}
            >
            </UiEntity>

        </UiEntity>
    )
}

function getQuestData(){
    let array:any = []
    lscQuestUserData.forEach((questData:any)=>{
        array.push(<QuestHudItem questData={questData} />)
    })
    return array
}

function QuestHudItem(props:any){
    return (
        <UiEntity
            key={"lsc-quest-hud-item-"+ props.questData.questId}
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '95%',
                height: '10%',
                margin: {top:'1%', bottom:'1%'}
            }}
            uiBackground={{color:Color4.Black()}}
        >
            <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
                margin:{left:'3%'}
            }}
            uiText={{textWrap:'nowrap', textAlign:'middle-left', value: props.questData.title, color: Color4.White(), fontSize: sizeFont(35,20)}}
            />

        <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
            }}
            >

            <UiEntity
                        uiTransform={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '90%',
                            height: '50%',
                            // borderRadius: 10
                        }}
                        uiBackground={{color: Color4.Gray()}}
                        >
                 <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: props.questData.completed? '100%' : `${props.questData.progress}%`,
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }}
                    uiBackground={{color: Color4.create(83/255, 1, 214/255,1)}}
                />

                <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }}
                    uiText={{textAlign:'middle-center',textWrap:'nowrap',value: props.questData.completed? 'Completed' : `${props.questData.progress}%`, color: Color4.White(), fontSize: sizeFont(20,15)}}
                />

                </UiEntity>
            </UiEntity>

        <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                height: '100%',
            }}
            >
                <UiEntity
                    uiTransform={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateSquareImageDimensions(8).width,
                        height: calculateSquareImageDimensions(3).height,
                    }}
                    // uiBackground={{
                    //     textureMode: 'stretch',
                    //     texture: {
                    //         src: atlas2,
                    //     },
                    //     uvs: getImageAtlasMapping(uiSizes.buttonPillBlue)
                    // }}
                    uiBackground={{color:Color4.create(13/255,110/255,253/255,1)}}
                    uiText={{value:"View", textWrap:'nowrap', fontSize:sizeFont(25,15)}}
                    onMouseDown={()=>{
                        currentQuest = props.questData.questId
                        questView = "quest"
                    }}
                />
            </UiEntity>

        </UiEntity>
    )
}

export const questUIComponent:any = () => [
    questUI(),
]

export function createQuestUI(){
    engine.addSystem(uiSizer)
}

function paginateArray(array:any[], page:number, itemsPerPage:number){
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex)
  }
  