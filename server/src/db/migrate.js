require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  console.log('[migrate] Iniciando migrations...');

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`[migrate] Rodando: ${file}`);
    await pool.query(sql);
  }

  console.log('[migrate] Concluído.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('[migrate] Erro:', err.message);
  process.exit(1);
});
