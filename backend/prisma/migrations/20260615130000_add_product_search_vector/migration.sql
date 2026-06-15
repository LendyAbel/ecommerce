-- Full-text search for products: a stored tsvector column + GIN index.

-- unaccent() is only STABLE (it depends on the active dictionary/search_path), so
-- it cannot be used inside a generated column or an index. This thin wrapper pins
-- the dictionary explicitly, which makes it IMMUTABLE and therefore usable there.
CREATE OR REPLACE FUNCTION f_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

-- Stored, always-up-to-date search vector built from the searchable text columns.
-- 'simple' config = lowercase + tokenize without language stemming, which suits
-- product names and brands. unaccent makes it accent-insensitive.
ALTER TABLE "Product"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'simple',
      f_unaccent(
        coalesce("name", '') || ' ' ||
        coalesce("brand", '') || ' ' ||
        coalesce("shortDescription", '')
      )
    )
  ) STORED;

-- GIN index so `searchVector @@ to_tsquery(...)` uses an index instead of a seq scan.
CREATE INDEX "Product_searchVector_idx" ON "Product" USING gin ("searchVector");
