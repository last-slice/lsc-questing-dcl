import { engine } from '@dcl/sdk/ecs';
import mitt from 'mitt';
import './polyfill';
import { LSCQUEST_EVENTS } from './definitions';
import { ConnectQuestSystem } from './connection';
import { CheckPlayerSystem } from './connection';
export let LOCAL_CREATOR = false;
export let pendingQuestConnections = [];
export const lscQuestEvent = mitt();
export const lscQuestConnections = new Map();
export const lscQuestUserData = new Map();
export async function LSCQuestLocalCreator(value) {
    LOCAL_CREATOR = value;
}
export async function LSCQuestConnect(questId) {
    console.log('connecting to quest', questId);
    engine.addSystem(CheckPlayerSystem);
    engine.addSystem(ConnectQuestSystem);
    if (lscQuestConnections.has(questId))
        return;
    pendingQuestConnections.push(questId);
}
export function LSCQuestStart(questId) {
    let questConnection = lscQuestConnections.get(questId);
    if (!questConnection)
        return;
    try {
        questConnection.send(LSCQUEST_EVENTS.QUEST_START, { questId });
    }
    catch (e) {
        console.log('error sending quest action', e);
    }
}
export function LSCQuestAction(questId, stepId, taskId) {
    let questConnection = lscQuestConnections.get(questId);
    if (!questConnection)
        return;
    try {
        questConnection.send(LSCQUEST_EVENTS.QUEST_ACTION, { questId, stepId, taskId, metaverse: "DECENTRALAND" });
    }
    catch (e) {
        console.log('error sending quest action', e);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBc0YsTUFBTSxjQUFjLENBQUE7QUFNekgsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQ3ZCLE9BQU8sWUFBWSxDQUFBO0FBQ25CLE9BQU8sRUFBRSxlQUFlLEVBQW1CLE1BQU0sZUFBZSxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFakQsTUFBTSxDQUFDLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQTtBQUVoQyxNQUFNLENBQUMsSUFBSSx1QkFBdUIsR0FBWSxFQUFFLENBQUE7QUFFaEQsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksRUFBRSxDQUFBO0FBQ25DLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFnQixDQUFBO0FBQzFELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUEyQixDQUFBO0FBT2xFLE1BQU0sQ0FBQyxLQUFLLFVBQVUsb0JBQW9CLENBQUMsS0FBYTtJQUN0RCxhQUFhLEdBQUcsS0FBSyxDQUFBO0FBQ3ZCLENBQUM7QUFPRCxNQUFNLENBQUMsS0FBSyxVQUFVLGVBQWUsQ0FBQyxPQUFjO0lBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDM0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtJQUVwQyxJQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFBRyxPQUFNO0lBQzVDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUN2QyxDQUFDO0FBT0QsTUFBTSxVQUFVLGFBQWEsQ0FBQyxPQUFjO0lBQzFDLElBQUksZUFBZSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN0RCxJQUFHLENBQUMsZUFBZTtRQUFHLE9BQU07SUFFNUIsSUFBRyxDQUFDO1FBQ0YsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQTtJQUM5RCxDQUFDO0lBQ0QsT0FBTSxDQUFLLEVBQUMsQ0FBQztRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDOUMsQ0FBQztBQUNILENBQUM7QUFTRCxNQUFNLFVBQVUsY0FBYyxDQUFDLE9BQWMsRUFBRSxNQUFhLEVBQUUsTUFBYTtJQUN6RSxJQUFJLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDdEQsSUFBRyxDQUFDLGVBQWU7UUFBRyxPQUFNO0lBRTVCLElBQUcsQ0FBQztRQUNGLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFBO0lBQ3pHLENBQUM7SUFDRCxPQUFNLENBQUssRUFBQyxDQUFDO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVuZ2luZSwgRW50aXR5LCBNYXRlcmlhbCwgTWVzaFJlbmRlcmVyLCBUZXh0QWxpZ25Nb2RlLCBUZXh0U2hhcGUsIFRyYW5zZm9ybSwgVHJhbnNmb3JtVHlwZSB9IGZyb20gJ0BkY2wvc2RrL2VjcydcbmltcG9ydCB7IFJlYWN0RWNzUmVuZGVyZXJ9IGZyb20gJ0BkY2wvc2RrL3JlYWN0LWVjcydcbmltcG9ydCB7IENvbG9yNCwgVmVjdG9yMyB9IGZyb20gJ0BkY2wvc2RrL21hdGgnXG5pbXBvcnQge2dldFBsYXllcn0gZnJvbSBcIkBkY2wvc2RrL3BsYXllcnNcIjtcbmltcG9ydCB7IGdldFJlYWxtIH0gZnJvbSAnfnN5c3RlbS9SdW50aW1lJ1xuaW1wb3J0IHsgQ2xpZW50LCBSb29tIH0gZnJvbSAnY29seXNldXMuanMnXG5pbXBvcnQgbWl0dCBmcm9tICdtaXR0J1xuaW1wb3J0ICcuL3BvbHlmaWxsJ1xuaW1wb3J0IHsgTFNDUVVFU1RfRVZFTlRTLCBRdWVzdERlZmluaXRpb24gfSBmcm9tICcuL2RlZmluaXRpb25zJztcbmltcG9ydCB7IENvbm5lY3RRdWVzdFN5c3RlbSB9IGZyb20gJy4vY29ubmVjdGlvbic7XG5pbXBvcnQgeyBDaGVja1BsYXllclN5c3RlbSB9IGZyb20gJy4vY29ubmVjdGlvbic7XG5cbmV4cG9ydCBsZXQgTE9DQUxfQ1JFQVRPUiA9IGZhbHNlXG5cbmV4cG9ydCBsZXQgcGVuZGluZ1F1ZXN0Q29ubmVjdGlvbnM6c3RyaW5nW10gPSBbXVxuXG5leHBvcnQgY29uc3QgbHNjUXVlc3RFdmVudCA9IG1pdHQoKVxuZXhwb3J0IGNvbnN0IGxzY1F1ZXN0Q29ubmVjdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgUm9vbT4oKVxuZXhwb3J0IGNvbnN0IGxzY1F1ZXN0VXNlckRhdGEgPSBuZXcgTWFwPHN0cmluZywgUXVlc3REZWZpbml0aW9uPigpXG5cbi8qKlxuICogU2V0IHRoZSBsb2NhbCBjcmVhdG9yIGZvciB0ZXN0aW5nXG4gKlxuICogQHBhcmFtIHF1ZXN0SWRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIExTQ1F1ZXN0TG9jYWxDcmVhdG9yKHZhbHVlOmJvb2xlYW4pIHtcbiAgTE9DQUxfQ1JFQVRPUiA9IHZhbHVlXG59XG5cbi8qKlxuICogQ29ubmVjdCB0byBhIFF1ZXN0IHdpdGhpbiB0aGUgTFNDIFF1ZXN0IFN5c3RlbVxuICpcbiAqIEBwYXJhbSBxdWVzdElkXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBMU0NRdWVzdENvbm5lY3QocXVlc3RJZDpzdHJpbmcpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RpbmcgdG8gcXVlc3QnLCBxdWVzdElkKVxuICBlbmdpbmUuYWRkU3lzdGVtKENoZWNrUGxheWVyU3lzdGVtKVxuICBlbmdpbmUuYWRkU3lzdGVtKENvbm5lY3RRdWVzdFN5c3RlbSlcblxuICBpZihsc2NRdWVzdENvbm5lY3Rpb25zLmhhcyhxdWVzdElkKSkgIHJldHVyblxuICBwZW5kaW5nUXVlc3RDb25uZWN0aW9ucy5wdXNoKHF1ZXN0SWQpXG59XG5cbi8qKlxuICogU3RhcnQgYSBzcGVjaWZpYyBRdWVzdCBpbiB0aGUgTFNDIFF1ZXN0IFN5c3RlbVxuICpcbiAqIEBwYXJhbSBxdWVzdElkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMU0NRdWVzdFN0YXJ0KHF1ZXN0SWQ6c3RyaW5nKXtcbiAgbGV0IHF1ZXN0Q29ubmVjdGlvbiA9IGxzY1F1ZXN0Q29ubmVjdGlvbnMuZ2V0KHF1ZXN0SWQpXG4gIGlmKCFxdWVzdENvbm5lY3Rpb24pICByZXR1cm5cblxuICB0cnl7XG4gICAgcXVlc3RDb25uZWN0aW9uLnNlbmQoTFNDUVVFU1RfRVZFTlRTLlFVRVNUX1NUQVJULCB7cXVlc3RJZH0pXG4gIH1cbiAgY2F0Y2goZTphbnkpe1xuICAgIGNvbnNvbGUubG9nKCdlcnJvciBzZW5kaW5nIHF1ZXN0IGFjdGlvbicsIGUpXG4gIH1cbn1cblxuLyoqXG4gKiBSdW4gYSBRdWVzdCBBY3Rpb24gd2l0aGluIHRoZSBMU0MgUXVlc3QgU3lzdGVtXG4gKlxuICogQHBhcmFtIHF1ZXN0SWRcbiAqIEBwYXJhbSBzdGVwSWRcbiAqIEBwYXJhbSB0YXNrSWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExTQ1F1ZXN0QWN0aW9uKHF1ZXN0SWQ6c3RyaW5nLCBzdGVwSWQ6c3RyaW5nLCB0YXNrSWQ6c3RyaW5nKXtcbiAgbGV0IHF1ZXN0Q29ubmVjdGlvbiA9IGxzY1F1ZXN0Q29ubmVjdGlvbnMuZ2V0KHF1ZXN0SWQpXG4gIGlmKCFxdWVzdENvbm5lY3Rpb24pICByZXR1cm5cblxuICB0cnl7XG4gICAgcXVlc3RDb25uZWN0aW9uLnNlbmQoTFNDUVVFU1RfRVZFTlRTLlFVRVNUX0FDVElPTiwge3F1ZXN0SWQsIHN0ZXBJZCwgdGFza0lkLCBtZXRhdmVyc2U6XCJERUNFTlRSQUxBTkRcIn0pXG4gIH1cbiAgY2F0Y2goZTphbnkpe1xuICAgIGNvbnNvbGUubG9nKCdlcnJvciBzZW5kaW5nIHF1ZXN0IGFjdGlvbicsIGUpXG4gIH1cbn0iXX0=