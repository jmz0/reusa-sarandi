const path = require("path");
const fs = require("fs/promises");
const { getDb, closeDb } = require("./db");

function stripLineComments(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
}

function splitStatements(sql) {
  return stripLineComments(sql)
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function isSelect(statement) {
  return /^(SELECT|WITH|PRAGMA)\b/i.test(statement);
}

async function main() {
  const inputFile = process.argv[2] || "database/queries.sql";
  const sqlFile = path.resolve(__dirname, "..", inputFile);
  const sql = await fs.readFile(sqlFile, "utf8");
  const statements = splitStatements(sql);
  const db = await getDb();

  for (const statement of statements) {
    if (isSelect(statement)) {
      const rows = await db.all(statement);
      console.log(`\nSQL> ${statement}`);
      console.table(rows);
    } else {
      await db.exec(statement);
      console.log(`SQL> ${statement.split(/\s+/).slice(0, 4).join(" ")};`);
    }
  }

  await closeDb();
}

main().catch(async (error) => {
  console.error("Erro ao executar SQL:", error);
  await closeDb();
  process.exit(1);
});
