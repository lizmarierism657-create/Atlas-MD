require("./Configurations");
const {
  default: atlasConnect,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
} = require("baileysjs");

const fs = require("fs");
const figlet = require("figlet");
const { join } = require("path");
const got = require("got");
const pino = require("pino");
const path = require("path");
const FileType = require("file-type");
const { Boom } = require("@hapi/boom");
const { serialize } = require("./System/whatsapp.js");
const { smsg } = require("./System/Function2");
const express = require("express");
const mongoose = require("mongoose");
const Auth = require("./System/MongoAuth/MongoAuth");
const qrcode = require("qrcode");
const chalk = require("chalk");
const { getPluginURLs } = require("./System/MongoDB/MongoDb_Core.js");
const { userData } = require("./System/MongoDB/MongoDB_Schema.js");

const app = express();
const PORT = 6000;

let server; // 🔥 evita múltiples listens

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

const myNumber = "18099973866", "114839523426558";
const fullJid = myNumber + "@s.whatsapp.net";
const sessionId = global.sessionId || "atlasSession";

async function addMyselfAsMod(jid) {
  try {
    let user = await userData.findOne({ id: jid });
    if (!user) {
      await userData.create({ id: jid, addedMods: true });
      console.log(`✅ ${jid} agregado como Mod`);
    } else if (!user.addedMods) {
      await userData.findOneAndUpdate({ id: jid }, { $set: { addedMods: true } });
      console.log(`✅ ${jid} actualizado a Mod`);
    } else {
      console.log(`ℹ️ ${jid} ya es Mod`);
    }
  } catch (e) {
    console.error("❌ Error agregando Mod:", e);
  }
}

mongoose.connect("mongodb+srv://Bbc_yummycook:nanika2026@cluster0.b0d3orn.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
  console.log("✅ ¡POR FIN CONECTÓ CARAJO!");
  startAtlas(); // <--- ESTA LÍNEA ES LA QUE FALTA PARA QUE SALGA EL LOGO Y EL QR
})
.catch(err => {
  console.log("❌ ERROR:", err.message);
});

let QR_GENERATE = "invalid";

async function installPlugin() {
  console.log(chalk.yellow("Checking for Plugins...\n"));
  let plugins = [];

  try {
    plugins = await getPluginURLs();
  } catch (err) {
    console.log(chalk.redBright("Error conectando a MongoDB para plugins.\n"));
  }

  if (!plugins.length) {
    console.log(chalk.redBright("No Extra Plugins Installed! Starting Atlas...\n"));
    return;
  }

  console.log(chalk.greenBright(`${plugins.length} Plugins found! Installing...\n`));
  for (let pluginUrl of plugins) {
    try {
      const fileName = path.basename(pluginUrl);
      const folderName = "Plugins";
      if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
      const filePath = path.join(folderName, fileName);

      // 🔥 EL TRUCO: Si el archivo ya existe, lo ignora y sigue con el siguiente
      if (fs.existsSync(filePath)) {
        console.log(chalk.blue(`ℹ️ Plugin ${fileName} ya existe. Saltando...`));
        continue;
      }

      const { body, statusCode } = await got(pluginUrl);
      if (statusCode === 200) {
        fs.writeFileSync(filePath, body);
        console.log(chalk.green(`✅ Plugin ${fileName} instalado con éxito.`));
      }
    } catch (err) {
      console.log(chalk.redBright(`❌ Error descargando ${pluginUrl}: Link inválido.`));
    }
  }

  console.log(chalk.greenBright("Plugins instalados.\n"));
}

const startAtlas = async () => {
  const { getAuthFromDatabase } = new Auth(sessionId);
  const { saveState, state, clearState } = await getAuthFromDatabase();

  console.log(
    figlet.textSync("ATLAS", {
      font: "Standard",
      width: 70,
      whitespaceBreak: true,
    })
  );

  await installPlugin();
  const { version } = await fetchLatestBaileysVersion();

 const Atlas = atlasConnect({
  logger: pino({ level: "silent" }),
  printQRInTerminal: true,
  browser: ["Atlas", "Safari", "1.0.0"],
  auth: state,
  version,
});

// =============================
// 🔥 BAILEYS COMPATIBILITY FIX
// =============================

Atlas.sendText = (jid, text, quoted = "", options = {}) => {
  return Atlas.sendMessage(jid, { text, ...options }, { quoted });
};

Atlas.sendFile = async (
  jid,
  path,
  fileName = "file",
  caption = "",
  quoted = "",
  options = {}
) => {
  let buffer = Buffer.isBuffer(path) ? path : fs.readFileSync(path);
  return Atlas.sendMessage(
    jid,
    {
      document: buffer,
      fileName,
      mimetype: "application/octet-stream",
      caption,
      ...options,
    },
    { quoted }
  );
};

Atlas.sendImage = async (
  jid,
  path,
  caption = "",
  quoted = "",
  options = {}
) => {
  let buffer = Buffer.isBuffer(path) ? path : fs.readFileSync(path);
  return Atlas.sendMessage(
    jid,
    {
      image: buffer,
      caption,
      ...options,
    },
    { quoted }
  );
};

Atlas.sendVideo = async (
  jid,
  path,
  caption = "",
  quoted = "",
  options = {}
) => {
  let buffer = Buffer.isBuffer(path) ? path : fs.readFileSync(path);
  return Atlas.sendMessage(
    jid,
    {
      video: buffer,
      caption,
      ...options,
    },
    { quoted }
  );
};

Atlas.sendAudio = async (
  jid,
  path,
  quoted = "",
  options = {}
) => {
  let buffer = Buffer.isBuffer(path) ? path : fs.readFileSync(path);
  return Atlas.sendMessage(
    jid,
    {
      audio: buffer,
      mimetype: "audio/mp4",
      ...options,
    },
    { quoted }
  );
};
 

  store.bind(Atlas.ev);
  Atlas.public = false;

  await require("./System/ReadCommands.js").readcommands();

  Atlas.ev.on("creds.update", saveState);

  Atlas.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return decode.user && decode.server
        ? decode.user + "@" + decode.server
        : jid;
    }
    return jid;
  };

  Atlas.ev.on("connection.update", async (update) => {
    const { lastDisconnect, connection, qr } = update;

    if (connection)
      console.info(`[ ATLAS ] Server Status => ${connection}`);

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

      if (
        reason === DisconnectReason.connectionClosed ||
        reason === DisconnectReason.connectionLost ||
        reason === DisconnectReason.timedOut ||
        reason === DisconnectReason.restartRequired
      ) {
        console.log("🔁 Reconnecting...");
        return startAtlas();
      }

      if (reason === DisconnectReason.loggedOut) {
        clearState();
        console.log("❌ Sesión cerrada. Escanea de nuevo.");
        process.exit();
      }
    }

    if (qr) QR_GENERATE = qr;
  }); 

    Atlas.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      const msg = chatUpdate.messages[0];
      if (!msg || !msg.message || msg.key.remoteJid === "status@broadcast") return;

      const m = serialize(Atlas, msg);
      if (m.key.id.startsWith("BAE5") && m.key.id.length === 16) return;

      const { commands } = require("./System/ReadCommands.js");
      require("./Core.js")(Atlas, m, commands);
    } catch (err) {
      console.log("Error:", err);
    }
  });

  if (!server) {
    app.use("/", express.static(join(__dirname, "Frontend")));
    app.get("/qr", async (req, res) => {
      res.setHeader("content-type", "image/png");
      res.send(await qrcode.toBuffer(QR_GENERATE));
    });
    server = app.listen(PORT, () =>
      console.log(`🌐 Server running on port ${PORT}`)
    );
  }
};
