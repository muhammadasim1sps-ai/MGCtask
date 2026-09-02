-- Run after importing data/leads.csv into lead_imports. This converts blank
-- numeric values to NULL, normalises booleans, and keeps the earliest record
-- for each CRM fingerprint before the UNIQUE constraint is applied.
INSERT INTO leads (
    lead_id, created_at, source, city, area, property_type, budget_pkr_lac,
    bedrooms, first_response_minutes, calls_made, total_call_seconds,
    whatsapp_replies, site_visits, agent_experience_years, is_overseas,
    referred_by_existing_client, has_financing_approved,
    token_amount_received_pkr, crm_record_hash, converted
)
SELECT
    TRIM(lead_id),
    datetime(created_at),
    TRIM(source),
    NULLIF(TRIM(city), ''),
    NULLIF(TRIM(area), ''),
    NULLIF(TRIM(property_type), ''),
    CAST(NULLIF(TRIM(budget_pkr_lac), '') AS REAL),
    CAST(NULLIF(TRIM(bedrooms), '') AS INTEGER),
    CAST(NULLIF(TRIM(first_response_minutes), '') AS INTEGER),
    COALESCE(CAST(NULLIF(TRIM(calls_made), '') AS INTEGER), 0),
    COALESCE(CAST(NULLIF(TRIM(total_call_seconds), '') AS INTEGER), 0),
    COALESCE(CAST(NULLIF(TRIM(whatsapp_replies), '') AS INTEGER), 0),
    COALESCE(CAST(NULLIF(TRIM(site_visits), '') AS INTEGER), 0),
    CAST(NULLIF(TRIM(agent_experience_years), '') AS REAL),
    CASE WHEN TRIM(is_overseas) IN ('1', 'true', 'TRUE') THEN 1 ELSE 0 END,
    CASE WHEN TRIM(referred_by_existing_client) IN ('1', 'true', 'TRUE') THEN 1 ELSE 0 END,
    CASE WHEN TRIM(has_financing_approved) IN ('1', 'true', 'TRUE') THEN 1 ELSE 0 END,
    COALESCE(CAST(NULLIF(TRIM(token_amount_received_pkr), '') AS REAL), 0),
    CAST(TRIM(crm_record_hash) AS INTEGER),
    CASE WHEN TRIM(converted) IN ('1', 'true', 'TRUE') THEN 1 ELSE 0 END
FROM (
    SELECT
        lead_imports.*,
        ROW_NUMBER() OVER (
            PARTITION BY crm_record_hash
            ORDER BY datetime(created_at), lead_id
        ) AS duplicate_rank
    FROM lead_imports
    WHERE NULLIF(TRIM(crm_record_hash), '') IS NOT NULL
)
WHERE duplicate_rank = 1;
