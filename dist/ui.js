import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs';
import { engine } from '@dcl/sdk/ecs';
import { Color4 } from '@dcl/sdk/math';
import { calculateImageDimensions, calculateSquareImageDimensions, getImageAtlasMapping, getAspect, sizeFont, uiSizer } from './helpers';
import { uiSizes } from './uiConfig';
import { lscQuestUserData } from './quest';
let showHud = false;
let questView = "main";
let currentQuest = "";
let currentStep = "";
let visibleTaskIndex = 1;
let visibleStepIndex = 1;
let visibleSteps = [];
let visibleTasks = [];
let atlas2 = 'https://dclstreams.com/media/images/9f2b0cb5-2a9a-473a-8cf8-bdbe5219f131.png';
function questUI() {
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
                }
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
            },
            borderRadius: '10%',
            borderWidth: '25%',
            borderColor: Color4.create(42 / 255, 58 / 255, 90 / 255, 1)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdWkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxFQUFFLEVBQWtCLFFBQVEsRUFBbUIsTUFBTSxvQkFBb0IsQ0FBQTtBQUN4RixPQUFPLEVBQXVCLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUMxRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQ3RDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSw4QkFBOEIsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBYyxNQUFNLFdBQVcsQ0FBQTtBQUNwSixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3BDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUUxQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUE7QUFDbkIsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFBO0FBQ3RCLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQTtBQUNyQixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFFcEIsSUFBSSxnQkFBZ0IsR0FBVSxDQUFDLENBQUE7QUFDL0IsSUFBSSxnQkFBZ0IsR0FBVSxDQUFDLENBQUE7QUFFL0IsSUFBSSxZQUFZLEdBQVMsRUFBRSxDQUFBO0FBQzNCLElBQUksWUFBWSxHQUFTLEVBQUUsQ0FBQTtBQUUzQixJQUFJLE1BQU0sR0FBRyw4RUFBOEUsQ0FBQTtBQUUzRixTQUFTLE9BQU87SUFDWixPQUFNLENBQ0YsdUJBQUMsUUFBUSxJQUNULEdBQUcsRUFBQyxrQkFBa0IsRUFDdEIsV0FBVyxFQUFFO1lBQ1QsYUFBYSxFQUFFLFFBQVE7WUFDdkIsVUFBVSxFQUFFLFFBQVE7WUFDcEIsY0FBYyxFQUFFLFlBQVk7WUFDNUIsWUFBWSxFQUFFLFVBQVU7WUFDeEIsS0FBSyxFQUFDLE1BQU07WUFDWixNQUFNLEVBQUMsTUFB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LEtBQUs7b0JBQzlDLE1BQU0sRUFBRSw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO2lCQUNuRCxFQVFELFlBQVksRUFBRSxFQUFDLEtBQUssRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBQyxHQUFHLEVBQUMsR0FBRyxHQUFDLEdBQUcsRUFBQyxHQUFHLEdBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQyxFQUFDLEVBQzdELE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsUUFBUSxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxFQUNuRSxXQUFXLEVBQUUsR0FBRSxFQUFFO29CQUNiLFlBQVksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQTtvQkFDdEMsU0FBUyxHQUFHLE9BQU8sQ0FBQTtnQkFDdkIsQ0FBQyxHQUNILENBQ0ssQ0FFSixDQUNkLENBQUE7QUFDTCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQU8sR0FBRyxFQUFFLENBQUM7SUFDdEMsT0FBTyxFQUFFO0NBQ1osQ0FBQTtBQUVELE1BQU0sVUFBVSxhQUFhO0lBQ3pCLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDN0IsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEtBQVcsRUFBRSxJQUFXLEVBQUUsWUFBbUI7SUFDaEUsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQzdDLE1BQU0sUUFBUSxHQUFHLFVBQVUsR0FBRyxZQUFZLENBQUM7SUFDM0MsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUMxQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0RWNzLCB7RHJvcGRvd24sIElucHV0LCBVaUVudGl0eSwgUmVhY3RFY3NSZW5kZXJlcn0gZnJvbSAnQGRjbC9zZGsvcmVhY3QtZWNzJ1xuaW1wb3J0IHsgVWlDYW52YXNJbmZvcm1hdGlvbiwgZW5naW5lIH0gZnJvbSAnQGRjbC9zZGsvZWNzJ1xuaW1wb3J0IHsgQ29sb3I0IH0gZnJvbSAnQGRjbC9zZGsvbWF0aCdcbmltcG9ydCB7IGNhbGN1bGF0ZUltYWdlRGltZW5zaW9ucywgY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zLCBnZXRJbWFnZUF0bGFzTWFwcGluZywgZ2V0QXNwZWN0LCBzaXplRm9udCwgdWlTaXplciwgZGltZW5zaW9ucyB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB7IHVpU2l6ZXMgfSBmcm9tICcuL3VpQ29uZmlnJ1xuaW1wb3J0IHsgbHNjUXVlc3RVc2VyRGF0YSB9IGZyb20gJy4vcXVlc3QnXG5cbmxldCBzaG93SHVkID0gZmFsc2VcbmxldCBxdWVzdFZpZXcgPSBcIm1haW5cIlxubGV0IGN1cnJlbnRRdWVzdCA9IFwiXCJcbmxldCBjdXJyZW50U3RlcCA9IFwiXCJcblxubGV0IHZpc2libGVUYXNrSW5kZXg6bnVtYmVyID0gMVxubGV0IHZpc2libGVTdGVwSW5kZXg6bnVtYmVyID0gMVxuXG5sZXQgdmlzaWJsZVN0ZXBzOmFueVtdID0gW11cbmxldCB2aXNpYmxlVGFza3M6YW55W10gPSBbXVxuXG5sZXQgYXRsYXMyID0gJ2h0dHBzOi8vZGNsc3RyZWFtcy5jb20vbWVkaWEvaW1hZ2VzLzlmMmIwY2I1LTJhOWEtNDczYS04Y2Y4LWJkYmU1MjE5ZjEzMS5wbmcnXG5cbmZ1bmN0aW9uIHF1ZXN0VUkoKXtcbiAgICByZXR1cm4oXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICBrZXk9XCJhbmd6YWFyLXF1ZXN0LXVpXCJcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgd2lkdGg6JzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OicxMDAlJyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAnMCUnLFxuICAgICAgICAgICAgICAgIGxlZnQ6ICcwJScsXG4gICAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICAgIC8vIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5UZWFsKCl9fVxuICAgID5cbiAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDQpLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoNCkuaGVpZ2h0LFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3A6ICcxMyUnLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMSUnLFxuICAgICAgICAgICAgfVxuICAgICAgICB9fVxuICAgICAgICB1aUJhY2tncm91bmQ9e3tcbiAgICAgICAgICAgIHRleHR1cmVNb2RlOiAnc3RyZXRjaCcsXG4gICAgICAgICAgICB0ZXh0dXJlOiB7XG4gICAgICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9kY2xzdHJlYW1zLmNvbS9tZWRpYS9pbWFnZXMvOWYyYjBjYjUtMmE5YS00NzNhLThjZjgtYmRiZTUyMTlmMTMxLnBuZycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXZzOiBnZXRJbWFnZUF0bGFzTWFwcGluZyh1aVNpemVzLnRyb3BoeUljb24pXG4gICAgICAgIH19XG4gICAgICAgIG9uTW91c2VEb3duPXsoKT0+e1xuICAgICAgICAgICAgc2hvd0h1ZCA9ICFzaG93SHVkXG4gICAgICAgICAgICBpZighc2hvd0h1ZCl7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXN0ID0gXCJcIlxuICAgICAgICAgICAgICAgIHF1ZXN0VmlldyA9IFwibWFpblwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgLz5cblxuICAgIHtzaG93SHVkICYmIDxRdWVzdEh1ZCAvPn1cblxuICAgIDwvVWlFbnRpdHk+XG4gICAgICApXG59XG5cbmNvbnN0IFF1ZXN0SHVkID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICBrZXk9XCJhbmd6YWFyLXF1ZXN0LWh1ZFwiXG4gICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgIHdpZHRoOiBjYWxjdWxhdGVJbWFnZURpbWVuc2lvbnMoNDUsIGdldEFzcGVjdCh1aVNpemVzLmhvcml6UmVjdGFuZ2xlKSkud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNhbGN1bGF0ZUltYWdlRGltZW5zaW9ucyg0NSwgZ2V0QXNwZWN0KHVpU2l6ZXMuaG9yaXpSZWN0YW5nbGUpKS5oZWlnaHQsXG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHRvcDogJzE1JScsXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICcyNSUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOicxMCUnLFxuICAgICAgICAgICAgYm9yZGVyV2lkdGg6ICcyNSUnLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IENvbG9yNC5jcmVhdGUoNDIvMjU1LDU4LzI1NSw5MC8yNTUsMSlcbiAgICAgICAgfX1cbiAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6Q29sb3I0LmNyZWF0ZSgxOC8yNTUsMjMvMjU1LDM3LzI1NSwxKX19XG4gICAgICAgIC8vIHVpQmFja2dyb3VuZD17e1xuICAgICAgICAvLyAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgLy8gICAgIHRleHR1cmU6IHtcbiAgICAgICAgLy8gICAgICAgICBzcmM6IGF0bGFzMlxuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gICAgIHV2czogZ2V0SW1hZ2VBdGxhc01hcHBpbmcodWlTaXplcy5ob3JpelJlY3RhbmdsZSlcbiAgICAgICAgLy8gfX1cbiAgICA+XG4gICAgICAgIFxuICAgICAgICB7cXVlc3RWaWV3ID09PSBcIm1haW5cIiAmJiA8UXVlc3RWaWV3TWFpbiAvPn1cbiAgICAgICAge3F1ZXN0VmlldyA9PT0gXCJxdWVzdFwiICYmIDxRdWVzdFZpZXdEZXRhaWxzIC8+fVxuICAgICAgICB7cXVlc3RWaWV3ID09PSBcInN0ZXBzXCIgJiYgPFF1ZXN0Vmlld1N0ZXBzIC8+fVxuICAgICAgICB7cXVlc3RWaWV3ID09PSBcInRhc2tzXCIgJiYgPFF1ZXN0Vmlld1Rhc2tzIC8+fVxuICAgIDwvVWlFbnRpdHk+XG4gICAgKVxufVxuXG5mdW5jdGlvbiBRdWVzdFZpZXdNYWluKCl7XG4gICAgcmV0dXJuKFxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgIH19XG4gICAgPlxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJ1xuICAgICAgICB9fVxuICAgICAgICB1aVRleHQ9e3t2YWx1ZTogJ0xTQyBBY3RpdmUgUXVlc3RzJywgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDM1LDIwKX19XG4gICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnOCUnXG4gICAgICAgIH19XG4gICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5jcmVhdGUoMjYvMjU1LDM0LzI1NSw1My8yNTUsMSl9fVxuICAgICAgICA+XG5cbjxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIG1hcmdpbjp7bGVmdDonMyUnfVxuICAgICAgICB9fVxuICAgICAgICB1aVRleHQ9e3t2YWx1ZTogJ1RpdGxlJywgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDIwLDE1KX19XG4gICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAnMjAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgIH19XG4gICAgICAgIHVpVGV4dD17e3ZhbHVlOiAnU3RlcHMnLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgd2lkdGg6ICczMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJSdcbiAgICAgICAgfX1cbiAgICAgICAgdWlUZXh0PXt7dmFsdWU6ICdQcm9ncmVzcycsIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgyMCwxNSl9fVxuICAgIC8+XG5cbjxVaUVudGl0eVxuICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgICAgICB9fVxuICAgICAgICB1aVRleHQ9e3t2YWx1ZTogJ0FjdGlvbnMnLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAvPlxuXG4gICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAge2dldFF1ZXN0RGF0YSgpfVxuICAgIDwvVWlFbnRpdHk+XG4gICAgKVxufVxuXG5mdW5jdGlvbiBRdWVzdFZpZXdEZXRhaWxzKCl7XG4gICAgbGV0IHF1ZXN0RGF0YSA9IGxzY1F1ZXN0VXNlckRhdGEuZ2V0KGN1cnJlbnRRdWVzdClcbiAgICBpZighcXVlc3REYXRhKXtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgcmV0dXJuKFxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgIH19XG4gICAgPlxuICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnMiUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAnNSUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGF0bGFzMixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1dnM6IGdldEltYWdlQXRsYXNNYXBwaW5nKHVpU2l6ZXMuYmFja0J1dHRvbilcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eygpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UXVlc3QgPSBcIlwiXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdFZpZXcgPSBcIm1haW5cIlxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG5cbjxVaUVudGl0eVxuICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMCUnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB1aVRleHQ9e3t2YWx1ZTogbHNjUXVlc3RVc2VyRGF0YS5nZXQoY3VycmVudFF1ZXN0KT8udGl0bGUgfHwgXCJVbnRpdGxlZCBRdWVzdFwiLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgzNSwyMCl9fVxuICAgICAgICAgICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJSdcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIHVpVGV4dD17e3ZhbHVlOiBcIlN0ZXBzXCIsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIGZvbnRTaXplOiBzaXplRm9udCgyNSwyMCl9fVxuICAgICAgICAgICAgLz5cblxuICAgIHtnZW5lcmF0ZVF1ZXN0U3RlcHMocXVlc3REYXRhKX1cblxuICAgIDwvVWlFbnRpdHk+XG4gICAgKVxufVxuXG5mdW5jdGlvbiBRdWVzdFZpZXdTdGVwcygpe1xuICAgIGxldCBxdWVzdERhdGEgPSBsc2NRdWVzdFVzZXJEYXRhLmdldChjdXJyZW50UXVlc3QpXG4gICAgaWYoIXF1ZXN0RGF0YSl7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIHJldHVybihcbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgICAgICB9fVxuICAgID5cbiAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoMykud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogJzIlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodDogJzUlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICB1aUJhY2tncm91bmQ9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmVNb2RlOiAnc3RyZXRjaCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBhdGxhczIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXZzOiBnZXRJbWFnZUF0bGFzTWFwcGluZyh1aVNpemVzLmJhY2tCdXR0b24pXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXsoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3RWaWV3ID0gXCJxdWVzdFwiXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzk1JScsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJSdcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIHVpVGV4dD17e3ZhbHVlOiBsc2NRdWVzdFVzZXJEYXRhLmdldChjdXJyZW50UXVlc3QpPy50aXRsZSB8fCBcIlVudGl0bGVkIFF1ZXN0XCIsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDM1LDIwKX19XG4gICAgICAgICAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTUlJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdWlUZXh0PXt7dmFsdWU6IFwiU3RlcHNcIiwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMzUsMjApfX1cbiAgICAgICAgICAgIC8+XG5cblxuICAgIHtnZW5lcmF0ZVF1ZXN0U3RlcHMocXVlc3REYXRhKX1cblxuICAgIDwvVWlFbnRpdHk+XG4gICAgKVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVF1ZXN0U3RlcHMocXVlc3REYXRhOmFueSl7XG4gICAgbGV0IGFycmF5OmFueSA9IFtdXG4gICAgcXVlc3REYXRhLnN0ZXBzLmZvckVhY2goKHN0ZXBEYXRhOmFueSk9PntcbiAgICBjb25zb2xlLmxvZygnc3RlcCBpcycsIHN0ZXBEYXRhKVxuICAgICAgICBhcnJheS5wdXNoKDxRdWVzdFN0ZXAgcXVlc3RJZD17cXVlc3REYXRhLnF1ZXN0SWR9IHN0ZXBEYXRhPXtzdGVwRGF0YX0gLz4pXG4gICAgfSlcbiAgICByZXR1cm4gYXJyYXlcbn1cblxuZnVuY3Rpb24gUXVlc3RTdGVwKHByb3BzOmFueSl7XG4gICAgbGV0IHN0ZXBEYXRhID0gcHJvcHMuc3RlcERhdGFcbiAgICBcbiAgICAvLyBDYWxjdWxhdGUgc3RlcCBwcm9ncmVzcyBiYXNlZCBvbiB0YXNrIGNvbXBsZXRpb25cbiAgICBjb25zdCBjYWxjdWxhdGVTdGVwUHJvZ3Jlc3MgPSAoKSA9PiB7XG4gICAgICAgIGlmIChzdGVwRGF0YS5jb21wbGV0ZWQpIHJldHVybiAxMDBcbiAgICAgICAgXG4gICAgICAgIC8vIENvdW50IHRvdGFsIHRhc2tzIGFuZCBjb21wbGV0ZWQgdGFza3NcbiAgICAgICAgY29uc3QgdG90YWxUYXNrcyA9IHN0ZXBEYXRhLnRhc2tzID8gc3RlcERhdGEudGFza3MubGVuZ3RoIDogMFxuICAgICAgICBpZiAodG90YWxUYXNrcyA9PT0gMCkgcmV0dXJuIDBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZFRhc2tzID0gc3RlcERhdGEudGFza3MgPyBzdGVwRGF0YS50YXNrcy5maWx0ZXIoKHRhc2s6IGFueSkgPT4gdGFzay5jb21wbGV0ZWQpLmxlbmd0aCA6IDBcbiAgICAgICAgXG4gICAgICAgIC8vIENhbGN1bGF0ZSBwZXJjZW50YWdlXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKChjb21wbGV0ZWRUYXNrcyAvIHRvdGFsVGFza3MpICogMTAwKVxuICAgIH1cbiAgICBcbiAgICAvLyBHZXQgcHJvZ3Jlc3MgcGVyY2VudGFnZVxuICAgIGNvbnN0IHByb2dyZXNzID0gY2FsY3VsYXRlU3RlcFByb2dyZXNzKClcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAga2V5PXtcImxzYy1xdWVzdC1odWQtc3RlcC1cIisgc3RlcERhdGEubmFtZX1cbiAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnOTUlJyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMCUnLFxuICAgICAgICAgICAgICAgIG1hcmdpbjoge3RvcDonMSUnLCBib3R0b206JzElJ31cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB1aUJhY2tncm91bmQ9e3tjb2xvcjpDb2xvcjQuQmxhY2soKX19XG4gICAgICAgID5cbiAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICczMCUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIG1hcmdpbjp7bGVmdDonMyUnfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHVpVGV4dD17e3RleHRXcmFwOidub3dyYXAnLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgdmFsdWU6IHN0ZXBEYXRhLm5hbWUsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDIwLDE1KX19XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICczMCUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cblxuICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzkwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNTAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3JkZXJSYWRpdXM6IDEwXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6IENvbG9yNC5HcmF5KCl9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogcHJvcHMuc3RlcERhdGEuY29tcGxldGVkPyAnMTAwJScgOiBgJHtwcm9ncmVzc30lYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOiBDb2xvcjQuY3JlYXRlKDgzLzI1NSwgMSwgMjE0LzI1NSwxKX19XG4gICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogJzAlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICB1aVRleHQ9e3t0ZXh0QWxpZ246J21pZGRsZS1jZW50ZXInLHRleHRXcmFwOidub3dyYXAnLHZhbHVlOiBzdGVwRGF0YS5jb21wbGV0ZWQ/ICdDb21wbGV0ZWQnIDogYCR7cHJvZ3Jlc3N9JWAsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDIwLDE1KX19XG4gICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgIDwvVWlFbnRpdHk+XG4gICAgICAgICAgICA8L1VpRW50aXR5PlxuXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICc0MCUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDgpLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoMykuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvLyB1aUJhY2tncm91bmQ9e3tcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRleHR1cmVNb2RlOiAnc3RyZXRjaCcsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0ZXh0dXJlOiB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgc3JjOiBhdGxhczIsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdXZzOiBnZXRJbWFnZUF0bGFzTWFwcGluZyh1aVNpemVzLmJ1dHRvblBpbGxCbHVlKVxuICAgICAgICAgICAgICAgICAgICAvLyB9fVxuICAgICAgICAgICAgICAgICAgICB1aUJhY2tncm91bmQ9e3tjb2xvcjpDb2xvcjQuY3JlYXRlKDEzLzI1NSwxMTAvMjU1LDI1My8yNTUsMSl9fVxuICAgICAgICAgICAgICAgICAgICB1aVRleHQ9e3t2YWx1ZTpcIlZpZXdcIiwgdGV4dFdyYXA6J25vd3JhcCcsIGZvbnRTaXplOnNpemVGb250KDI1LDE1KX19XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXsoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3VycmVudFF1ZXN0ID0gcHJvcHMucXVlc3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXAgPSBwcm9wcy5zdGVwRGF0YS5zdGVwSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0VmlldyA9IFwidGFza3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZVRhc2tJbmRleCA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGVUYXNrcyA9IHBhZ2luYXRlQXJyYXkoc3RlcERhdGEudGFza3MsIHZpc2libGVUYXNrSW5kZXgsIDUpXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAgPC9VaUVudGl0eT5cbiAgICApXG59XG5cbmZ1bmN0aW9uIFF1ZXN0Vmlld1Rhc2tzKCl7XG4gICAgbGV0IHF1ZXN0RGF0YSA9IGxzY1F1ZXN0VXNlckRhdGEuZ2V0KGN1cnJlbnRRdWVzdClcbiAgICBpZighcXVlc3REYXRhKXtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgbGV0IHN0ZXBEYXRhID0gcXVlc3REYXRhLnN0ZXBzLmZpbmQoKHN0ZXA6YW55KT0+c3RlcC5zdGVwSWQgPT09IGN1cnJlbnRTdGVwKVxuICAgIGlmKCFzdGVwRGF0YSl7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIHJldHVybihcbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgIGtleT17XCJsc2MtcXVlc3QtaHVkLXRhc2tzLVwiKyBxdWVzdERhdGEucXVlc3RJZH1cbiAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnXG4gICAgICAgIH19XG4gICAgPlxuICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnMiUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAnNSUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IGF0bGFzMixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1dnM6IGdldEltYWdlQXRsYXNNYXBwaW5nKHVpU2l6ZXMuYmFja0J1dHRvbilcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eygpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdFZpZXcgPSBcInF1ZXN0XCJcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuXG48VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTUlJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdWlUZXh0PXt7dmFsdWU6IGxzY1F1ZXN0VXNlckRhdGEuZ2V0KGN1cnJlbnRRdWVzdCk/LnRpdGxlIHx8IFwiVW50aXRsZWQgUXVlc3RcIiwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMzUsMjApfX1cbiAgICAgICAgICAgIC8+XG5cbjxVaUVudGl0eVxuICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMCUnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB1aVRleHQ9e3t2YWx1ZTogXCJTdGVwOiBcIiArIHN0ZXBEYXRhLm5hbWUsIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgzNSwyMCl9fVxuICAgICAgICAgICAgLz5cblxuPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTUlJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG48VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc3MCUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdWlUZXh0PXt7dmFsdWU6IFwiVGFza3M6IFwiICsgdmlzaWJsZVRhc2tzLmxlbmd0aCwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCB0ZXh0QWxpZ246J21pZGRsZS1sZWZ0JywgZm9udFNpemU6IHNpemVGb250KDM1LDIwKX19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMzAlJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJSdcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuXG48VWlFbnRpdHlcbiAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdWlUZXh0PXt7dmFsdWU6IFwiUGFnZTogXCIgKyB2aXNpYmxlVGFza0luZGV4ICsgXCIgb2YgXCIgKyBNYXRoLmNlaWwoc3RlcERhdGEudGFza3MubGVuZ3RoIC8gNSksIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgdGV4dEFsaWduOidtaWRkbGUtbGVmdCcsIGZvbnRTaXplOiBzaXplRm9udCgyMCwxNSl9fVxuICAgICAgICAgICAgLz5cblxuPFVpRW50aXR5XG4gICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIHdpZHRoOiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoMykud2lkdGgsXG4gICAgICAgIGhlaWdodDogY2FsY3VsYXRlU3F1YXJlSW1hZ2VEaW1lbnNpb25zKDMpLmhlaWdodCxcbiAgICAgICAgbWFyZ2luOntyaWdodDonMSUnfVxuICAgIH19XG4gICAgdWlCYWNrZ3JvdW5kPXt7XG4gICAgICAgIHRleHR1cmVNb2RlOiAnc3RyZXRjaCcsXG4gICAgICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgIHNyYzogYXRsYXMyLFxuICAgICAgICB9LFxuICAgICAgICB1dnM6IGdldEltYWdlQXRsYXNNYXBwaW5nKHVpU2l6ZXMubGVmdEFycm93KVxuICAgIH19XG4gICAgb25Nb3VzZURvd249eygpPT57XG4gICAgICAgIGlmKHZpc2libGVUYXNrSW5kZXggPiAxKXtcbiAgICAgICAgICAgIHZpc2libGVUYXNrSW5kZXgtLVxuICAgICAgICAgICAgdmlzaWJsZVRhc2tzID0gcGFnaW5hdGVBcnJheShzdGVwRGF0YS50YXNrcywgdmlzaWJsZVRhc2tJbmRleCwgNSlcbiAgICAgICAgfVxuICAgIH19XG4vPlxuXG48VWlFbnRpdHlcbiAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgd2lkdGg6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoMykuaGVpZ2h0LFxuICAgIH19XG4gICAgdWlCYWNrZ3JvdW5kPXt7XG4gICAgICAgIHRleHR1cmVNb2RlOiAnc3RyZXRjaCcsXG4gICAgICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgIHNyYzogYXRsYXMyLFxuICAgICAgICB9LFxuICAgICAgICB1dnM6IGdldEltYWdlQXRsYXNNYXBwaW5nKHVpU2l6ZXMucmlnaHRBcnJvdylcbiAgICB9fVxuICAgIG9uTW91c2VEb3duPXsoKT0+e1xuICAgICAgICBpZih2aXNpYmxlVGFza0luZGV4IDwgTWF0aC5jZWlsKHN0ZXBEYXRhLnRhc2tzLmxlbmd0aCAvIDUpKXtcbiAgICAgICAgICAgIHZpc2libGVUYXNrSW5kZXgrK1xuICAgICAgICAgICAgdmlzaWJsZVRhc2tzID0gcGFnaW5hdGVBcnJheShzdGVwRGF0YS50YXNrcywgdmlzaWJsZVRhc2tJbmRleCwgNSlcbiAgICAgICAgfVxuICAgIH19XG4vPlxuXG4gICAgICAgICAgICA8L1VpRW50aXR5PlxuXG4gICAgICAgICAgICA8L1VpRW50aXR5PlxuXG5cbiAgICB7Z2VuZXJhdGVRdWVzdFN0ZXBUYXNrcyhzdGVwRGF0YSl9XG5cbiAgICA8L1VpRW50aXR5PlxuICAgIClcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVRdWVzdFN0ZXBUYXNrcyhzdGVwOmFueSl7XG4gICAgbGV0IGFycmF5OmFueSA9IFtdXG4gICAgdmlzaWJsZVRhc2tzLmZvckVhY2goKHRhc2s6YW55KT0+e1xuICAgICAgICBhcnJheS5wdXNoKDxRdWVzdFN0ZXBUYXNrIHRhc2tEYXRhPXt0YXNrfSAvPilcbiAgICB9KVxuICAgIHJldHVybiBhcnJheVxufVxuXG5mdW5jdGlvbiBRdWVzdFN0ZXBUYXNrKHByb3BzOmFueSl7XG4gICAgbGV0IHRhc2tEYXRhID0gcHJvcHMudGFza0RhdGFcbiAgICBcbiAgICAvLyBDYWxjdWxhdGUgc3RlcCBwcm9ncmVzcyBiYXNlZCBvbiB0YXNrIGNvbXBsZXRpb25cbiAgICBjb25zdCBjYWxjdWxhdGVTdGVwUHJvZ3Jlc3MgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0YXNrRGF0YS5jb21wbGV0ZWQpIHJldHVybiAxMDBcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHBlcmNlbnRhZ2VcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKHRhc2tEYXRhLmNvdW50IC8gdGFza0RhdGEucmVxdWlyZWRDb3VudCkgKiAxMDApXG4gICAgfVxuICAgIFxuICAgIC8vIEdldCBwcm9ncmVzcyBwZXJjZW50YWdlXG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBjYWxjdWxhdGVTdGVwUHJvZ3Jlc3MoKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICBrZXk9e1wibHNjLXF1ZXN0LWh1ZC1zdGVwLXRhc2stXCIrIHRhc2tEYXRhLmRlc2NyaXB0aW9ufVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJScsXG4gICAgICAgICAgICAgICAgbWFyZ2luOiB7dG9wOicxJScsIGJvdHRvbTonMSUnfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5CbGFjaygpfX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgbWFyZ2luOntsZWZ0OiczJSd9XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgdWlUZXh0PXt7dGV4dFdyYXA6J25vd3JhcCcsIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCB2YWx1ZTogdGFza0RhdGEuZGVzY3JpcHRpb24sIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDIwLDE1KX19XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICczMCUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cblxuICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzkwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNTAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3JkZXJSYWRpdXM6IDEwXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgdWlCYWNrZ3JvdW5kPXt7Y29sb3I6IENvbG9yNC5HcmF5KCl9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGFza0RhdGEuY29tcGxldGVkPyAnMTAwJScgOiBgJHtwcm9ncmVzc30lYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOiBDb2xvcjQuY3JlYXRlKDgzLzI1NSwgMSwgMjE0LzI1NSwxKX19XG4gICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogJzAlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICB1aVRleHQ9e3t0ZXh0QWxpZ246J21pZGRsZS1jZW50ZXInLHRleHRXcmFwOidub3dyYXAnLHZhbHVlOiB0YXNrRGF0YS5jb21wbGV0ZWQ/ICdDb21wbGV0ZWQnIDogYCR7cHJvZ3Jlc3N9JWAsIGNvbG9yOiBDb2xvcjQuV2hpdGUoKSwgZm9udFNpemU6IHNpemVGb250KDIwLDE1KX19XG4gICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgIDwvVWlFbnRpdHk+XG4gICAgICAgICAgICA8L1VpRW50aXR5PlxuXG4gICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICc0MCUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAgPC9VaUVudGl0eT5cbiAgICApXG59XG5cbmZ1bmN0aW9uIGdldFF1ZXN0RGF0YSgpe1xuICAgIGxldCBhcnJheTphbnkgPSBbXVxuICAgIGxzY1F1ZXN0VXNlckRhdGEuZm9yRWFjaCgocXVlc3REYXRhOmFueSk9PntcbiAgICAgICAgYXJyYXkucHVzaCg8UXVlc3RIdWRJdGVtIHF1ZXN0RGF0YT17cXVlc3REYXRhfSAvPilcbiAgICB9KVxuICAgIHJldHVybiBhcnJheVxufVxuXG5mdW5jdGlvbiBRdWVzdEh1ZEl0ZW0ocHJvcHM6YW55KXtcbiAgICByZXR1cm4gKFxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgIGtleT17XCJsc2MtcXVlc3QtaHVkLWl0ZW0tXCIrIHByb3BzLnF1ZXN0RGF0YS5xdWVzdElkfVxuICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICc5NSUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJScsXG4gICAgICAgICAgICAgICAgbWFyZ2luOiB7dG9wOicxJScsIGJvdHRvbTonMSUnfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5CbGFjaygpfX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzMwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgbWFyZ2luOntsZWZ0OiczJSd9XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgdWlUZXh0PXt7dGV4dFdyYXA6J25vd3JhcCcsIHRleHRBbGlnbjonbWlkZGxlLWxlZnQnLCB2YWx1ZTogcHJvcHMucXVlc3REYXRhLnRpdGxlLCBjb2xvcjogQ29sb3I0LldoaXRlKCksIGZvbnRTaXplOiBzaXplRm9udCgzNSwyMCl9fVxuICAgICAgICAgICAgLz5cblxuICAgICAgICA8VWlFbnRpdHlcbiAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMzAlJyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG5cbiAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgdWlUcmFuc2Zvcm09e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc5MCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYm9yZGVyUmFkaXVzOiAxMFxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOiBDb2xvcjQuR3JheSgpfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICAgICAgICAgIHVpVHJhbnNmb3JtPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHByb3BzLnF1ZXN0RGF0YS5jb21wbGV0ZWQ/ICcxMDAlJyA6IGAke3Byb3BzLnF1ZXN0RGF0YS5wcm9ncmVzc30lYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOiBDb2xvcjQuY3JlYXRlKDgzLzI1NSwgMSwgMjE0LzI1NSwxKX19XG4gICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogJzAlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICB1aVRleHQ9e3t0ZXh0QWxpZ246J21pZGRsZS1jZW50ZXInLHRleHRXcmFwOidub3dyYXAnLHZhbHVlOiBwcm9wcy5xdWVzdERhdGEuY29tcGxldGVkPyAnQ29tcGxldGVkJyA6IGAke3Byb3BzLnF1ZXN0RGF0YS5wcm9ncmVzc30lYCwgY29sb3I6IENvbG9yNC5XaGl0ZSgpLCBmb250U2l6ZTogc2l6ZUZvbnQoMjAsMTUpfX1cbiAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgPC9VaUVudGl0eT5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAgPFVpRW50aXR5XG4gICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB3aWR0aDogJzQwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxVaUVudGl0eVxuICAgICAgICAgICAgICAgICAgICB1aVRyYW5zZm9ybT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBjYWxjdWxhdGVTcXVhcmVJbWFnZURpbWVuc2lvbnMoOCkud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGNhbGN1bGF0ZVNxdWFyZUltYWdlRGltZW5zaW9ucygzKS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8vIHVpQmFja2dyb3VuZD17e1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdGV4dHVyZU1vZGU6ICdzdHJldGNoJyxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRleHR1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBzcmM6IGF0bGFzMixcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB1dnM6IGdldEltYWdlQXRsYXNNYXBwaW5nKHVpU2l6ZXMuYnV0dG9uUGlsbEJsdWUpXG4gICAgICAgICAgICAgICAgICAgIC8vIH19XG4gICAgICAgICAgICAgICAgICAgIHVpQmFja2dyb3VuZD17e2NvbG9yOkNvbG9yNC5jcmVhdGUoMTMvMjU1LDExMC8yNTUsMjUzLzI1NSwxKX19XG4gICAgICAgICAgICAgICAgICAgIHVpVGV4dD17e3ZhbHVlOlwiVmlld1wiLCB0ZXh0V3JhcDonbm93cmFwJywgZm9udFNpemU6c2l6ZUZvbnQoMjUsMTUpfX1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249eygpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UXVlc3QgPSBwcm9wcy5xdWVzdERhdGEucXVlc3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3RWaWV3ID0gXCJxdWVzdFwiXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvVWlFbnRpdHk+XG5cbiAgICAgICAgPC9VaUVudGl0eT5cbiAgICApXG59XG5cbmV4cG9ydCBjb25zdCBxdWVzdFVJQ29tcG9uZW50OmFueSA9ICgpID0+IFtcbiAgICBxdWVzdFVJKCksXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVRdWVzdFVJKCl7XG4gICAgZW5naW5lLmFkZFN5c3RlbSh1aVNpemVyKVxufVxuXG5mdW5jdGlvbiBwYWdpbmF0ZUFycmF5KGFycmF5OmFueVtdLCBwYWdlOm51bWJlciwgaXRlbXNQZXJQYWdlOm51bWJlcil7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IChwYWdlIC0gMSkgKiBpdGVtc1BlclBhZ2U7XG4gICAgY29uc3QgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgaXRlbXNQZXJQYWdlO1xuICAgIHJldHVybiBhcnJheS5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleClcbiAgfVxuICAiXX0=