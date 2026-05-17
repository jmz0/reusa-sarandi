const fs = require("fs/promises");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const databaseDir = path.join(__dirname, "..", "database");
const databaseFile = process.env.DB_PATH || path.join(databaseDir, "reusa-sarandi.sqlite");
const schemaFile = path.join(databaseDir, "schema.sql");
const seedFile = path.join(databaseDir, "seed.sql");

let connection;

async function getDb() {
  if (!connection) {
    await fs.mkdir(databaseDir, { recursive: true });

    connection = await open({
      filename: databaseFile,
      driver: sqlite3.Database
    });

    await connection.exec("PRAGMA foreign_keys = ON;");
  }

  return connection;
}

async function runSqlFile(db, filePath) {
  const sql = await fs.readFile(filePath, "utf8");
  await db.exec(sql);
}

async function initDatabase() {
  const db = await getDb();

  await runSqlFile(db, schemaFile);
  await runSqlFile(db, seedFile);

  return db;
}

async function closeDb() {
  if (connection) {
    await connection.close();
    connection = undefined;
  }
}

if (require.main === module) {
  initDatabase()
    .then(async () => {
      console.log(`Banco inicializado em: ${databaseFile}`);
      await closeDb();
    })
    .catch(async (error) => {
      console.error("Erro ao inicializar o banco:", error);
      await closeDb();
      process.exit(1);
    });
}

module.exports = {
  closeDb,
  databaseFile,
  getDb,
  initDatabase
};
