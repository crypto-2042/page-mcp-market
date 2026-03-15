INSERT INTO authors (id, name)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'crypto-2042')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO repositories (
  id, name, description, site_domain, author_id, stars_count, usage_count, last_active_at
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'github-assistant',
    'github assistant',
    'github.com',
    '11111111-1111-1111-1111-111111111111',
    0,
    0,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  site_domain = EXCLUDED.site_domain,
  author_id = EXCLUDED.author_id,
  stars_count = EXCLUDED.stars_count,
  usage_count = EXCLUDED.usage_count,
  last_active_at = EXCLUDED.last_active_at,
  updated_at = NOW();
