require("dotenv").config();

// Tus IDs de dueña (LID y número tradicional)
global.owner = ["114839523426558", "18099973866"]; 

// --- ENLACE CORREGIDO: Se agregó el '@' después de la clave ---
global.mongodb = global.mongodb = "mongodb+srv://Bbc_yummycook:nanika2026@cluster0.b0d3orn.mongodb.net/?retryWrites=true&w=majority";

global.sessionId = "nanika2013";
global.prefa = "/";
global.tenorApiKey = process.env.TENOR_API_KEY || "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
global.packname = `🚩『J𝔸𝖊ｃօ𝖓 Ꮇⅈ Ꮢ𝖊𝘭ⅈɢⅈօN』🛐`;
global.author = "by: 🌹𝙈𝙚𝙞☠︎︎🌹";
global.port = process.env.PORT || "10000";
global.openAiAPI = process.env.OPENAI_API || "Put your openai API key here";

module.exports = {
  mongodb: global.mongodb,
};
