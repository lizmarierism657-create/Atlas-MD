const fs = require("fs");
const axios = require("axios");
const path = require("path");
const package = require("../package.json");

let mergedCommands = [
  "help",
  "h",
  "menu",
  "sc",
  "support",
  "supportgc",
  "script",
];

module.exports = {
  name: "systemcommands",
  alias: [...mergedCommands],
  uniquecommands: ["script", "support", "help"],
  description: "All system commands",
  start: async (
    Atlas,
    m,
    { pushName, prefix, inputCMD, doReact, text, args }
  ) => {
    const pic = fs.readFileSync("./Assets/Atlas.jpg"); // Puedes cambiar la imagen si quieres

    switch (inputCMD) {
      case "script":
      case "sc":
        await doReact("🧣");
        let repoInfo = await axios.get(
          "https://api.github.com/repos/FantoX/Atlas-MD"
        );
        let repo = repoInfo.data;

        let txt = `🧣 *Nanika's Script* 🧣\n\n*🎀 Total Forks:* ${
          repo.forks_count
        }\n*⭐ Total Stars:* ${repo.stargazers_count}\n*📜 License:* ${
          repo.license.name
        }\n*📁 Repo Size:* ${(repo.size / 1024).toFixed(2)} MB\n*📅 Last Updated:* ${
          repo.updated_at
        }\n\n*🔗 Repo Link:* ${repo.html_url}\n\n❝ No olvides dar una ⭐ al repo. Está hecho con esfuerzo por *Team ATLAS*. ❞`;

        Atlas.sendMessage(m.from, { image: pic, caption: txt }, { quoted: m });
        break;

      case "support":
      case "supportgc":
        await doReact("🔰");
        let txt2 = `🧣 *Support Group* 🧣\n\n*Nanika* está siempre disponible para ayudarte.  
\n*Link:* ${suppL || "Sin link disponible"}\n\nNota: Por favor, no hagas spam en el grupo y no envíes mensajes directos a los admins sin permiso. Pregunta dentro del grupo.\n\nGracias por usar a Nanika.`;
        Atlas.sendMessage(m.from, { image: pic, caption: txt2 }, { quoted: m });
        break;

      case "help":
      case "h":
      case "menu":
        await doReact("☃️");
        await Atlas.sendPresenceUpdate("composing", m.from);

        function readUniqueCommands(dirPath) {
          const allCommands = [];
          const files = fs.readdirSync(dirPath);

          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
              const subCommands = readUniqueCommands(filePath);
              allCommands.push(...subCommands);
            } else if (stat.isFile() && file.endsWith(".js")) {
              const command = require(filePath);

              if (Array.isArray(command.uniquecommands)) {
                const subArray = [file, ...command.uniquecommands];
                allCommands.push(subArray);
              }
            }
          }

          return allCommands;
        }

        function formatCommands(allCommands) {
          let formatted = "";

          for (const [file, ...commands] of allCommands) {
            const capitalizedFile =
              file.replace(".js", "").charAt(0).toUpperCase() +
              file.replace(".js", "").slice(1);

            formatted += `╟   🏮 *${capitalizedFile}* 🏮   ╢\n\n`;
            formatted += `\`\`\`${commands
              .map((cmd) => `⥼   ${prefix + cmd}`)
              .join("\n")}\`\`\`\n\n\n`;
          }

          return formatted.trim();
        }

        const pluginsDir = path.join(process.cwd(), "Plugins");
        const allCommands = readUniqueCommands(pluginsDir);
        const formattedCommands = formatCommands(allCommands);

        const helpText = `👋 Hola *${pushName}* baby,\n\nSoy *Nanika*, tu amiga de confianza en WhatsApp.  
Estoy aquí para ayudarte a usar todos los comandos de manera fácil y rápida.\n\n*🔖 Mi prefijo es:* ${prefix}\n\n${formattedCommands}\n\n✨ Disfruta y pásalo bien conmigo 💕`;

        await Atlas.sendMessage(
          m.from,
          { text: helpText },
          { quoted: m }
        );

        break;

      default:
        break;
    }
  },
};
