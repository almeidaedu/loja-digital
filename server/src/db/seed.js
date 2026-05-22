require('dotenv').config();
const prisma = require('../config/database');

async function seed() {
  console.log('[seed] Inserindo dados iniciais...');

  const categories = await prisma.category.createMany({
    data: [
      { name: 'Seleção Brasileira', slug: 'selecao-brasileira', flagEmoji: '🇧🇷', sortOrder: 1 },
      { name: 'Premier League',     slug: 'premier-league',     flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sortOrder: 2 },
      { name: 'La Liga',            slug: 'la-liga',            flagEmoji: '🇪🇸', sortOrder: 3 },
      { name: 'Champions League',   slug: 'champions-league',   flagEmoji: '⭐', sortOrder: 4 },
      { name: 'Coleção Retrô',      slug: 'retro',              flagEmoji: '🕹️', sortOrder: 5 },
      { name: 'Lançamentos',        slug: 'lancamentos',        flagEmoji: '🆕', sortOrder: 6 },
    ],
    skipDuplicates: true,
  });
  console.log(`[seed] ${categories.count} categorias inseridas.`);

  const catMap = Object.fromEntries(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id])
  );

  const products = await prisma.product.createMany({
    data: [
      {
        categoryId: catMap['selecao-brasileira'],
        name: 'Camisa Brasil Home 2024 - Oficial',
        slug: 'camisa-brasil-home-2024',
        description: 'Camisa oficial da Seleção Brasileira temporada 2024. Tecido Dri-FIT, bordado CBF.',
        price: 169.00, originalPrice: 249.00, stock: 50, badge: 'best_seller', rating: 4.9, reviewCount: 248, featured: true,
      },
      {
        categoryId: catMap['la-liga'],
        name: 'Camisa Real Madrid Home 24/25',
        slug: 'camisa-real-madrid-home-2425',
        description: 'Camisa oficial do Real Madrid temporada 24/25.',
        price: 189.00, originalPrice: 299.00, stock: 12, badge: 'urgency', rating: 4.8, reviewCount: 192, featured: true,
      },
      {
        categoryId: catMap['premier-league'],
        name: 'Camisa Manchester United Home 24/25',
        slug: 'camisa-manchester-united-home-2425',
        description: 'Camisa oficial do Manchester United temporada 24/25. Adidas.',
        price: 179.00, originalPrice: 279.00, stock: 30, badge: 'new', rating: 4.7, reviewCount: 137, featured: true,
      },
      {
        categoryId: catMap['la-liga'],
        name: 'Camisa Barcelona Away 24/25',
        slug: 'camisa-barcelona-away-2425',
        description: 'Camisa away do Barcelona temporada 24/25. Nike.',
        price: 185.00, originalPrice: 289.00, stock: 45, badge: 'best_seller', rating: 4.9, reviewCount: 221, featured: true,
      },
      {
        categoryId: catMap['retro'],
        name: 'Camisa Brasil Retrô Copa 94',
        slug: 'camisa-brasil-retro-copa-94',
        description: 'Camisa retrô oficial da Copa do Mundo de 1994. Colecionador.',
        price: 149.00, originalPrice: 219.00, stock: 20, badge: 'urgency', rating: 5.0, reviewCount: 312, featured: true,
      },
      {
        categoryId: catMap['lancamentos'],
        name: 'Camisa PSG Home 24/25',
        slug: 'camisa-psg-home-2425',
        description: 'Camisa oficial do Paris Saint-Germain temporada 24/25. Nike.',
        price: 195.00, originalPrice: 299.00, stock: 35, badge: 'new', rating: 4.6, reviewCount: 98, featured: true,
      },
      {
        categoryId: catMap['premier-league'],
        name: 'Camisa Flamengo Home 2024',
        slug: 'camisa-flamengo-home-2024',
        description: 'Camisa oficial do Flamengo temporada 2024. Adidas.',
        price: 175.00, originalPrice: 259.00, stock: 8, badge: 'urgency', rating: 4.9, reviewCount: 445, featured: true,
      },
      {
        categoryId: catMap['premier-league'],
        name: 'Camisa Chelsea Home 25/26',
        slug: 'camisa-chelsea-home-2526',
        description: 'Camisa oficial do Chelsea temporada 25/26. Nike.',
        price: 179.00, originalPrice: 279.00, stock: 40, badge: 'best_seller', rating: 4.8, reviewCount: 167, featured: true,
      },
      // Newcastle United
      {
        categoryId: catMap['lancamentos'],
        name: 'Camisa Newcastle Home 24/25',
        slug: 'camisa-newcastle-home-2425',
        description: 'Camisa oficial do Newcastle United temporada 24/25. Castore. Listras preto e branco clássicas.',
        price: 179.00, originalPrice: 279.00, stock: 30, badge: 'new', rating: 4.8, reviewCount: 54,
        imageUrl: '/images/products/newcastle/newcastle-home-2425-480.webp', featured: true,
      },
      {
        categoryId: catMap['lancamentos'],
        name: 'Camisa Newcastle Third 24/25',
        slug: 'camisa-newcastle-third-2425',
        description: 'Camisa third do Newcastle United temporada 24/25. Castore.',
        price: 169.00, originalPrice: 259.00, stock: 25, badge: 'new', rating: 4.7, reviewCount: 31,
        imageUrl: '/images/products/newcastle/newcastle-third-2425-480.webp', featured: false,
      },
      {
        categoryId: catMap['premier-league'],
        name: 'Camisa Newcastle Away 23/24',
        slug: 'camisa-newcastle-away-2324',
        description: 'Camisa away do Newcastle United temporada 23/24. Castore.',
        price: 159.00, originalPrice: 249.00, stock: 18, badge: null, rating: 4.7, reviewCount: 42,
        imageUrl: '/images/products/newcastle/newcastle-away-2324-480.webp', featured: false,
      },
      {
        categoryId: catMap['premier-league'],
        name: 'Camisa Newcastle Away 23/24 — Versão Jogador',
        slug: 'camisa-newcastle-away-2324-player',
        description: 'Versão jogador da camisa away do Newcastle United 23/24. Tecido premium e corte slim.',
        price: 219.00, originalPrice: 319.00, stock: 10, badge: 'urgency', rating: 4.9, reviewCount: 19,
        imageUrl: '/images/products/newcastle/newcastle-away-2324-player-480.webp', featured: true,
      },
      {
        categoryId: catMap['retro'],
        name: 'Camisa Newcastle Retrô Home 97/98',
        slug: 'camisa-newcastle-retro-home-9798',
        description: 'Camisa retrô do Newcastle United temporada 97/98. Época de Alan Shearer.',
        price: 149.00, originalPrice: 219.00, stock: 15, badge: 'best_seller', rating: 5.0, reviewCount: 87,
        imageUrl: '/images/products/newcastle/newcastle-home-retro-9798-480.webp', featured: true,
      },
      {
        categoryId: catMap['retro'],
        name: 'Camisa Newcastle Retrô 01/02',
        slug: 'camisa-newcastle-retro-0102',
        description: 'Camisa retrô do Newcastle United temporada 01/02.',
        price: 139.00, originalPrice: 209.00, stock: 12, badge: null, rating: 4.8, reviewCount: 34,
        imageUrl: '/images/products/newcastle/newcastle-retro-0102-480.webp', featured: false,
      },
      {
        categoryId: catMap['retro'],
        name: 'Camisa Newcastle Retrô 99/00',
        slug: 'camisa-newcastle-retro-9900',
        description: 'Camisa retrô do Newcastle United temporada 99/00.',
        price: 139.00, originalPrice: 209.00, stock: 14, badge: null, rating: 4.8, reviewCount: 28,
        imageUrl: '/images/products/newcastle/newcastle-retro-9900-480.webp', featured: false,
      },
      {
        categoryId: catMap['premier-league'],
        name: 'Camisa Newcastle Home 23/24 Infantil',
        slug: 'camisa-newcastle-home-2324-kids',
        description: 'Camisa infantil do Newcastle United temporada 23/24. Castore. Tamanhos 4 a 14 anos.',
        price: 129.00, originalPrice: 199.00, stock: 22, badge: 'new', rating: 4.9, reviewCount: 61,
        imageUrl: '/images/products/newcastle/newcastle-home-2324-kids-480.webp', featured: false,
      },
      {
        categoryId: catMap['retro'],
        name: 'Camisa Newcastle Away 1995',
        slug: 'camisa-newcastle-away-1995',
        description: 'Camisa retrô away do Newcastle United de 1995. Ícone do futebol inglês dos anos 90.',
        price: 149.00, originalPrice: 219.00, stock: 8, badge: 'urgency', rating: 5.0, reviewCount: 73,
        imageUrl: '/images/products/newcastle/newcastle-away-1995-480.webp', featured: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`[seed] ${products.count} produtos inseridos.`);

  console.log('[seed] Concluído.');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('[seed] Erro:', err.message);
  process.exit(1);
});
