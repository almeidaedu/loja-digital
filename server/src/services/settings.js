const prisma = require('../config/database');
const storeDefaults = require('../config/storeDefaults');

// A tabela tem uma linha só (CHECK no banco); esta é ela.
const SETTINGS_ID = 1;

// Processo único: um cache em memória basta, e o PUT é o único caminho de escrita.
let cache = null;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Defaults por baixo, o que foi salvo por cima — guiado pelas chaves dos
 * defaults. Campo que o template ganhou depois do último save nasce com o
 * padrão; campo que saiu do template some da resposta. Arrays e `null` são
 * valores, não objetos para mesclar (`nameParts`, `stats`).
 */
function withDefaults(defaults, saved) {
  if (!isPlainObject(defaults)) return saved === undefined ? defaults : saved;
  const source = isPlainObject(saved) ? saved : {};
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, withDefaults(defaults[key], source[key])])
  );
}

async function getSettings() {
  if (!cache) {
    const row = await prisma.storeSettings.findUnique({ where: { id: SETTINGS_ID } });
    cache = withDefaults(storeDefaults, row?.data);
  }
  return cache;
}

// Substitui o objeto inteiro: quem chama já validou e montou tudo (settingsController).
async function updateSettings(data) {
  await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, data },
    update: { data },
  });
  cache = withDefaults(storeDefaults, data);
  return cache;
}

module.exports = { getSettings, updateSettings, withDefaults };
