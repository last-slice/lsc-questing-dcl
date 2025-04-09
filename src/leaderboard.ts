import { engine, Entity, Material, MeshRenderer, TextAlignMode, TransformType } from "@dcl/sdk/ecs";
import { TextShape, Transform } from "@dcl/sdk/ecs";
import { Color4, Vector3 } from "@dcl/sdk/math";
import { getPlayer } from "@dcl/sdk/players";
import { DEBUG } from "./definitions";


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
  const leftPos = -1.3
  const centerPos = 0
  const rightPos = 1
  
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
      let response = await fetch( DEBUG ? `http://localhost:5353/api/quests/${questId}/users?` + params.join('&') : `https://angzaar-plaza.dcl-iwb.co/ws/api/quests/${questId}/users?` + params.join('&')) 
      let data = await response.json()
      // console.log('leaderboard data:', data);
      
      // Check if data is empty
      if (!data || data.length === 0) {
        // Show "no data" message in the first row
        const row = leaderboardRows[0]
        if (Transform.has(row.rowEntity)) {
          Transform.getMutable(row.rowEntity).scale = Vector3.create(1, 1, 1)
          
          if (showBackground) {
            Transform.getMutable(row.backgroundEntity).scale = Vector3.create(rowWidth, rowHeight, 1)
          }
          
          TextShape.getMutable(row.rankEntity).text = ""
          TextShape.getMutable(row.nameEntity).text = "No data available"
          TextShape.getMutable(row.scoreEntity).text = ""
          
          // Hide profile image
          Transform.getMutable(row.profileEntity).scale = Vector3.Zero()
          
          // Hide remaining rows
          for (let i = 1; i < leaderboardRows.length; i++) {
            const remainingRow = leaderboardRows[i]
            if (Transform.has(remainingRow.rowEntity)) {
              Transform.getMutable(remainingRow.rowEntity).scale = Vector3.Zero()
              if (showBackground) {
                Transform.getMutable(remainingRow.backgroundEntity).scale = Vector3.Zero()
              }
            }
          }
          return
        }
      }
      
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
          TextShape.getMutable(row.nameEntity).text = name.length > 10 ? name.slice(0, 10) : name
          
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
      // Show error message in the first row
      const row = leaderboardRows[0]
      if (Transform.has(row.rowEntity)) {
        Transform.getMutable(row.rowEntity).scale = Vector3.create(1, 1, 1)
        
        if (showBackground) {
          Transform.getMutable(row.backgroundEntity).scale = Vector3.create(rowWidth, rowHeight, 1)
        }
        
        TextShape.getMutable(row.rankEntity).text = ""
        TextShape.getMutable(row.nameEntity).text = "Error loading data"
        TextShape.getMutable(row.scoreEntity).text = ""
        
        // Hide profile image
        Transform.getMutable(row.profileEntity).scale = Vector3.Zero()
        
        // Hide remaining rows
        for (let i = 1; i < leaderboardRows.length; i++) {
          const remainingRow = leaderboardRows[i]
          if (Transform.has(remainingRow.rowEntity)) {
            Transform.getMutable(remainingRow.rowEntity).scale = Vector3.Zero()
            if (showBackground) {
              Transform.getMutable(remainingRow.backgroundEntity).scale = Vector3.Zero()
            }
          }
        }
      }
    }
  }

  engine.addSystem(leaderboardUpdate)

  // ReactEcsRenderer.setUiRenderer(uiComponent)
}