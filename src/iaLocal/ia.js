import axios from "axios";
function removeThinkTags(message) {
  return message.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}
const ollamaConnect = async (prompt)=>{
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "deepseek-r1:8b",  // Utilise le bon modèle ici
      prompt: prompt,
      stream: false,  // Mets "true" si tu veux du streaming
    });
    const msg =removeThinkTags(response.data.response);

    console.log("Réponse:",msg);
    return msg;
  } catch (error) {
    console.error("Erreur:", error.message);
    return error.message
  }
}
export default ollamaConnect;
// let   msg = ollamaConnect(`In less than 500 characters, I want an answer in French without adding more writing  ."${msg}"`);


