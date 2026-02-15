const { checkWelcome } = require("./MongoDB/MongoDb_Core.js");

module.exports = async (Atlas, anu) => {
  try {
    let metadata = await Atlas.groupMetadata(anu.id);
    let participants = anu.participants;

    for (let num of participants) {
      if (anu.action == "add") {
        const WELstatus = await checkWelcome(anu.id);
        console.log(`\n+${num.split("@")[0]} Entró a: ${metadata.subject}\n`);

        let Atlastext = `˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙
  🚩 『 J𝔸𝖊𝖈𝖔𝖓  Ꮇⅈ  Ꮢ𝖊𝖑ⅈɢⅈ𝖔𝖓 』 🛐
˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙

✧ 🕊️ ✧ *𝑩𝑰𝑬𝑵𝑽𝑬𝑵𝑰𝑫@ 𝑨 𝑳𝑨 𝑹𝑬𝑳𝑰𝑮𝑰𝑶́𝑵* ✧ 🕊️ ✧

❝ @${num.split("@")[0]}, *has sido recibido en las tierras de este gran paraíso. Deseamos que este espacio sea tu lugar seguro, donde el arte de los Manhwas nos una y puedas forjar amistades tan profundas como las historias que compartimos.*

📜 𝑶 𝑹 𝑫 𝑬 𝑵  𝑫 𝑬 𝑳  𝕾 𝕬 𝕹 𝕮 𝕿 𝖀 𝕬 𝕽 𝕴 𝕺
━━━━━━━━━━━━━━━━━━━━
🌸 *𝑬𝒍 𝑴𝒖𝒓𝒐* ∷ Los enlaces externos están prohibidos.
🌸 *𝑬𝒍 𝑹𝒆𝒔𝒑𝒆𝒕𝒐* ∷ Cero contenido Gore, CP o acoso.
🌸 *𝑬𝒍 𝑶𝒓𝒅𝒆𝒏* ∷ Pedidos solo con ficha oficial.
🌸 *𝑳𝒂 𝑱𝒐𝒅𝒂* ∷ Chat libre, memes y stickers.
━━━━━━━━━━━━━━━━━━━━

📚 𝒁𝑶𝑵𝑨 𝑫𝑬 𝑨𝑷𝑶𝑹𝑻𝑬𝑺:
https://chat.whatsapp.com

🫂 *Si tienes dudas, los Admins estamos para guiarte.*

˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙ ˙
         ✨ ¡ 𝑫𝒊𝒔𝒇𝒓𝒖𝒕𝒂  𝒆𝒍  𝒑𝒂𝒓𝒂𝒊́𝒔𝒐 ! ✨`;

        if (WELstatus) {
          await Atlas.sendMessage(anu.id, {
            text: Atlastext,
            mentions: [num],
          });
        }
      }
    }
  } catch (err) {
    console.log("Error en Welcome:", err);
  }
};
