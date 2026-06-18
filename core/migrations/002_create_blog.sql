-- migrations/0001_create_accounts_schema.sql
CREATE SCHEMA IF NOT EXISTS blog;

CREATE TABLE IF NOT EXISTS blog.news (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thumbnail   TEXT NOT NULL DEFAULT '',
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    redirect    TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog.jobs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    company     TEXT NOT NULL,
    image       TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    content     TEXT NOT NULL,
    salary      TEXT NOT NULL DEFAULT '0',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog.job_locations (
    job_id      UUID NOT NULL REFERENCES blog.jobs(id) ON DELETE CASCADE,
    label       TEXT,
    lat         DOUBLE PRECISION,
    lng         DOUBLE PRECISION,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_locations_job_id ON blog.job_locations(job_id);