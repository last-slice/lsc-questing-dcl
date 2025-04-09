# The Forge Questing - Decentraland
This repository is built for the Decentraland metaverse connecting to The Forge questing system.

## Quest Definition
The Forge quests are made up of multiple `Steps` to complete. Each Step is made up of `Tasks` to complete.

A `Quest` can have at least one (1) but many `Steps`, and each `Step` can have at lease one (1) but many `Tasks`.

- All `Tasks` of a `Step` must be completed for the `Step` to be completed.
- All `Steps` of a `Quest` must be completed for the `Quest` to be marked completed for the user.

## Quest Creation
Currently Quests can be created two (2) ways:
- [The Forge](https://questing.lastslice.co/) website
- Inside Decentraland at coordinates (-2,-86) - visit the `Quest Master` inside the `Cyberpunk City`

## Installation

 
**Install the npm package**

  

Download and install the The Forge Decentraland package by running the following command:

  

```bash

npm  i  lsc-questing-dcl

```
## System Connection

### 1. Import The Forge questing library into your code
```ts
import {LSCQuestAction,LSCQuestConnect} from  'lsc-questing-dcl'
```

### 2. Connect to The Forge quest system
Parameter(s):

 - questId (string)

  ```ts
LSCQuestConnect("BhVrZ6")
```



## Starting a Quest

For quests that require an explicit start task, use the function below.

Parameter(s):

 - questId (string)

  ```ts
LSCQuestStart("BhVrZ6")
```

## Completing Quest Action
Quests require a step and a task. Quest users will complete task(s) for each step.

Parameter(s):

 - questId (string)
 - stepId (string) 
 - taskId (string)

  ```ts
LSCQuestAction("BhVrZ6", "7QOOkw","SV0AE")
```

## Quest Leaderboard Display
Decentraland creators can display a 3d leaderboard on their scene for any `Quest`.

Parameter(s):

 - questId (string)
 - transform (TransformType) 
 - updateInterval (number)
 - limit (number)
 - order (string) 
 - sortBy (string)
 - completedUsers (boolean)
 - showBackground (boolean)
 - title (string)

  ```ts
LSCQuestLeaderboard(
	"WDepF5" //questId
	{
		position:  Vector3.create(8,5,14), 
		rotation:  Quaternion.fromEulerDegrees(0,0,0),
		scale:  Vector3.create(1,1,1)
	}, //Transform of the leaderboard position in worlda
	5, // updateInterval in seconds
	10, // limit of users to show
	'asc', // order 'asc' or 'desc'
	'elapsedTime', // sortBy 'elapsedTime' or other quest field
	true, // completed users only
	true, // showBackground
	"Egg Hunt 2025"  // title
)
```