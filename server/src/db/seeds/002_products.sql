INSERT INTO products
  (category_id, name, slug, description, price, original_price, stock, badge, rating, review_count, featured)
VALUES
  (
    (SELECT id FROM categories WHERE slug = 'selecao-brasileira'),
    'Camisa Brasil Home 2024 - Oficial', 'camisa-brasil-home-2024',
    'Camisa oficial da Seleção Brasileira temporada 2024. Tecido Dri-FIT, bordado CBF.',
    169.00, 249.00, 50, 'best_seller', 4.9, 248, TRUE
  ),
  (
    (SELECT id FROM categories WHERE slug = 'la-liga'),
    'Camisa Real Madrid Home 24/25', 'camisa-real-madrid-home-2425',
    'Camisa oficial do Real Madrid temporada 24/25.',
    189.00, 299.00, 12, 'urgency', 4.8, 192, TRUE
  ),
  (
    (SELECT id FROM categories WHERE slug = 'premier-league'),
    'Camisa Manchester United Home 24/25', 'camisa-manchester-united-home-2425',
    'Camisa oficial do Manchester United temporada 24/25. Adidas.',
    179.00, 279.00, 30, 'new', 4.7, 137, TRUE
  ),
  (
    (SELECT id FROM categories WHERE slug = 'la-liga'),
    'Camisa Barcelona Away 24/25', 'camisa-barcelona-away-2425',
    'Camisa away do Barcelona temporada 24/25. Nike.',
    185.00, 289.00, 45, 'best_seller', 4.9, 221, TRUE
  ),
  (
    (SELECT id FROM categories WHERE slug = 'retro'),
    'Camisa Brasil Retrô Copa 94', 'camisa-brasil-retro-copa-94',
    'Camisa retrô oficial da Copa do Mundo de 1994. Colecionador.',
    149.00, 219.00, 20, 'urgency', 5.0, 312, TRUE
  ),
  (
    (SELECT id FROM categories WHERE slug = 'lancamentos'),
    'Camisa PSG Home 24/25', 'camisa-psg-home-2425',
    'Camisa oficial do Paris Saint-Germain temporada 24/25. Nike.',
    195.00, 299.00, 35, 'new', 4.6, 98, TRUE
  ),
  (
    (SELECT id FROM categories WHERE slug = 'premier-league'),
    'Camisa Flamengo Home 2024', 'camisa-flamengo-home-2024',
    'Camisa oficial do Flamengo temporada 2024. Adidas.',
    175.00, 259.00, 8, 'urgency', 4.9, 445, TRUE
  ),
  (
    (SELECT id FROM categories WHERE slug = 'premier-league'),
    'Camisa Chelsea Home 25/26', 'camisa-chelsea-home-2526',
    'Camisa oficial do Chelsea temporada 25/26. Nike.',
    179.00, 279.00, 40, 'best_seller', 4.8, 167, TRUE
  )
ON CONFLICT (slug) DO NOTHING;
