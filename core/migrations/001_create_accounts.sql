-- migrations/0001_create_accounts_schema.sql
CREATE SCHEMA IF NOT EXISTS accounts;

CREATE TABLE IF NOT EXISTS accounts.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts.media_assets (
    owner_id UUID PRIMARY KEY REFERENCES accounts.users(id) ON DELETE CASCADE,
    avatar UUID NOT NULL DEFAULT '4dedc6a2-1a0b-434e-b76a-982f037267dc',
    banner UUID NOT NULL DEFAULT '4dedc6a2-1a0b-434e-b76a-982f037267dc',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts.roles (
    id INT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE accounts.user_roles (
    user_id UUID NOT NULL REFERENCES accounts.users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES accounts.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);