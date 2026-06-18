CREATE TABLE IF NOT EXISTS metadatas (
    name         TEXT        PRIMARY KEY NOT NULL,
    json       JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);