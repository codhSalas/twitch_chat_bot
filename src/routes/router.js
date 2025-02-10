import { Template } from "ejs";
import crypto from 'crypto';
import ngrok from 'ngrok'
import {getAccessToken , getUserID ,sendMessage} from "../getdata/getdata.js"
import dotenv from 'dotenv'
import tmi from 'tmi.js'
import ollamaConnect from "../iaLocal/ia.js"
dotenv.config()

const WEBHOOK_SECRET = crypto.randomBytes(16).toString('hex');
const TWITCH_CLIENT_ID = process.env.CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';


const SCOPES =['user:write:chat','chat:read']
let userAccesToken = process.env.ACCESS_TOKEN;
let CLIENT_TS ; 
const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES.join(' ')}`;
const CALLBACK_URL = `https://626d-46-193-66-170.ngrok-free.app/webhook}`;

const tmiClient = new tmi.Client({
  options: { debug: true },
  connection: {
      secure: true,
      reconnect: true
  },
  identity: {
      username: process.env.BOT_USERNAME,
      password: process.env.CLIENT_TS
  },
  channels: [process.env.CHANNEL_NAME]
})

const recentMessages = []
const MAX_MESSAGES = 100

export async function connectTwitchChat() {
  try {
      await tmiClient.connect()
      console.log('Successfully connected to Twitch chat')
  } catch (error) {
      console.error('Failed to connect to Twitch:', error?.message || 'Unknown error')

      if (error?.message && typeof error.message === 'string') {
          if (error.message.includes('authentication failed')) {
              console.error(`
                  Authentication Error Tips:
                  1. Ensure CLIENT_TS starts with 'oauth:'
                  2. Verify the token is valid and has not expired
                  3. Check that the bot username matches the token's account
                  4. Confirm the token has required chat scopes
              `)
          }
      }

      process.exit(1)
  }
}

tmiClient.on('message', async (channel, tags, message, self) => {
  if (self) return

  const chatMessage = {
      channel,
      username: tags['display-name'],
      message,
      timestamp: new Date(),
      id: tags.id,
      subscriber: tags.subscriber,
      mod: tags.mod
  }
  const pattern = /!bothein/i;
if (pattern.test(chatMessage.message)) {
  let msg = chatMessage.message
  console.log(`message :${chatMessage.username}: ${msg}`)
  msg = msg.substring(10)
  msg =await ollamaConnect(`In less than 500 characters, I want an answer in French."${msg}"`);
  await sendMessage(userAccesToken , msg ,"codhein_404" ,"codhein_404")

}
 
})

tmiClient.on('disconnected', (reason) => {
  console.error('Disconnected from Twitch:', reason || 'Unknown reason')
})



export const messagesTwitch = (req ,res)=>{
return { messages: recentMessages }

} 

export const health = async (request, reply) => {
return { 
  status: 'ok',
  connected: tmiClient.readyState() === 'OPEN'
}
}

export const main = (req ,res)=>{
  return res.view('templates/index.ejs')
}
export const getTwitchName = async(req ,res)=>{
  try {
    const twitch_names= {...req.query};
    console.log("je suis ici",twitch_names)
    const braodcast_name =  twitch_names["braodcast_name"]
    const sender_name = twitch_names["sender_id"]
    const message = twitch_names["message"]
    sendMessage(userAccesToken,message,braodcast_name,sender_name);
    console.log(braodcast_name , sender_name) 
  } catch (error) {
    console.log("y a un probleme ");
  }
  return res.redirect("/")
}

export const callauth =(req,res)=>{
  return res.redirect(authUrl);
}


export const getCallBack = async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.code(400).send({ error: 'Code d\'autorisation manquant' });
  }

  try {
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      })
    });
  const tokenData = await tokenResponse.json();
    
  if (!tokenResponse.ok) {
    throw new Error(`Erreur lors de l'échange du token: ${tokenData.message || 'Erreur inconnue'}`);
  }
  // Pour le user access token, l'idéal serait d'ajouter une base de données et de ne pas le mettre manuellement dans le fichier d'environnement. 
  userAccesToken = tokenData.access_token;
  CLIENT_TS = `auth:${tokenData.access_token}`
  console.log(userAccesToken)
  await connectTwitchChat();

  res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};
export const sendUserMessage = async (req,res)=>{
  console.log(userAccesToken);
  return res.redirect("/");
}
