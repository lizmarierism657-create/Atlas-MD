const got = require("got");
const fs = require("fs");
const path = require("path");
const { readcommands } = require("../System/ReadCommands.js");
const {
  pushPlugin,
  isPluginPresent,
  delPlugin,
  getAllPlugins,
  checkMod,
} = require("../System/MongoDB/MongoDb_Core.js");

let mergedCommands = ["install", "uninstall", "plugins", "pluginlist"];

module.exports = {
  name: "plugininstaller",
  alias: [...mergedCommands],
  uniquecommands: ["install", "uninstall", "plugins", "pluginlist"],
  description: "Instala, desinstala y lista plugins (Solo Texto)",
  start: async (Atlas, m, { text, prefix, inputCMD, isCreator, isintegrated, doReact }) => {
    
    // Verificación de Mods/Owner
    const chechSenderModStatus = await checkMod(m.sender);
    const hasPermission = isCreator || isintegrated || chechSenderModStatus;

    switch (inputCMD) {
      case "install":
        if (!hasPermission) return m.reply("Sorry, only *Owners* and *Mods* can use this!");
        try {
          let url = new URL(text);
          if (url.host === "gist.github.com") {
            url = url.toString() + "/raw";
          } else {
            url = url.toString();
          }
          let { body, statusCode } = await got(url);
          if (statusCode == 200) {
            let fileName = path.basename(url);
            if (await isPluginPresent(fileName) || fs.existsSync(`./Plugins/${fileName}`)) {
              return m.reply(`*${fileName}* already installed!`);
            }
            fs.writeFileSync(path.join("Plugins", fileName), body);
            await pushPlugin(fileName, text);
            await readcommands();
            m.reply(`*${fileName}* Installed Successfully!`);
          }
        } catch (e) {
          m.reply("Invalid URL!");
        }
        break;

      case "plugins":
        await doReact("🧩");
        const plugins = await getAllPlugins();
        if (!plugins.length) return m.reply("No additional plugins installed!");
        let txt = "*『 Installed Plugins List 』*\n\n";
        plugins.forEach((p, i) => {
          txt += `🔖 *${i + 1}.* ${p.plugin}\n🔗 ${p.url}\n\n`;
        });
        m.reply(txt);
        break;

      case "uninstall":
        if (!hasPermission) return m.reply("Only for Mods!");
        if (!text) return m.reply(`Example: ${prefix}uninstall audioEdit.js`);
        if (fs.existsSync(`./Plugins/${text}`)) {
          fs.unlinkSync(`./Plugins/${text}`);
          await delPlugin(text);
          await readcommands();
          m.reply(`*${text}* uninstalled!`);
        } else {
          m.reply("Plugin not found.");
        }
        break;

      case "pluginlist":
        await doReact("🧩");
        let listText = `*『 Installable Plugins List 』*\n\n` +
          `🎀 *audioEdit.js*\n🔗 https://gist.github.com\n\n` +
          `🎀 *chat-GPT.js*\n🔗 https://gist.github.com\n\n` +
          `🎀 *tiktokdl.js*\n🔗 https://gist.github.com\n\n` +
          `*(Usa ${prefix}install [url] para instalarlos)*`;
        
        // AQUÍ ESTABA EL ERROR: Cambiado de image a text
        await Atlas.sendMessage(m.from, { text: listText }, { quoted: m });
        break;
    }
  },
};
