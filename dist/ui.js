import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs';
import { engine } from '@dcl/sdk/ecs';
import { Color4 } from '@dcl/sdk/math';
import { calculateImageDimensions, calculateSquareImageDimensions, getImageAtlasMapping, getAspect, sizeFont, uiSizer } from './helpers';
import { uiSizes } from './uiConfig';
import { lscQuestUserData } from './quest';
let showHud = false;
let showQuestIcon = true;
let questView = "main";
let currentQuest = "";
let currentStep = "";
let visibleTaskIndex = 1;
let visibleStepIndex = 1;
let visibleSteps = [];
let visibleTasks = [];
let atlas2 = 'https://dclstreams.com/media/images/9f2b0cb5-2a9a-473a-8cf8-bdbe5219f131.png';
export function showLSCQuestIcon(value) {
    showQuestIcon = value;
}
export function questUI() {
    return (ReactEcs.createElement(UiEntity, { key: "angzaar-quest-ui", uiTransform: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            positionType: 'absolute',
            width: '100%',
            height: '100%',
            position: {
                top: '0%',
                left: '0%',
            }
        } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: calculateSquareImageDimensions(4).width,
                height: calculateSquareImageDimensions(4).height,
                positionType: 'absolute',
                position: {
                    top: '13%',
                    right: '1%',
                },
                display: showQuestIcon ? 'flex' : 'none'
            }, uiBackground: {
                textureMode: 'stretch',
                texture: {
                    src: 'https://dclstreams.com/media/images/9f2b0cb5-2a9a-473a-8cf8-bdbe5219f131.png',
                },
                uvs: getImageAtlasMapping(uiSizes.trophyIcon)
            }, onMouseDown: () => {
                showHud = !showHud;
                if (!showHud) {
                    currentQuest = "";
                    questView = "main";
                }
            } }),
        showHud && ReactEcs.createElement(QuestHud, null)));
}
const QuestHud = () => {
    return (ReactEcs.createElement(UiEntity, { key: "angzaar-quest-hud", uiTransform: {
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
        }, uiBackground: { color: Color4.create(18 / 255, 23 / 255, 37 / 255, 1) } },
        questView === "main" && ReactEcs.createElement(QuestViewMain, null),
        questView === "quest" && ReactEcs.createElement(QuestViewDetails, null),
        questView === "steps" && ReactEcs.createElement(QuestViewSteps, null),
        questView === "tasks" && ReactEcs.createElement(QuestViewTasks, null)));
};
function QuestViewMain() {
    return (ReactEcs.createElement(UiEntity, { uiTransform: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '95%',
                height: '10%'
            }, uiText: { value: 'LSC Active Quests', textAlign: 'middle-left', color: Color4.White(), fontSize: sizeFont(35, 20) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '95%',
                height: '8%'
            }, uiBackground: { color: Color4.create(26 / 255, 34 / 255, 53 / 255, 1) } },
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '30%',
                    height: '100%',
                    margin: { left: '3%' }
                }, uiText: { value: 'Title', textAlign: 'middle-left', color: Color4.White(), fontSize: sizeFont(20, 15) } }),
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '20%',
                    height: '100%'
                }, uiText: { value: 'Steps', textAlign: 'middle-left', color: Color4.White(), fontSize: sizeFont(20, 15) } }),
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '30%',
                    height: '100%'
                }, uiText: { value: 'Progress', textAlign: 'middle-left', color: Color4.White(), fontSize: sizeFont(20, 15) } }),
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '30%',
                    height: '100%'
                }, uiText: { value: 'Actions', textAlign: 'middle-left', color: Color4.White(), fontSize: sizeFont(20, 15) } })),
        getQuestData()));
}
function QuestViewDetails() {
    let questData = lscQuestUserData.get(currentQuest);
    if (!questData) {
        return null;
    }
    return (ReactEcs.createElement(UiEntity, { uiTransform: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
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
            }, uiBackground: {
                textureMode: 'stretch',
                texture: {
                    src: atlas2,
                },
                uvs: getImageAtlasMapping(uiSizes.backButton)
            }, onMouseDown: () => {
                currentQuest = "";
                questView = "main";
            } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '95%',
                height: '10%'
            }, uiText: { value: lscQuestUserData.get(currentQuest)?.title || "Untitled Quest", color: Color4.White(), fontSize: sizeFont(35, 20) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '95%',
                height: '10%'
            }, uiText: { value: "Steps", color: Color4.White(), textAlign: 'middle-left', fontSize: sizeFont(25, 20) } }),
        generateQuestSteps(questData)));
}
function QuestViewSteps() {
    let questData = lscQuestUserData.get(currentQuest);
    if (!questData) {
        return null;
    }
    return (ReactEcs.createElement(UiEntity, { uiTransform: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
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
            }, uiBackground: {
                textureMode: 'stretch',
                texture: {
                    src: atlas2,
                },
                uvs: getImageAtlasMapping(uiSizes.backButton)
            }, onMouseDown: () => {
                questView = "quest";
            } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '95%',
                height: '10%'
            }, uiText: { value: lscQuestUserData.get(currentQuest)?.title || "Untitled Quest", color: Color4.White(), fontSize: sizeFont(35, 20) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '95%',
                height: '10%'
            }, uiText: { value: "Steps", color: Color4.White(), fontSize: sizeFont(35, 20) } }),
        generateQuestSteps(questData)));
}
function generateQuestSteps(questData) {
    let array = [];
    questData.steps.forEach((stepData) => {
        console.log('step is', stepData);
        array.push(ReactEcs.createElement(QuestStep, { questId: questData.questId, stepData: stepData }));
    });
    return array;
}
function QuestStep(props) {
    let stepData = props.stepData;
    const calculateStepProgress = () => {
        if (stepData.completed)
            return 100;
        const totalTasks = stepData.tasks ? stepData.tasks.length : 0;
        if (totalTasks === 0)
            return 0;
        const completedTasks = stepData.tasks ? stepData.tasks.filter((task) => task.completed).length : 0;
        return Math.round((completedTasks / totalTasks) * 100);
    };
    const progress = calculateStepProgress();
    return (ReactEcs.createElement(UiEntity, { key: "lsc-quest-hud-step-" + stepData.name, uiTransform: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            height: '10%',
            margin: { top: '1%', bottom: '1%' }
        }, uiBackground: { color: Color4.Black() } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
                margin: { left: '3%' }
            }, uiText: { textWrap: 'nowrap', textAlign: 'middle-left', value: stepData.name, color: Color4.White(), fontSize: sizeFont(20, 15) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
            } },
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '90%',
                    height: '50%',
                }, uiBackground: { color: Color4.Gray() } },
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: props.stepData.completed ? '100%' : `${progress}%`,
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }, uiBackground: { color: Color4.create(83 / 255, 1, 214 / 255, 1) } }),
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }, uiText: { textAlign: 'middle-center', textWrap: 'nowrap', value: stepData.completed ? 'Completed' : `${progress}%`, color: Color4.White(), fontSize: sizeFont(20, 15) } }))),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                height: '100%',
            } },
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: calculateSquareImageDimensions(8).width,
                    height: calculateSquareImageDimensions(3).height,
                }, uiBackground: { color: Color4.create(13 / 255, 110 / 255, 253 / 255, 1) }, uiText: { value: "View", textWrap: 'nowrap', fontSize: sizeFont(25, 15) }, onMouseDown: () => {
                    currentStep = props.stepData.stepId;
                    questView = "tasks";
                    visibleTaskIndex = 1;
                    visibleTasks = paginateArray(stepData.tasks, visibleTaskIndex, 5);
                } }))));
}
function QuestViewTasks() {
    let questData = lscQuestUserData.get(currentQuest);
    if (!questData) {
        return null;
    }
    let stepData = questData.steps.find((step) => step.stepId === currentStep);
    if (!stepData) {
        return null;
    }
    return (ReactEcs.createElement(UiEntity, { key: "lsc-quest-hud-tasks-" + questData.questId, uiTransform: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%'
        } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
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
            }, uiBackground: {
                textureMode: 'stretch',
                texture: {
                    src: atlas2,
                },
                uvs: getImageAtlasMapping(uiSizes.backButton)
            }, onMouseDown: () => {
                questView = "quest";
            } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '95%',
                height: '10%'
            }, uiText: { value: lscQuestUserData.get(currentQuest)?.title || "Untitled Quest", color: Color4.White(), fontSize: sizeFont(35, 20) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '95%',
                height: '10%'
            }, uiText: { value: "Step: " + stepData.name, textAlign: 'middle-left', color: Color4.White(), fontSize: sizeFont(35, 20) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '95%',
                height: '10%'
            } },
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '70%',
                    height: '100%'
                }, uiText: { value: "Tasks: " + visibleTasks.length, color: Color4.White(), textAlign: 'middle-left', fontSize: sizeFont(35, 20) } }),
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30%',
                    height: '100%'
                } },
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '50%',
                        height: '100%'
                    }, uiText: { value: "Page: " + visibleTaskIndex + " of " + Math.ceil(stepData.tasks.length / 5), color: Color4.White(), textAlign: 'middle-left', fontSize: sizeFont(20, 15) } }),
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateSquareImageDimensions(3).width,
                        height: calculateSquareImageDimensions(3).height,
                        margin: { right: '1%' }
                    }, uiBackground: {
                        textureMode: 'stretch',
                        texture: {
                            src: atlas2,
                        },
                        uvs: getImageAtlasMapping(uiSizes.leftArrow)
                    }, onMouseDown: () => {
                        if (visibleTaskIndex > 1) {
                            visibleTaskIndex--;
                            visibleTasks = paginateArray(stepData.tasks, visibleTaskIndex, 5);
                        }
                    } }),
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateSquareImageDimensions(3).width,
                        height: calculateSquareImageDimensions(3).height,
                    }, uiBackground: {
                        textureMode: 'stretch',
                        texture: {
                            src: atlas2,
                        },
                        uvs: getImageAtlasMapping(uiSizes.rightArrow)
                    }, onMouseDown: () => {
                        if (visibleTaskIndex < Math.ceil(stepData.tasks.length / 5)) {
                            visibleTaskIndex++;
                            visibleTasks = paginateArray(stepData.tasks, visibleTaskIndex, 5);
                        }
                    } }))),
        generateQuestStepTasks(stepData)));
}
function generateQuestStepTasks(step) {
    let array = [];
    visibleTasks.forEach((task) => {
        array.push(ReactEcs.createElement(QuestStepTask, { taskData: task }));
    });
    return array;
}
function QuestStepTask(props) {
    let taskData = props.taskData;
    const calculateStepProgress = () => {
        if (taskData.completed)
            return 100;
        return Math.round((taskData.count / taskData.requiredCount) * 100);
    };
    const progress = calculateStepProgress();
    return (ReactEcs.createElement(UiEntity, { key: "lsc-quest-hud-step-task-" + taskData.description, uiTransform: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            height: '10%',
            margin: { top: '1%', bottom: '1%' }
        }, uiBackground: { color: Color4.Black() } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
                margin: { left: '3%' }
            }, uiText: { textWrap: 'nowrap', textAlign: 'middle-left', value: taskData.description, color: Color4.White(), fontSize: sizeFont(20, 15) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
            } },
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '90%',
                    height: '50%',
                }, uiBackground: { color: Color4.Gray() } },
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: taskData.completed ? '100%' : `${progress}%`,
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }, uiBackground: { color: Color4.create(83 / 255, 1, 214 / 255, 1) } }),
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }, uiText: { textAlign: 'middle-center', textWrap: 'nowrap', value: taskData.completed ? 'Completed' : `${progress}%`, color: Color4.White(), fontSize: sizeFont(20, 15) } }))),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                height: '100%',
            } })));
}
function getQuestData() {
    let array = [];
    lscQuestUserData.forEach((questData) => {
        array.push(ReactEcs.createElement(QuestHudItem, { questData: questData }));
    });
    return array;
}
function QuestHudItem(props) {
    return (ReactEcs.createElement(UiEntity, { key: "lsc-quest-hud-item-" + props.questData.questId, uiTransform: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            height: '10%',
            margin: { top: '1%', bottom: '1%' }
        }, uiBackground: { color: Color4.Black() } },
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
                margin: { left: '3%' }
            }, uiText: { textWrap: 'nowrap', textAlign: 'middle-left', value: props.questData.title, color: Color4.White(), fontSize: sizeFont(35, 20) } }),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%',
                height: '100%',
            } },
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '90%',
                    height: '50%',
                }, uiBackground: { color: Color4.Gray() } },
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: props.questData.completed ? '100%' : `${props.questData.progress}%`,
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }, uiBackground: { color: Color4.create(83 / 255, 1, 214 / 255, 1) } }),
                ReactEcs.createElement(UiEntity, { uiTransform: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        positionType: 'absolute',
                        position: {
                            left: '0%'
                        }
                    }, uiText: { textAlign: 'middle-center', textWrap: 'nowrap', value: props.questData.completed ? 'Completed' : `${props.questData.progress}%`, color: Color4.White(), fontSize: sizeFont(20, 15) } }))),
        ReactEcs.createElement(UiEntity, { uiTransform: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                height: '100%',
            } },
            ReactEcs.createElement(UiEntity, { uiTransform: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: calculateSquareImageDimensions(8).width,
                    height: calculateSquareImageDimensions(3).height,
                }, uiBackground: { color: Color4.create(13 / 255, 110 / 255, 253 / 255, 1) }, uiText: { value: "View", textWrap: 'nowrap', fontSize: sizeFont(25, 15) }, onMouseDown: () => {
                    currentQuest = props.questData.questId;
                    questView = "quest";
                } }))));
}
export const questUIComponent = () => [
    questUI(),
];
export function createQuestUI() {
    engine.addSystem(uiSizer);
}
function paginateArray(array, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdWkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxFQUFFLEVBQWtCLFFBQVEsRUFBbUIsTUFBTSxvQkFBb0IsQ0FBQTtBQUN4RixPQUFPLEVBQXVCLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUMxRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQ3RDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSw4QkFBOEIsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBYyxNQUFNLFdBQVcsQ0FBQTtBQUNwSixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3BDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUUxQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUE7QUFDbkIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3hCLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQTtBQUN0QixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUE7QUFDckIsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFBO0FBRXBCLElBQUksZ0JBQWdCLEdBQVUsQ0FBQyxDQUFBO0FBQy9CLElBQUksZ0JBQWdCLEdBQVUsQ0FBQyxDQUFBO0FBRS9CLElBQUksWUFBWSxHQUFTLEVBQUUsQ0FBQTtBQUMzQixJQUFJLFlBQVksR0FBUyxFQUFFLENBQUE7QUFFM0IsSUFBSSxNQUFNLEdBQUcsOEVBQThFLENBQUE7QUFFM0YsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEtBQWE7SUFDMUMsYUFBYSxHQUFHLEtBQUssQ0FBQTtBQUN6QixDQUFDO0FBRUQsTUFBTSxVQUFVLE9BQU87SUFDbkIsT0FBTSxDQUNGLHVCQUFDLFFBQVEsSUFDVCxHQUFHLEVBQUMsa0JBQWtCLEVBQ3RCLFdBQVcsRUFBRTtZQUNULGFBQWEsRUFBRSxR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LENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztvQkFDOUMsTUFBTSxFQUFFLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07aUJBQ25ELEVBUUQsWUFBWSxFQUFFLEVBQUMsS0FBSyxFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFDLEdBQUcsRUFBQyxHQUFHLEdBQUMsR0FBRyxFQUFDLEdBQUcsR0FBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLEVBQUMsRUFDN0QsTUFBTSxFQUFFLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxRQUFRLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQ25FLFdBQVcsRUFBRSxHQUFFLEVBQUU7b0JBQ2IsWUFBWSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFBO29CQUN0QyxTQUFTLEdBQUcsT0FBTyxDQUFBO2dCQUN2QixDQUFDLEdBQ0gsQ0FDSyxDQUVKLENBQ2QsQ0FBQTtBQUNMLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBTyxHQUFHLEVBQUUsQ0FBQztJQUN0QyxPQUFPLEVBQUU7Q0FDWixDQUFBO0FBRUQsTUFBTSxVQUFVLGFBQWE7SUFDekIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM3QixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsS0FBVyxFQUFFLElBQVcsRUFBRSxZQUFtQjtJQUNoRSxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDN0MsTUFBTSxRQUFRLEdBQUcsVUFBVSxHQUFHLFlBQVksQ0FBQztJQUMzQyxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQzFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3RFY3MsIHtEcm9wZG93biwgSW5wdXQsIFVpRW50aXR5LCBSZWFjdEVjc1JlbmRlcmVyfSBmcm9tICdAZGNsL3Nkay9yZWFjdC1lY3MnXG5pbXBvcnQgeyBVaUNhbnZhc0luZm9ybWF0aW9uLCBlbmdpbmUgfSBmcm9tICdAZGNsL3Nkay9lY3MnXG5pbXBvcnQgeyBDb2xvcjQgfSBmcm9tICdAZGNsL3Nkay9tYXRoJ1xuaW1wb3J0IHsgY2FsY3VsYXRlSW1hZ2VEaW1lbnNpb25zLCBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMsIGdldEltYWdlQXRsYXNNYXBwaW5nLCBnZXRBc3BlY3QsIHNpemVGb250LCB1aVNpemVyLCBkaW1lbnNpb25zIH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHsgdWlTaXplcyB9IGZyb20gJy4vdWlDb25maWcnXG5pbXBvcnQgeyBsc2NRdWVzdFVzZXJEYXRhIH0gZnJvbSAnLi9xdWVzdCdcblxubGV0IHNob3dIdWQgPSBmYWxzZVxubGV0IHNob3dRdWVzdEljb24gPSB0cnVlXG5sZXQgcXVlc3RWaWV3ID0gXCJtYWluXCJcbmxldCBjdXJyZW50UXVlc3QgPSBcIlwiXG5sZXQgY3VycmVudFN0ZXAgPSBcIlwiXG5cbmxldCB2aXNpYmxlVGFza0luZGV4Om51bWJlciA9IDFcbmxldCB2aXNpYmxlU3RlcEluZGV4Om51bWJlciA9IDFcblxubGV0IHZpc2libGVTdGVwczphbnlbXSA9IFtdXG5sZXQgdmlzaWJsZVRhc2tzOmFueVtdID0gW11cblxubGV0IGF0bGFzMiA9ICdodHRwczovL2RjbHN0cmVhbXMuY29tL21lZGlhL2ltYWdlcy85ZjJiMGNiNS0yYTlhLTQ3M2EtOGNmOC1iZGJlNTIxOWYxMzEucG5nJ1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0xTQ1F1ZXN0SWNvbih2YWx1ZTpib29sZWFuKXtcbiAgICBzaG93UXVlc3RJY29uID0gdmFsdWVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXN0VUkoKXtcbiAgICByZXR1cm4oXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICBrZXk9XCJhbmd6YWFyLXF1ZXN0LXVpXCJcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgd2lkdGg6JzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OicxMDAlJyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAnMCUnLFxuICAgICAgICAgICAgICAgIGxlZnQ6ICcwJScsXG4gICAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICAgIC8vIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5UZWFsKCl9fVxuICAgID5cbiAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDQpLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoNCkuaGVpZ2h0LFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3A6ICcxMyUnLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMSUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc3BsYXk6IHNob3dRdWVzdEljb24/ICdmbGV4JyA6ICdub25lJ1xuICAgICAgICB9fVxuICAgICAgICB1aUJhY2tncm91bmQ9e3tcbiAgICAgICAgICAgIHRleHR1cmVNb2RlOiAnc3RyZXRjaCcsXG4gICAgICAgICAgICB0ZXh0dXJlOiB7XG4gICAgICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9kY2xzdHJlYW1zLmNvbS9tZWRpYS9pbWFnZXMvOWYyYjBjYjUtMmE5YS00NzNhLThjZjgtYmRiZTUyMTlmMTMxLnBuZycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXZzOiBnZXRJbWFnZUF0bGFzTWFwcGluZyh1aVNpemVzLnRyb3BoeUljb24pXG4gICAgICAgIH19XG4gICAgICAgIG9uTW91c2VEb3duPXsoKT0+e1xuICAgICAgICAgICAgc2hvd0h1ZCA9ICFzaG93SHVkXG4gICAgICAgICAgICBpZighc2hvd0h1ZCl7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXN0ID0gXCJcIlxuICAgICAgICAgICAgICAgIHF1ZXN0VmlldyA9IFwibWFpblwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgLz5cblxuICAgIHtzaG93SHVkICYmIDxRdWVzdEh1ZCAvPn1cblxuICAgIDwvVWlFbnRpdHk+XG4gICAgICApXG59XG5cbmNvbnN0IFF1ZXN0SHVkID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICBrZXk9XCJhbmd6YWFyLXF1ZXN0LWh1ZFwiXG4gICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgIHdpZHRoOiBjYWxjdWxhdGVJbWFnZURpbWVuc2lvbnMoNDUsIGdldEFzcGVjdCh1aVNpemVzLmhvcml6UmVjdGFuZ2xlKSkud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNhbGN1bGF0ZUltYWdlRGltZW5zaW9ucyg0NSwgZ2V0QXNwZWN0KHVpU2l6ZXMuaG9yaXpSZWN0YW5nbGUpKS5oZWlnaHQsXG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHRvcDogJzE1JScsXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICcyNSUnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBib3JkZXJSYWRpdXM6JzEwJScsXG4gICAgICAgICAgICAvLyBib3JkZXJXaWR0aDogJzI1JScsXG4gICAgICAgICAgICAvLyBib3JkZXJDb2xvcjogQ29sb3I0LmNyZWF0ZSg0Mi8yNTUsNTgvMjU1LDkwLzI1NSwxKVxuICAgICAgICB9fVxuICAgICAgICB1aUJhY2tncm91bmQ9e3tjb2xvcjpDb2xvcjQuY3JlYXRlKDE4LzI1NSwyMy8yNTUsMzcvMjU1LDEpfX1cbiAgICAgICAgLy8gdWlCYWNrZ3JvdW5kPXt7XG4gICAgICAgIC8vICAgICB0ZXh0dXJlTW9kZTogJ3N0cmV0Y2gnLFxuICAgICAgICAvLyAgICAgdGV4dHVyZToge1xuICAgICAgICAvLyAgICAgICAgIHNyYzogYXRsYXMyXG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAgdXZzOiBnZXRJbWFnZUF0bGFzTWFwcGluZyh1aVNpemVzLmhvcml6UmVjdGFuZ2xlKVxuICAgICAgICAvLyB9fVxuICAgID5cbiAgICAgICAgXG4gICAgICAgIHtxdWVzdFZpZXcgPT09IFwibWFpblwiICYmIDxRdWVzdFZpZXdNYWluIC8+fVxuICAgICAgICB7cXVlc3RWaWV3ID09PSBcInF1ZXN0XCIgJiYgPFF1ZXN0Vmlld0RldGFpbHMgLz59XG4gICAgICAgIHtxdWVzdFZpZXcgPT09IFwic3RlcHNcIiAmJiA8UXVlc3RWaWV3U3RlcHMgLz59XG4gICAgICAgIHtxdWVzdFZpZXcgPT09IFwidGFza3NcIiAmJiA8UXVlc3RWaWV3VGFza3MgLz59XG4gICAgPC9VaUVudGl0eT5cbiAgICApXG59XG5cbmZ1bmN0aW9uIFF1ZXN0Vmlld01haW4oKXtcbiAgICByZXR1cm4oXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJSdcbiAgICAgICAgfX1cbiAgICA+XG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMCUnXG4gICAgICAgIH19XG4gICAgICAgIHVpVGV4dD17e3ZhbHVlOiAnTFNDIEFjdGl2ZSBRdWVzdHMnLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMzUsMjApfX1cbiAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICBoZWlnaHQ6ICc4JSdcbiAgICAgICAgfX1cbiAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6Q29sb3I0LmNyZWF0ZSgyNi8yNTUsMzQvMjU1LDUzLzI1NSwxKX19XG4gICAgICAgID5cblxuPFVpRW50aXR5XG4gICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAnMzAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgbWFyZ2luOntsZWZ0OiczJSd9XG4gICAgICAgIH19XG4gICAgICAgIHVpVGV4dD17e3ZhbHVlOiAnVGl0bGUnLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgd2lkdGg6ICcyMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJSdcbiAgICAgICAgfX1cbiAgICAgICAgdWlUZXh0PXt7dmFsdWU6ICdTdGVwcycsIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgyMCwxNSl9fVxuICAgIC8+XG5cbjxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgICAgICB9fVxuICAgICAgICB1aVRleHQ9e3t2YWx1ZTogJ1Byb2dyZXNzJywgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDIwLDE1KX19XG4gICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAnMzAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgIH19XG4gICAgICAgIHVpVGV4dD17e3ZhbHVlOiAnQWN0aW9ucycsIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgyMCwxNSl9fVxuICAgIC8+XG5cbiAgICAgICAgPC9VaUVudGl0eT5cblxuICAgICAgICB7Z2V0UXVlc3REYXRhKCl9XG4gICAgPC9VaUVudGl0eT5cbiAgICApXG59XG5cbmZ1bmN0aW9uIFF1ZXN0Vmlld0RldGFpbHMoKXtcbiAgICBsZXQgcXVlc3REYXRhID0gbHNjUXVlc3RVc2VyRGF0YS5nZXQoY3VycmVudFF1ZXN0KVxuICAgIGlmKCFxdWVzdERhdGEpe1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4oXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJSdcbiAgICAgICAgfX1cbiAgICA+XG4gICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoMykuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICcyJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6ICc1JSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlTW9kZTogJ3N0cmV0Y2gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogYXRsYXMyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2czogZ2V0SW1hZ2VBdGxhc01hcHBpbmcodWlTaXplcy5iYWNrQnV0dG9uKVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17KCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRRdWVzdCA9IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0VmlldyA9IFwibWFpblwiXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJSdcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIHVpVGV4dD17e3ZhbHVlOiBsc2NRdWVzdFVzZXJEYXRhLmdldChjdXJyZW50UXVlc3QpPy50aXRsZSB8fCBcIlVudGl0bGVkIFF1ZXN0XCIsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDM1LDIwKX19XG4gICAgICAgICAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTUlJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdWlUZXh0PXt7dmFsdWU6IFwiU3RlcHNcIiwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgZm9udFNpemU6IHNpemVGb250KDI1LDIwKX19XG4gICAgICAgICAgICAvPlxuXG4gICAge2dlbmVyYXRlUXVlc3RTdGVwcyhxdWVzdERhdGEpfVxuXG4gICAgPC9VaUVudGl0eT5cbiAgICApXG59XG5cbmZ1bmN0aW9uIFF1ZXN0Vmlld1N0ZXBzKCl7XG4gICAgbGV0IHF1ZXN0RGF0YSA9IGxzY1F1ZXN0VXNlckRhdGEuZ2V0KGN1cnJlbnRRdWVzdClcbiAgICBpZighcXVlc3REYXRhKXtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgcmV0dXJuKFxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgIH19XG4gICAgPlxuICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnMiUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAnNSUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGF0bGFzMixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1dnM6IGdldEltYWdlQXRsYXNNYXBwaW5nKHVpU2l6ZXMuYmFja0J1dHRvbilcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eygpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdFZpZXcgPSBcInF1ZXN0XCJcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTUlJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdWlUZXh0PXt7dmFsdWU6IGxzY1F1ZXN0VXNlckRhdGEuZ2V0KGN1cnJlbnRRdWVzdCk/LnRpdGxlIHx8IFwiVW50aXRsZWQgUXVlc3RcIiwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMzUsMjApfX1cbiAgICAgICAgICAgIC8+XG5cbjxVaUVudGl0eVxuICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMCUnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB1aVRleHQ9e3t2YWx1ZTogXCJTdGVwc1wiLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgzNSwyMCl9fVxuICAgICAgICAgICAgLz5cblxuXG4gICAge2dlbmVyYXRlUXVlc3RTdGVwcyhxdWVzdERhdGEpfVxuXG4gICAgPC9VaUVudGl0eT5cbiAgICApXG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlUXVlc3RTdGVwcyhxdWVzdERhdGE6YW55KXtcbiAgICBsZXQgYXJyYXk6YW55ID0gW11cbiAgICBxdWVzdERhdGEuc3RlcHMuZm9yRWFjaCgoc3RlcERhdGE6YW55KT0+e1xuICAgIGNvbnNvbGUubG9nKCdzdGVwIGlzJywgc3RlcERhdGEpXG4gICAgICAgIGFycmF5LnB1c2goPFF1ZXN0U3RlcCBxdWVzdElkPXtxdWVzdERhdGEucXVlc3RJZH0gc3RlcERhdGE9e3N0ZXBEYXRhfSAvPilcbiAgICB9KVxuICAgIHJldHVybiBhcnJheVxufVxuXG5mdW5jdGlvbiBRdWVzdFN0ZXAocHJvcHM6YW55KXtcbiAgICBsZXQgc3RlcERhdGEgPSBwcm9wcy5zdGVwRGF0YVxuICAgIFxuICAgIC8vIENhbGN1bGF0ZSBzdGVwIHByb2dyZXNzIGJhc2VkIG9uIHRhc2sgY29tcGxldGlvblxuICAgIGNvbnN0IGNhbGN1bGF0ZVN0ZXBQcm9ncmVzcyA9ICgpID0+IHtcbiAgICAgICAgaWYgKHN0ZXBEYXRhLmNvbXBsZXRlZCkgcmV0dXJuIDEwMFxuICAgICAgICBcbiAgICAgICAgLy8gQ291bnQgdG90YWwgdGFza3MgYW5kIGNvbXBsZXRlZCB0YXNrc1xuICAgICAgICBjb25zdCB0b3RhbFRhc2tzID0gc3RlcERhdGEudGFza3MgPyBzdGVwRGF0YS50YXNrcy5sZW5ndGggOiAwXG4gICAgICAgIGlmICh0b3RhbFRhc2tzID09PSAwKSByZXR1cm4gMFxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29tcGxldGVkVGFza3MgPSBzdGVwRGF0YS50YXNrcyA/IHN0ZXBEYXRhLnRhc2tzLmZpbHRlcigodGFzazogYW55KSA9PiB0YXNrLmNvbXBsZXRlZCkubGVuZ3RoIDogMFxuICAgICAgICBcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHBlcmNlbnRhZ2VcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKGNvbXBsZXRlZFRhc2tzIC8gdG90YWxUYXNrcykgKiAxMDApXG4gICAgfVxuICAgIFxuICAgIC8vIEdldCBwcm9ncmVzcyBwZXJjZW50YWdlXG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBjYWxjdWxhdGVTdGVwUHJvZ3Jlc3MoKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICBrZXk9e1wibHNjLXF1ZXN0LWh1ZC1zdGVwLVwiKyBzdGVwRGF0YS5uYW1lfVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJScsXG4gICAgICAgICAgICAgICAgbWFyZ2luOiB7dG9wOicxJScsIGJvdHRvbTonMSUnfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5CbGFjaygpfX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgbWFyZ2luOntsZWZ0OiczJSd9XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgdWlUZXh0PXt7dGV4dFdyYXA6J25vd3JhcCcsIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCB2YWx1ZTogc3RlcERhdGEubmFtZSwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuXG4gICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJvcmRlclJhZGl1czogMTBcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICB1aUJhY2tncm91bmQ9e3tjb2xvcjogQ29sb3I0LkdyYXkoKX19XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBwcm9wcy5zdGVwRGF0YS5jb21wbGV0ZWQ/ICcxMDAlJyA6IGAke3Byb2dyZXNzfSVgLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6IENvbG9yNC5jcmVhdGUoODMvMjU1LCAxLCAyMTQvMjU1LDEpfX1cbiAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpVGV4dD17e3RleHRBbGlnbjonbWlkZGxlLWNlbnRlcicsdGV4dFdyYXA6J25vd3JhcCcsdmFsdWU6IHN0ZXBEYXRhLmNvbXBsZXRlZD8gJ0NvbXBsZXRlZCcgOiBgJHtwcm9ncmVzc30lYCwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgPC9VaUVudGl0eT5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzQwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoOCkud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8vIHVpQmFja2dyb3VuZD17e1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBzcmM6IGF0bGFzMixcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB1dnM6IGdldEltYWdlQXRsYXNNYXBwaW5nKHVpU2l6ZXMuYnV0dG9uUGlsbEJsdWUpXG4gICAgICAgICAgICAgICAgICAgIC8vIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5jcmVhdGUoMTMvMjU1LDExMC8yNTUsMjUzLzI1NSwxKX19XG4gICAgICAgICAgICAgICAgICAgIHVpVGV4dD17e3ZhbHVlOlwiVmlld1wiLCB0ZXh0V3JhcDonbm93cmFwJywgZm9udFNpemU6c2l6ZUZvbnQoMjUsMTUpfX1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eygpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjdXJyZW50UXVlc3QgPSBwcm9wcy5xdWVzdElkXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcCA9IHByb3BzLnN0ZXBEYXRhLnN0ZXBJZFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3RWaWV3ID0gXCJ0YXNrc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlVGFza0luZGV4ID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZVRhc2tzID0gcGFnaW5hdGVBcnJheShzdGVwRGF0YS50YXNrcywgdmlzaWJsZVRhc2tJbmRleCwgNSlcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9VaUVudGl0eT5cblxuICAgICAgICA8L1VpRW50aXR5PlxuICAgIClcbn1cblxuZnVuY3Rpb24gUXVlc3RWaWV3VGFza3MoKXtcbiAgICBsZXQgcXVlc3REYXRhID0gbHNjUXVlc3RVc2VyRGF0YS5nZXQoY3VycmVudFF1ZXN0KVxuICAgIGlmKCFxdWVzdERhdGEpe1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBsZXQgc3RlcERhdGEgPSBxdWVzdERhdGEuc3RlcHMuZmluZCgoc3RlcDphbnkpPT5zdGVwLnN0ZXBJZCA9PT0gY3VycmVudFN0ZXApXG4gICAgaWYoIXN0ZXBEYXRhKXtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgcmV0dXJuKFxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAga2V5PXtcImxzYy1xdWVzdC1odWQtdGFza3MtXCIrIHF1ZXN0RGF0YS5xdWVzdElkfVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJSdcbiAgICAgICAgfX1cbiAgICA+XG4gICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoMykuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICcyJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHQ6ICc1JSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlTW9kZTogJ3N0cmV0Y2gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogYXRsYXMyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2czogZ2V0SW1hZ2VBdGxhc01hcHBpbmcodWlTaXplcy5iYWNrQnV0dG9uKVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17KCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0VmlldyA9IFwicXVlc3RcIlxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG5cbjxVaUVudGl0eVxuICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMCUnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB1aVRleHQ9e3t2YWx1ZTogbHNjUXVlc3RVc2VyRGF0YS5nZXQoY3VycmVudFF1ZXN0KT8udGl0bGUgfHwgXCJVbnRpdGxlZCBRdWVzdFwiLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgzNSwyMCl9fVxuICAgICAgICAgICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJSdcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIHVpVGV4dD17e3ZhbHVlOiBcIlN0ZXA6IFwiICsgc3RlcERhdGEubmFtZSwgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDM1LDIwKX19XG4gICAgICAgICAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMCUnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbjxVaUVudGl0eVxuICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzcwJScsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB1aVRleHQ9e3t2YWx1ZTogXCJUYXNrczogXCIgKyB2aXNpYmxlVGFza3MubGVuZ3RoLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCBmb250U2l6ZTogc2l6ZUZvbnQoMzUsMjApfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICczMCUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG5cbjxVaUVudGl0eVxuICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzUwJScsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB1aVRleHQ9e3t2YWx1ZTogXCJQYWdlOiBcIiArIHZpc2libGVUYXNrSW5kZXggKyBcIiBvZiBcIiArIE1hdGguY2VpbChzdGVwRGF0YS50YXNrcy5sZW5ndGggLyA1KSwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgZm9udFNpemU6IHNpemVGb250KDIwLDE1KX19XG4gICAgICAgICAgICAvPlxuXG48VWlFbnRpdHlcbiAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgd2lkdGg6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoMykuaGVpZ2h0LFxuICAgICAgICBtYXJnaW46e3JpZ2h0OicxJSd9XG4gICAgfX1cbiAgICB1aUJhY2tncm91bmQ9e3tcbiAgICAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgdGV4dHVyZToge1xuICAgICAgICAgICAgc3JjOiBhdGxhczIsXG4gICAgICAgIH0sXG4gICAgICAgIHV2czogZ2V0SW1hZ2VBdGxhc01hcHBpbmcodWlTaXplcy5sZWZ0QXJyb3cpXG4gICAgfX1cbiAgICBvbk1vdXNlRG93bj17KCk9PntcbiAgICAgICAgaWYodmlzaWJsZVRhc2tJbmRleCA+IDEpe1xuICAgICAgICAgICAgdmlzaWJsZVRhc2tJbmRleC0tXG4gICAgICAgICAgICB2aXNpYmxlVGFza3MgPSBwYWdpbmF0ZUFycmF5KHN0ZXBEYXRhLnRhc2tzLCB2aXNpYmxlVGFza0luZGV4LCA1KVxuICAgICAgICB9XG4gICAgfX1cbi8+XG5cbjxVaUVudGl0eVxuICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICB3aWR0aDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS5oZWlnaHQsXG4gICAgfX1cbiAgICB1aUJhY2tncm91bmQ9e3tcbiAgICAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgdGV4dHVyZToge1xuICAgICAgICAgICAgc3JjOiBhdGxhczIsXG4gICAgICAgIH0sXG4gICAgICAgIHV2czogZ2V0SW1hZ2VBdGxhc01hcHBpbmcodWlTaXplcy5yaWdodEFycm93KVxuICAgIH19XG4gICAgb25Nb3VzZURvd249eygpPT57XG4gICAgICAgIGlmKHZpc2libGVUYXNrSW5kZXggPCBNYXRoLmNlaWwoc3RlcERhdGEudGFza3MubGVuZ3RoIC8gNSkpe1xuICAgICAgICAgICAgdmlzaWJsZVRhc2tJbmRleCsrXG4gICAgICAgICAgICB2aXNpYmxlVGFza3MgPSBwYWdpbmF0ZUFycmF5KHN0ZXBEYXRhLnRhc2tzLCB2aXNpYmxlVGFza0luZGV4LCA1KVxuICAgICAgICB9XG4gICAgfX1cbi8+XG5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cblxuICAgIHtnZW5lcmF0ZVF1ZXN0U3RlcFRhc2tzKHN0ZXBEYXRhKX1cblxuICAgIDwvVWlFbnRpdHk+XG4gICAgKVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVF1ZXN0U3RlcFRhc2tzKHN0ZXA6YW55KXtcbiAgICBsZXQgYXJyYXk6YW55ID0gW11cbiAgICB2aXNpYmxlVGFza3MuZm9yRWFjaCgodGFzazphbnkpPT57XG4gICAgICAgIGFycmF5LnB1c2goPFF1ZXN0U3RlcFRhc2sgdGFza0RhdGE9e3Rhc2t9IC8+KVxuICAgIH0pXG4gICAgcmV0dXJuIGFycmF5XG59XG5cbmZ1bmN0aW9uIFF1ZXN0U3RlcFRhc2socHJvcHM6YW55KXtcbiAgICBsZXQgdGFza0RhdGEgPSBwcm9wcy50YXNrRGF0YVxuICAgIFxuICAgIC8vIENhbGN1bGF0ZSBzdGVwIHByb2dyZXNzIGJhc2VkIG9uIHRhc2sgY29tcGxldGlvblxuICAgIGNvbnN0IGNhbGN1bGF0ZVN0ZXBQcm9ncmVzcyA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRhc2tEYXRhLmNvbXBsZXRlZCkgcmV0dXJuIDEwMFxuICAgICAgICAvLyBDYWxjdWxhdGUgcGVyY2VudGFnZVxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgodGFza0RhdGEuY291bnQgLyB0YXNrRGF0YS5yZXF1aXJlZENvdW50KSAqIDEwMClcbiAgICB9XG4gICAgXG4gICAgLy8gR2V0IHByb2dyZXNzIHBlcmNlbnRhZ2VcbiAgICBjb25zdCBwcm9ncmVzcyA9IGNhbGN1bGF0ZVN0ZXBQcm9ncmVzcygpXG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgIGtleT17XCJsc2MtcXVlc3QtaHVkLXN0ZXAtdGFzay1cIisgdGFza0RhdGEuZGVzY3JpcHRpb259XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJyxcbiAgICAgICAgICAgICAgICBtYXJnaW46IHt0b3A6JzElJywgYm90dG9tOicxJSd9XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6Q29sb3I0LkJsYWNrKCl9fVxuICAgICAgICA+XG4gICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMzAlJyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICBtYXJnaW46e2xlZnQ6JzMlJ31cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB1aVRleHQ9e3t0ZXh0V3JhcDonbm93cmFwJywgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIHZhbHVlOiB0YXNrRGF0YS5kZXNjcmlwdGlvbiwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuXG4gICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJvcmRlclJhZGl1czogMTBcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICB1aUJhY2tncm91bmQ9e3tjb2xvcjogQ29sb3I0LkdyYXkoKX19XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0YXNrRGF0YS5jb21wbGV0ZWQ/ICcxMDAlJyA6IGAke3Byb2dyZXNzfSVgLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6IENvbG9yNC5jcmVhdGUoODMvMjU1LCAxLCAyMTQvMjU1LDEpfX1cbiAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpVGV4dD17e3RleHRBbGlnbjonbWlkZGxlLWNlbnRlcicsdGV4dFdyYXA6J25vd3JhcCcsdmFsdWU6IHRhc2tEYXRhLmNvbXBsZXRlZD8gJ0NvbXBsZXRlZCcgOiBgJHtwcm9ncmVzc30lYCwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgPC9VaUVudGl0eT5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzQwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgPC9VaUVudGl0eT5cblxuICAgICAgICA8L1VpRW50aXR5PlxuICAgIClcbn1cblxuZnVuY3Rpb24gZ2V0UXVlc3REYXRhKCl7XG4gICAgbGV0IGFycmF5OmFueSA9IFtdXG4gICAgbHNjUXVlc3RVc2VyRGF0YS5mb3JFYWNoKChxdWVzdERhdGE6YW55KT0+e1xuICAgICAgICBhcnJheS5wdXNoKDxRdWVzdEh1ZEl0ZW0gcXVlc3REYXRhPXtxdWVzdERhdGF9IC8+KVxuICAgIH0pXG4gICAgcmV0dXJuIGFycmF5XG59XG5cbmZ1bmN0aW9uIFF1ZXN0SHVkSXRlbShwcm9wczphbnkpe1xuICAgIHJldHVybiAoXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAga2V5PXtcImxzYy1xdWVzdC1odWQtaXRlbS1cIisgcHJvcHMucXVlc3REYXRhLnF1ZXN0SWR9XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJyxcbiAgICAgICAgICAgICAgICBtYXJnaW46IHt0b3A6JzElJywgYm90dG9tOicxJSd9XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6Q29sb3I0LkJsYWNrKCl9fVxuICAgICAgICA+XG4gICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMzAlJyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICBtYXJnaW46e2xlZnQ6JzMlJ31cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB1aVRleHQ9e3t0ZXh0V3JhcDonbm93cmFwJywgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIHZhbHVlOiBwcm9wcy5xdWVzdERhdGEudGl0bGUsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDM1LDIwKX19XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICczMCUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cblxuICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzkwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNTAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3JkZXJSYWRpdXM6IDEwXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6IENvbG9yNC5HcmF5KCl9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogcHJvcHMucXVlc3REYXRhLmNvbXBsZXRlZD8gJzEwMCUnIDogYCR7cHJvcHMucXVlc3REYXRhLnByb2dyZXNzfSVgLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6IENvbG9yNC5jcmVhdGUoODMvMjU1LCAxLCAyMTQvMjU1LDEpfX1cbiAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpVGV4dD17e3RleHRBbGlnbjonbWlkZGxlLWNlbnRlcicsdGV4dFdyYXA6J25vd3JhcCcsdmFsdWU6IHByb3BzLnF1ZXN0RGF0YS5jb21wbGV0ZWQ/ICdDb21wbGV0ZWQnIDogYCR7cHJvcHMucXVlc3REYXRhLnByb2dyZXNzfSVgLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgyMCwxNSl9fVxuICAgICAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgICAgICA8L1VpRW50aXR5PlxuICAgICAgICAgICAgPC9VaUVudGl0eT5cblxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnNDAlJyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucyg4KS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgLy8gdWlCYWNrZ3JvdW5kPXt7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0ZXh0dXJlTW9kZTogJ3N0cmV0Y2gnLFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdGV4dHVyZToge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHNyYzogYXRsYXMyLFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHV2czogZ2V0SW1hZ2VBdGxhc01hcHBpbmcodWlTaXplcy5idXR0b25QaWxsQmx1ZSlcbiAgICAgICAgICAgICAgICAgICAgLy8gfX1cbiAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6Q29sb3I0LmNyZWF0ZSgxMy8yNTUsMTEwLzI1NSwyNTMvMjU1LDEpfX1cbiAgICAgICAgICAgICAgICAgICAgdWlUZXh0PXt7dmFsdWU6XCJWaWV3XCIsIHRleHRXcmFwOidub3dyYXAnLCBmb250U2l6ZTpzaXplRm9udCgyNSwxNSl9fVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17KCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRRdWVzdCA9IHByb3BzLnF1ZXN0RGF0YS5xdWVzdElkXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdFZpZXcgPSBcInF1ZXN0XCJcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9VaUVudGl0eT5cblxuICAgICAgICA8L1VpRW50aXR5PlxuICAgIClcbn1cblxuZXhwb3J0IGNvbnN0IHF1ZXN0VUlDb21wb25lbnQ6YW55ID0gKCkgPT4gW1xuICAgIHF1ZXN0VUkoKSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVF1ZXN0VUkoKXtcbiAgICBlbmdpbmUuYWRkU3lzdGVtKHVpU2l6ZXIpXG59XG5cbmZ1bmN0aW9uIHBhZ2luYXRlQXJyYXkoYXJyYXk6YW55W10sIHBhZ2U6bnVtYmVyLCBpdGVtc1BlclBhZ2U6bnVtYmVyKXtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gKHBhZ2UgLSAxKSAqIGl0ZW1zUGVyUGFnZTtcbiAgICBjb25zdCBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBpdGVtc1BlclBhZ2U7XG4gICAgcmV0dXJuIGFycmF5LnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KVxuICB9XG4gICJdfQ==