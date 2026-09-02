-- 1. Conversion rate by acquisition source, best first. In SQLite the import
-- normalises `converted` to 0/1, so AVG(converted) is the conversion fraction.
SELECT
    source,
    COUNT(*) AS lead_count,
    SUM(converted) AS converted_count,
    ROUND(100.0 * AVG(converted), 2) AS conversion_rate_pct
FROM leads
GROUP BY source
HAVING COUNT(*) >= 200
ORDER BY conversion_rate_pct DESC, lead_count DESC, source;


-- 2. Find every raw CRM row that shares a fingerprint with another row.
-- This runs before loading `leads`. The production schema prevents these
-- duplicates with `crm_record_hash INTEGER NOT NULL UNIQUE`; a real application
-- should route a conflicting new submission to review or an explicit merge flow.
WITH duplicate_hashes AS (
    SELECT
        crm_record_hash,
        COUNT(*) AS duplicate_count
    FROM lead_imports
    GROUP BY crm_record_hash
    HAVING COUNT(*) > 1
)
SELECT
    d.crm_record_hash,
    d.duplicate_count,
    l.lead_id,
    l.created_at,
    l.source,
    l.city,
    l.area,
    l.property_type,
    l.converted
FROM duplicate_hashes AS d
JOIN lead_imports AS l USING (crm_record_hash)
ORDER BY d.crm_record_hash, l.created_at, l.lead_id;
