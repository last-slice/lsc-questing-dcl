import express, { Request, Response } from "express";
import { adminRouter } from "./admin";
import { apiRouter } from "./api";
import { getCache } from "../utils/cache";

export const router = express.Router();
adminRouter(router)
apiRouter(router)

router.get("/hello-world", async function(req: express.Request, res: express.Response) {
  console.log('hello world')
  res.status(200).json({result: "hello world"})
})