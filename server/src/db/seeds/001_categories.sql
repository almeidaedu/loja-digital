INSERT INTO categories (name, slug, flag_emoji, sort_order) VALUES
  ('Seleção Brasileira', 'selecao-brasileira', '🇧🇷', 1),
  ('Premier League',     'premier-league',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 2),
  ('La Liga',            'la-liga',             '🇪🇸', 3),
  ('Champions League',   'champions-league',    '⭐', 4),
  ('Coleção Retrô',      'retro',               '🕹️', 5),
  ('Lançamentos',        'lancamentos',         '🆕', 6)
ON CONFLICT (slug) DO NOTHING;
