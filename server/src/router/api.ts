import { getCache } from "../utils/cache";
import { PROFILES_CACHE_KEY } from "../utils/initializer";

export function apiRouter(router:any){
  router.get('/api/quests/:questId/users', (req:any, res:any) => {
    const questId = req.params.questId;
    const sortBy = req.query.sortBy || 'elapsedTime'; 
    const order = req.query.orderBy || 'asc';
    const limit = parseInt(req.query.limit as string) || 100;
    const completedOnly = (req.query.completed === 'true');
  
    // 1) load all profiles from cache
    const profiles = getCache(PROFILES_CACHE_KEY);
  
    // 2) build an array of userQuest data
    let userData: any[] = [];
  
    for (const profile of profiles) {
      if (!profile.questsProgress) continue;
  
      // find if the user has this quest
      const info = profile.questsProgress.find((q: any) => q.questId === questId);
      if (!info) continue;

      if (completedOnly && !info.completed) {
        continue;
      }
  
      // compute elapsedTime
      let elapsedTime = info.elapsedTime
  
      // count how many steps completed
      let stepsCompleted = 0;
      let totalSteps = info.steps.length; // or from quest definition
      for (const step of info.steps) {
        if (step.completed) stepsCompleted++;
      }
  
      userData.push({
        userId: profile.ethAddress,
        completed: info.completed,
        timeStarted: info.timeStarted,
        timeCompleted: info.timeCompleted,
        elapsedTime,
        stepsCompleted,
        totalSteps
      });
    }
  
    // 3) sort by the requested field
    userData.sort((a, b) => {
      if (order === 'asc') return a[sortBy] - b[sortBy];
      else return b[sortBy] - a[sortBy];
    });
  
    // 4) limit
    userData = userData.slice(0, limit);
  
    // 5) return JSON
    res.json(userData);
  });

  
  router.get('/api/leaderboard', (req:any, res:any) => {
    try {
      const questId = req.query.questId as string;
      const taskId = req.query.taskId as string | undefined; 
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const order = (req.query.order as string) || 'desc';
      const version = parseInt(req.query.version as string, 10) || 1;
  
      if (!questId) {
        return res.status(400).json({ error: 'Missing questId param.' });
      }
  
      // 1) Get the cached profiles
      const profiles = getCache(PROFILES_CACHE_KEY); // e.g. an array of user profiles
  
      // 2) Build a list of { ethAddress, name, score } for participants
      const scoreboard: Array<{ ethAddress: string; name: string; score: number }> = [];
  
      for (const profile of profiles) {
        if (!profile.questsProgress) continue;
  
        const questRecord = profile.questsProgress.find((q: any) => q.questId === questId && q.version === version);
        if (!questRecord) continue;
  
        // If a specific taskId is provided
        if (taskId) {
          // Find that task
          const userTask = questRecord.tasks.find((t: any) => t.taskId === taskId);
          if (!userTask) {
            // If user doesn't have that task at all, skip them
            continue;
          }
  
          scoreboard.push({
            ethAddress: profile.ethAddress,
            name: profile.name,
            score: userTask.count || 0
          });
        } else {
          // If no taskId is provided, sum all tasks
          let total = 0;
          for (const t of questRecord.tasks) {
            total += (t.count || 0);
          }
          scoreboard.push({
            ethAddress: profile.ethAddress,
            name: profile.name,
            score: total
          });
        }
      }
  
      // 3) Sort the scoreboard
      scoreboard.sort((a, b) => {
        return (order === 'desc')
          ? b.score - a.score  // highest first
          : a.score - b.score; // lowest first
      });
  
      // 4) Take the top 'limit' results
      const sliced = scoreboard.slice(0, limit);
  
      return res.json(sliced);
  
    } catch (err: any) {
      console.error("Error in /leaderboard route:", err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
}