"use client";

import { FormEvent, useState } from "react";

type ScoreResponse = {
  conversion_probability: number;
  score_percent: number;
  model: string;
  note: string;
};

const SOURCES = [
  "Facebook Ads",
  "Property Portal",
  "Google Search",
  "Instagram",
  "Referral",
  "Walk-in",
  "WhatsApp Campaign",
  "Expo Stall",
  "Billboard",
];

const PROPERTY_TYPES = [
  "Apartment",
  "Plot",
  "Villa",
  "Commercial Shop",
  "Penthouse",
  "Farmhouse",
];

function errorMessage(detail: unknown) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((issue) => (typeof issue === "object" && issue && "msg" in issue && typeof issue.msg === "string" ? issue.msg : null))
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  return "Could not score this lead.";
}

export function LeadScoreForm() {
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const optionalNumber = (name: string) => {
      const value = form.get(name)?.toString().trim();
      return value ? Number(value) : null;
    };
    const choice = (name: string) => form.get(name)?.toString() ?? "unknown";

    const payload = {
      source: choice("source"),
      city: choice("city"),
      area: form.get("area")?.toString().trim() || null,
      property_type: choice("property_type"),
      budget_pkr_lac: optionalNumber("budget_pkr_lac"),
      bedrooms: optionalNumber("bedrooms"),
      is_overseas: form.get("is_overseas") === "on",
      referred_by_existing_client: form.get("referred_by_existing_client") === "on",
      has_financing_approved: form.get("has_financing_approved") === "on",
      purchase_timeframe: choice("purchase_timeframe"),
      budget_inventory_match: choice("budget_inventory_match"),
      payment_method: choice("payment_method"),
      purpose: choice("purpose"),
      selected_project_or_unit_type: choice("selected_project_or_unit_type"),
      preferred_location_match: choice("preferred_location_match"),
      contact_verified: choice("contact_verified"),
      has_prior_mgc_relationship: choice("has_prior_mgc_relationship"),
      initial_intent_level: choice("initial_intent_level"),
      previous_inquiry_count: optionalNumber("previous_inquiry_count"),
    };

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(errorMessage(body.detail));
      }
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not score this lead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card" aria-labelledby="form-title">
      <div className="card-heading">
        <div>
          <p className="step">New-lead intake</p>
          <h2 id="form-title">Score a lead</h2>
        </div>
        <span className="model-tag">Intake details only</span>
      </div>

      <p className="field-help form-intro">
        Start with the essentials. Add qualification details only when they are already known before the first sales contact.
      </p>

      <form onReset={() => { setResult(null); setError(null); }} onSubmit={onSubmit} className="form-grid" aria-busy={loading}>
        <label>
          Lead source
          <select name="source" defaultValue="Referral" required>
            {SOURCES.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
        </label>

        <label>
          City
          <input name="city" defaultValue="Islamabad" required />
        </label>

        <label>
          Area
          <input name="area" placeholder="e.g. B-17" />
        </label>

        <label>
          Property type
          <select name="property_type" defaultValue="Apartment" required>
            {PROPERTY_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Budget (PKR lac)
          <input name="budget_pkr_lac" type="number" min="0" step="1" placeholder="220" />
        </label>

        <label>
          Bedrooms
          <input name="bedrooms" type="number" min="0" max="20" step="1" placeholder="2" />
        </label>

        <fieldset className="checks">
          <legend>Lead flags</legend>
          <label className="check-row">
            <input type="checkbox" name="is_overseas" />
            Overseas lead
          </label>
          <label className="check-row">
            <input type="checkbox" name="referred_by_existing_client" />
            Referred by existing client
          </label>
          <label className="check-row">
            <input type="checkbox" name="has_financing_approved" />
            Financing already approved
          </label>
        </fieldset>

        <details className="optional-details">
          <summary>Add optional qualification details</summary>
          <p className="field-help">Leave unknown choices unchanged. Do not add information learned after follow-up begins.</p>
          <fieldset className="intake-details">
          <legend>Pre-contact qualification</legend>
          <p className="field-help">Only record information known when this lead is created.</p>

          <label>
            Purchase timeframe
            <select name="purchase_timeframe" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="0_30_days">0-30 days</option>
              <option value="1_3_months">1-3 months</option>
              <option value="3_6_months">3-6 months</option>
            </select>
          </label>

          <label>
            Budget matches inventory
            <select name="budget_inventory_match" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label>
            Payment method
            <select name="payment_method" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="cash">Cash</option>
              <option value="financing">Financing</option>
            </select>
          </label>

          <label>
            Purchase purpose
            <select name="purpose" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="investment">Investment</option>
              <option value="own_use">Own use</option>
            </select>
          </label>

          <label>
            Project or unit type selected
            <select name="selected_project_or_unit_type" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label>
            Preferred location matches
            <select name="preferred_location_match" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label>
            Phone or email verified
            <select name="contact_verified" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label>
            Prior relationship with MGC
            <select name="has_prior_mgc_relationship" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label>
            Initial intent level
            <select name="initial_intent_level" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            Previous inquiries
            <input name="previous_inquiry_count" type="number" min="0" step="1" placeholder="0" />
          </label>
        </fieldset>
        </details>

        <button type="submit" disabled={loading}>
          {loading ? "Scoring…" : "Score lead"}
        </button>
      </form>

      <div className="result-region" aria-live="polite">
        {error && <p className="error" role="alert">{error}</p>}
        {result && (
          <div className="result-card">
            <p className="result-label">Estimated conversion likelihood</p>
            <p className="score">{result.score_percent.toFixed(1)}%</p>
            <p className="result-model">Compare this score with other new leads—it is not a promise of an individual sale.</p>
            <p>{result.note}</p>
          </div>
        )}
      </div>
    </section>
  );
}
