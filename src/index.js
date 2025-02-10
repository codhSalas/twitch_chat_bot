import fastify from "fastify";
import fastifyView from '@fastify/view';
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import ejs from 'ejs';
import path ,{ dirname , join} from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import dotenv from 'dotenv'
import { main , getTwitchName, callauth, getCallBack, sendUserMessage,health,messagesTwitch,connectTwitchChat } from "./routes/router.js";
dotenv.config();
const app = fastify();
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
app.register(fastifyView ,{
  engine:{
    ejs
  }
});
app.register (fastifyStatic ,{
  root:join(rootDir,'public')
});
app.register(fastifyFormbody);

app.get("/",main);
app.get("/data", getTwitchName);

app.get("/auth",callauth);
app.get("/callback",getCallBack);
app.get("/send",sendUserMessage);

app.get('/messages',messagesTwitch)
app.get('/health',health)




const portExt = process.env.PORT || 5000;

const start = async () =>{
  try {
    await connectTwitchChat()
    console.log("start server :http://localhost:3000/ ");
    await app.listen({port : portExt , host: '0.0.0.0'});
  } catch (err) {
    console.error(err);
    process.exit(1); 
  }
}

start();
