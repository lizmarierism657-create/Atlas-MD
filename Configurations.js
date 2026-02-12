require("dotenv").config();

let gg = "1809973866"; // <--- Tu número va aquí para que el bot te obedezca

global.owner = [gg]; 
// Usamos el enlace directo que suele funcionar mejor para evitar el error ENOTFOUND
global.mongodb = "mongodb+srv://lizmarierism657_db_user:vZI8ADN0n2a1Dufy@cluster0.b0d3orn.mongodb.net/?appName=Cluster0";
global.sessionId = process.env.SESSION_ID || "ok";
global.prefa = "/";
global.tenorApiKey = process.env.TENOR_API_KEY || "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
global.packname = `🚩『J𝔸𝖊ｃօ𝖓 Ꮇⅈ Ꮢ𝖊𝘭ⅈɢⅈօN』🛐`;
global.author = "by: 🌹𝙈𝙚𝙞☠︎︎🌹";
global.port = process.env.PORT || "10000";
global.openAiAPI = process.env.OPENAI_API || "Put your openai API key here";

module.exports = {
  mongodb: global.mongodb,
};
