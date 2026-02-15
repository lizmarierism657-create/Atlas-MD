// deleteSession.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://Bbc_yummycook:nanika2026@cluster0.b0d3orn.mongodb.net/"; // tu URI
const client = new MongoClient(uri);

async function deleteSession() {
  try {
    await client.connect();
    const db = client.db("AtlasMD"); // tu DB
    const collection = db.collection("sessions"); // colección de sesiones

    // Mostrar sesiones actuales en JSON bonito
    const sesiones = await collection.find({}).toArray();
    console.log("📝 Sesiones actuales:");
    console.log(JSON.stringify(sesiones, null, 2)); // JSON formateado

    // Borrar todas las sesiones
    const resultado = await collection.deleteMany({});
    console.log(`✅ Se borraron ${resultado.deletedCount} sesiones`);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
    console.log("🔒 Conexión cerrada");
  }
}

deleteSession();

