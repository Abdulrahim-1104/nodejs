CREATE TABLE user_mfa (
    user_id UUID PRIMARY KEY
        REFERENCES users(id) ON DELETE CASCADE,

    secret_encrypted TEXT NOT NULL,

    enabled_at TIMESTAMPTZ,

    last_used_step BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);