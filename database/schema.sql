-- SQLite 3
--
-- lead_imports deliberately mirrors the messy CSV so it can be imported as-is.
-- `leads` is the small, constrained production table. It stores one lead per
-- row; calls and visits in this export are aggregate attributes, not child rows.

CREATE TABLE lead_imports (
    lead_id TEXT,
    created_at TEXT,
    source TEXT,
    city TEXT,
    area TEXT,
    property_type TEXT,
    budget_pkr_lac TEXT,
    bedrooms TEXT,
    first_response_minutes TEXT,
    calls_made TEXT,
    total_call_seconds TEXT,
    whatsapp_replies TEXT,
    site_visits TEXT,
    agent_experience_years TEXT,
    is_overseas TEXT,
    referred_by_existing_client TEXT,
    has_financing_approved TEXT,
    token_amount_received_pkr TEXT,
    crm_record_hash TEXT,
    converted TEXT
);

CREATE TABLE leads (
    -- A CRM row ID is useful for traceability, but not a duplicate key: two
    -- agents can create different IDs for the same logical lead.
    lead_id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL, -- ISO-8601, e.g. 2025-09-30 19:35:11

    source TEXT NOT NULL,
    city TEXT,
    area TEXT,
    property_type TEXT,
    budget_pkr_lac REAL CHECK (budget_pkr_lac >= 0),
    bedrooms INTEGER CHECK (bedrooms BETWEEN 0 AND 20),

    first_response_minutes INTEGER CHECK (first_response_minutes >= 0),
    calls_made INTEGER NOT NULL DEFAULT 0 CHECK (calls_made >= 0),
    total_call_seconds INTEGER NOT NULL DEFAULT 0 CHECK (total_call_seconds >= 0),
    whatsapp_replies INTEGER NOT NULL DEFAULT 0 CHECK (whatsapp_replies >= 0),
    site_visits INTEGER NOT NULL DEFAULT 0 CHECK (site_visits >= 0),
    agent_experience_years REAL CHECK (agent_experience_years >= 0),

    is_overseas INTEGER NOT NULL DEFAULT 0 CHECK (is_overseas IN (0, 1)),
    referred_by_existing_client INTEGER NOT NULL DEFAULT 0
        CHECK (referred_by_existing_client IN (0, 1)),
    has_financing_approved INTEGER NOT NULL DEFAULT 0
        CHECK (has_financing_approved IN (0, 1)),
    token_amount_received_pkr REAL NOT NULL DEFAULT 0
        CHECK (token_amount_received_pkr >= 0),
    converted INTEGER NOT NULL DEFAULT 0 CHECK (converted IN (0, 1)),

    -- Stable fingerprint of the logical lead. The unique constraint prevents
    -- the same lead being created again after historical data is cleaned.
    crm_record_hash INTEGER NOT NULL UNIQUE
);

CREATE INDEX leads_source_idx ON leads (source);
