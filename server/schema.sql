-- Schema for URLs in PostgreSQL
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(50) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Unique index on short_code for fast lookups and uniqueness enforcement
CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
