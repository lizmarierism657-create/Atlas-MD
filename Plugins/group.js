const fs = require("fs");
const Jimp = require("jimp");
const moment = require("moment-timezone");

const {
  setWelcome,
  checkWelcome,
  delWelcome,
  setAntilink,
  checkAntilink,
  delAntilink,
  setGroupChatbot,
  checkGroupChatbot,
  delGroupChatbot,
} = require("../System/MongoDB/MongoDb_Core");

let mergedCommands = [
  "admins",
  "admin",
  "setgcname",
  "delete",
  "del",
  "demote",
  "gclink",
  "grouplink",
  "group",
  "gc",
  "groupinfo",
  "gcinfo",
  "hidetag",
  "htag",
  "leave",
  "promote",
  "remove",
  "revoke",
  "setgcdesc",
  "setppgc",
  "tagall",
  "chatbotgc",
  "antilink",
  "welcome",
];

module.exports = {
  name: "groupmanagement",
  alias: [...new Set(mergedCommands)],
  uniquecommands: [...new Set(mergedCommands)],
  description: "All Group Management Commands",

  start: async (
    Atlas,
    m,
    {
      inputCMD,
      text,
      prefix,
      doReact,
      args,
      itsMe,
      participants,
      metadata,
      mentionByTag,
      mime,
      isMedia,
      quoted,
      botNumber,
      isBotAdmin,
      groupAdmin,
      isAdmin,
      isCreator,
    }
  ) => {
    // Detect sender y bot correctamente
    const senderJid = Atlas.decodeJid(m.key.participant || m.key.remoteJid);
    const cleanSender = senderJid.split("@")[0];
    const cleanBot = botNumber.split("@")[0];

    isCreator =
      [cleanBot, ...global.owner.map((v) => v.replace(/[^0-9]/g, ""))].includes(
        cleanSender
      );

    isAdmin = m.isGroup ? groupAdmin.includes(senderJid) : false;
    itsMe = cleanSender === cleanBot;

    const quotedsender = m.quoted ? m.quoted.sender : mentionByTag?.[0];

    switch (inputCMD) {
      case "admins":
      case "admin": {
        let message;
        if (!isMedia) {
          message = m.quoted ? m.quoted.msg : "『 *Attention Admins* 』";
        } else {
          message = "『 *Attention Admins* 』\n\n*🎀 Message:* Check this Out !";
        }

        await doReact("🏅");

        await Atlas.sendMessage(
          m.from,
          { text: message, mentions: groupAdmin },
          { quoted: m }
        );
        break;
      }

      case "setgcname": {
        if (!isAdmin && !isCreator)
          return m.reply(`You must be Admin to use this command!`);

        if (!isBotAdmin)
          return m.reply(`Bot must be Admin to use this command!`);

        if (!text)
          return m.reply(
            `Provide new group name!\nExample: ${prefix}setgcname Bot Testing`
          );

        await doReact("🎐");

        const oldGCName = metadata.subject;

        await Atlas.groupUpdateSubject(m.from, text);

        await m.reply(
          `*Group Name Updated*\n\nOld: ${oldGCName}\nNew: ${text}`
        );
        break;
      }

      case "delete":
      case "del": {
        if (!m.quoted)
          return m.reply(`Reply to a message to delete it!`);

        if (!isBotAdmin && !m.quoted.sender.includes(botNumber))
          return m.reply(`I can only delete my own messages.`);

        const key = {
          remoteJid: m.from,
          fromMe: m.quoted.sender.includes(botNumber),
          id: m.quoted.id,
          participant: m.quoted.sender,
        };

        await Atlas.sendMessage(m.from, { delete: key });
        break;
      }

      case "group":
      case "gc": {
        if (!isAdmin && !isCreator)
          return m.reply(`Admin only command.`);
        await doReact("✅");
        await m.reply(`This is a group command!`);
        break;
      }

      // Puedes agregar más comandos aquí como promote, demote, leave, tagall, welcome, etc.

      default:
        break;
    }
  },
};
