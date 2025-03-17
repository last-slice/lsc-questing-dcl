import config from "@colyseus/tools";
import {monitor} from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { WebSocketTransport } from "@colyseus/ws-transport"
import cors from 'cors'
import { initServer } from "./utils/initializer";
import { router } from "./router";
import { QuestRoom } from "./rooms/QuestRoom";

export default config({
    initializeGameServer: (gameServer) => {
        initServer()
        gameServer.define('angzaar_questing', QuestRoom)
        .filterBy(["questId", "userId"])
    },

    initializeTransport: function(opts) {
        return new WebSocketTransport({
          ...opts,
          pingInterval: 6000,
          pingMaxRetries: 4,
          maxPayload: 1024 * 1024 * 300, // 300MB Max Payload
        });
      },

    initializeExpress: (app) => {
        // app.use(bodyParser.json({ limit: '300mb' }));
        // app.use(bodyParser.urlencoded({limit: '300mb', extended: true }));
        app.use(cors({origin: true}))
        app.options('*', cors());
        app.use('/colyseus', monitor())
        app.use("/playground", playground);

        // app.use((req:any, res:any, next) => {
        //   console.log("Headers:", req.headers);
        //   console.log("Body:", req.body);
        //   console.log("Files:", req.files);
        //   next();
        // });

        app.use("/", router);
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});