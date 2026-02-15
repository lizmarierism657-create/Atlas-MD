require("./Configurations");
require("./System/BotCharacters");
const chalk = require("chalk");
const axios = require("axios");
const prefix = global.prefa;
const { QuickDB, JSONDriver } = require("quick.db");

module.exports = async (Atlas, m, commands, chatUpdate) => {
  try {
    const jsonDriver = new JSONDriver();
    const db = new QuickDB({ driver: jsonDriver });

    const { type, isGroup, sender, from } = m;

    const body =
      type === "buttonsResponseMessage"
        ? m.message[type].selectedButtonId
        : type === "listResponseMessage"
        ? m.message[type].singleSelectReply.selectedRowId
        : type === "templateButtonReplyMessage"
        ? m.message[type].selectedId
        : m.text || "";

    const response = body?.startsWith(prefix) ? body : "";

    const metadata = isGroup ? await Atlas.groupMetadata(from) : {};
    const pushname = m.pushName || "NO name";
    const participants = isGroup ? metadata.participants : [sender];
    const quoted = m.quoted ? m.quoted : m;

    const groupAdmin = isGroup
      ? participants.filter((v) => v.admin !== null).map((v) => v.id)
      : [];

    const botNumber = await Atlas.decodeJid(Atlas.user.id);

    // ---------------- ARREGLO ADMIN/CREATOR ----------------

    const senderJid = Atlas.decodeJid(m.key.participant || m.key.remoteJid);
    const cleanSender = senderJid.split("@")[0];
    const cleanBot = botNumber.split("@")[0];

    // 1. Primero definimos su identidad básica
    const itsMe = cleanSender === cleanBot;

    // 2. Ahora sí usamos itsMe para definir si es Creador
    // LA LLAVE MAESTRA: Si el ID coincide con el largo o tu número, ERES DIOS.
    const isCreator = itsMe || global.owner.some(num => m.sender.includes(num));

    const isAdmin = isGroup ? groupAdmin.includes(senderJid) : false;
    const isBotAdmin = isGroup ? groupAdmin.includes(botNumber) : false;
   
    // ------------------------------------------------------

    const messSender = m.sender;

    const {
      checkBan,
      checkMod,
      getChar,
      checkPmChatbot,
      getBotMode,
      checkBanGroup,
      checkAntilink,
      checkGroupChatbot,
    } = require("./System/MongoDB/MongoDb_Core");

    async function doReact(emoji) {
      await Atlas.sendMessage(m.from, {
        react: { text: emoji, key: m.key },
      });
    }

    const cmdName = response
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      ?.toLowerCase() || "";

    const cmd =
      commands.get(cmdName) ||
      Array.from(commands.values()).find((v) =>
        v.alias?.find((x) => x.toLowerCase() === cmdName)
      );

    const mentionByTag =
      type === "extendedTextMessage" &&
      m.message.extendedTextMessage.contextInfo != null
        ? m.message.extendedTextMessage.contextInfo.mentionedJid
        : [];

  // ESTO IMPRIMIRÁ TU ID REAL EN LA CONSOLA
  console.log("-----------------------------------------");
  console.log("🚨 DETECTANDO ID DEL REMITENTE:");
  console.log("SENDER JID:", m.sender);
  console.log("CLEAN SENDER:", m.sender.split('@')[0]);
  console.log("-----------------------------------------");


    // --------- LOGS PARA GRUPO Y PRIVADO -----------
    if (m.message && isGroup) {
      console.log("\n[ GROUP ]", metadata.subject);
      console.log("[ SENDER ]", m.pushName);
      console.log("[ MESSAGE ]", body || type);
    }

    if (m.message && !isGroup) {
      console.log("\n[ PRIVATE ]", m.pushName);
      console.log("[ MESSAGE ]", body || type);
    }

    
     // ---------- DB CHECKS ----------
    const isbannedUser = await checkBan(m.sender);
    // FORZAMOS QUE SI ES CREADOR, SEA MODERADOR AUTOMÁTICAMENTE
    const modcheck = isCreator ? true : await checkMod(m.sender);
    const isBannedGroup = await checkBanGroup(m.from);
    const isAntilinkOn = await checkAntilink(m.from);
    const isPmChatbotOn = await checkPmChatbot();
    const isGroupChatbotOn = await checkGroupChatbot(m.from);
    const botWorkMode = await getBotMode();

    // --------- NO COMMAND FOUND ---------
    if (body.startsWith(prefix) && !cmd) {
      await doReact("❌");
      return m.reply(`Command not found.`);
    }

       // --------- EXECUTE COMMAND ---------
    if (cmd) {
      // 🛡️ Filtro para que solo Admins y Tú usen el bot en grupos
      if (isGroup && !isAdmin && !isCreator) return;

      cmd.start(Atlas, m, {
        name: "Atlas",
        metadata,
        pushName: pushname,
        participants,
        body,
        inputCMD: cmdName,
        args: body.trim().split(/ +/).slice(1),
        botNumber,
        isCmd: body.startsWith(prefix),
        isMedia: /image|video|sticker|audio/.test((quoted.msg || m.msg)?.mimetype || ""),
        ar: body.trim().split(/ +/).slice(1).map((v) => v.toLowerCase()),
        isAdmin,
        groupAdmin,
        text: body.trim().split(/ +/).slice(1).join(" "),
        itsMe,
        doReact,
        modcheck,
        isCreator,
        quoted,
        groupName: isGroup ? metadata.subject : "",
        mentionByTag,
        mime: (quoted.msg || m.msg)?.mimetype || "",
        isBotAdmin,
        prefix,
        db,
        command: cmd.name,
        commands,
      });
    }
  } catch (e) {
    if (!String(e).includes("cmd.start")) console.error(e);
  }
};
