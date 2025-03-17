import { Client } from "colyseus";
import { getCache } from "./cache";
import { PROFILES_CACHE_KEY } from "./initializer";
import { Profile } from "./types";

export const profileExists = (options:{ipAddress:string, userId:string}) => {
  const {userId, ipAddress} = options
  const profiles:Profile[] = getCache(PROFILES_CACHE_KEY);
  return profiles.find((profile) => profile.ethAddress === userId && profile.ipAddress === ipAddress)
}

export function resetAllProfiles(){
  let profiles = getCache(PROFILES_CACHE_KEY)
  profiles.forEach((profile:any)=>{
    profile.deployments = 0,
    profile.dust = 0,
    profile.goals = 0,
    profile.wins = 0,
    profile.losses = 0,
    profile.distance = 0,
    profile.blitzPlays = 0,
    profile.arcadePlays = 0
  })
}

export function resetAllBlitzProfiles(){
  let profiles = getCache(PROFILES_CACHE_KEY)
  profiles.forEach((profile:any)=>{
    profile.goals = 0,
    profile.wins = 0,
    profile.losses = 0,
    profile.distance = 0,
    profile.blitzPlays = 0,
    profile.arcadePlays = 0
  })
}

export const validateAndCreateProfile = async (
  client:Client,
    options:any,
    req: any
  ): Promise<any> => {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.address().address;
    const {userId, name } = options

    console.log('ip is', ipAddress)

    // console.log('validating options', options)

        // if(isBanned(userId)){
        //   console.log('user is banned')
        //   throw new Error("User Banned");
        // }
        
        // if(!optionsValidated(options)){
        //   throw new Error("Invalid login parameters");
        // }

    // Get profiles from cache with proper typing
    const profiles:Profile[] = getCache(PROFILES_CACHE_KEY);

    let profile:any = profileExists({userId, ipAddress})
    if(profile){
      console.log('we found the profile already exists')
      console.log("checking for duplicate information")
      // Check for duplicate userId or ipAddress
      // const alreadyUserId = profiles.find((profile) => profile.ethAddress === userId)
      // if(alreadyUserId && alreadyUserId.ipAddress !== ipAddress){
      //   console.log('theres already a user with that wallet, check ip')
      //   throw new Error("User ID or IP address is already in use.");
      // }

     // Check for duplicate userId or ipAddress
    //  const alreadyIPAddress = profiles.filter((profile) => profile.ethAddress === userId)
    //  if(alreadyIPAddress.length > 3){
    //    console.log('that user has used too many ip')
    //    throw new Error("Too Many IP");
    //  }

     console.log('profile is good to log in, see if they have dust created, if not create it with 0')
     if(!profile.hasOwnProperty('dust')){
      profile.dust = 0
     }

     if(!profile.hasOwnProperty("questsProgress")){
      profile.questsProgress = []
     }
    }else{
      // Create new profile if no duplicate is found
      profile = {
        ethAddress: userId,
        ipAddress,
        name: name,
        createdDate: new Date(),
        deployments: 0,
        dust:0,
        goals:0,
        wins:0,
        losses:0,
        distance:0,
        blitzPlays:0,
        arcadePlays:0,
        web3:false,
        questsProgress:[]
      }
      profiles.push(profile)
      console.log('created new profile!')
      // Update cache and sync to file
      // await updateCache(PROFILES_FILE, PROFILES_CACHE_KEY, profiles);
    }

    client.userData = options
    client.userData.ip = ipAddress

    if(!options.realm){
      throw new Error("Invalid realm info")
    }

    if(process.env.ENV === "Development"){
      client.userData.web3 = true
      profile.web3 =true
      profile.name = client.userData.name
    }else{
      // console.log(`profile url is ${options.realm}/lambdas/profiles/${options.userId}`)

      try{
        let data:any = await fetch(`${options.realm}/lambdas/profiles/${options.userId}`)
        let profileData = await data.json()
        // console.log('profile data is', profileData)
        if(profileData.error){
          console.log('remote profile error', profileData)
          throw new Error("Invalid remote profile")
        }
        client.userData.name = profileData.avatars[0].name
        client.userData.web3 = profileData.avatars[0].hasConnectedWeb3
        profile.web3 = profileData.avatars[0].hasConnectedWeb3
        profile.name = profileData.avatars[0].name
  
        let comms:any = await fetch(`${options.realm}/comms/peers`)
        let commsData = await comms.json()
        if(commsData.ok){
          if(!commsData.peers.find((data:any)=> data.address === client.userData.userId.toLowerCase())){
            throw new Error("User not found on realm server")
          }
        }else{
          throw new Error("Error fetching realm peer status")
        }
      }
      catch(e:any){
        console.log('error fetching remote profile, trying different realm provider', e)

        try{
          let data:any = await fetch(`https://realm-provider.decentraland.org/lambdas/profiles/${options.userId}`)
          let profileData = await data.json()
          // console.log('profile data is', profileData)
          if(profileData.error){
            console.log('remote profile error', profileData)
            throw new Error("Invalid remote profile")
          }
          client.userData.name = profileData.avatars[0].name
          client.userData.web3 = profileData.avatars[0].hasConnectedWeb3
          profile.web3 = profileData.avatars[0].hasConnectedWeb3
          profile.name = profileData.avatars[0].name
    
          let comms:any = await fetch(`${options.realm}/comms/peers`)
          let commsData = await comms.json()
          if(commsData.ok){
            if(!commsData.peers.find((data:any)=> data.address === client.userData.userId.toLowerCase())){
              throw new Error("User not found on realm server")
            }
          }else{
            throw new Error("Error fetching realm peer status")
          }
        }
        catch(e:any){
          console.log('error fetching remote profile', e)
          return false
        }
      }
      
    }
    
    client.auth = {} 
    client.auth.profile = {...profile}
    // console.log('we have full auth')
  };
