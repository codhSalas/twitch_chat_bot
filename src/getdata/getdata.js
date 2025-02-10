import dotenv from 'dotenv'
dotenv.config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

export const getAccessToken = async () =>{
  const request = await fetch('https://id.twitch.tv/oauth2/token',{
    method : 'POST',
    Headers : {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body:new URLSearchParams({
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET,
      'grant_type': 'client_credentials'
    })
  });

  const resp = await request.json();
  return(resp["access_token"]);
}
const ACCESS_TOKEN = await getAccessToken();

export const getUserID = async (userName='codhein_404')=>{

  const SENDER_URL = `https://api.twitch.tv/helix/users?login=${userName}`
  const SENDER_HEADER = { 
    'Client-ID': CLIENT_ID,
    'Authorization': `Bearer ${ACCESS_TOKEN}` 
  }
  const request = await fetch(SENDER_URL , {
    method : 'GET',
    headers : SENDER_HEADER
  }); 
  const resp = await request.json();
  return resp['data'][0]['id'];
}

export const sendMessage = async (USER_UNIQUE_TOKEN,message='il se passe quoi petite merde', braodcast_name = "codhein_404", sender_name = "codhein_404") => {
  const url = 'https://api.twitch.tv/helix/chat/messages';

  const headers = {
    'Authorization': `Bearer ${USER_UNIQUE_TOKEN}`,
    'Client-Id': CLIENT_ID,
    'Content-Type': 'application/json'
  };

  const broadcaster_id = await getUserID(braodcast_name);
  const sender_id = await getUserID(sender_name);

  const body = JSON.stringify({
    "broadcaster_id": broadcaster_id,
    "sender_id": sender_id,
    "message": message
  });

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    const data = await resp.json();
    console.log("Réponse API Twitch:", data);

    if (!resp.ok) {
      throw new Error(`Erreur Twitch: ${data.message || "Réponse invalide"}`);
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
  }
};