"use client";

import { FormEvent, useState } from "react";

type AssistantResult = {
  answer: string;
  status: string;
  sources: string[];
  calculation?: string | null;
};

const examples = [
  "What is the base price of a 2-bed in Block B?",
  "What is the total price for a Margalla-facing corner unit, floor 15, 2-bed Block B?",
  "What's the transfer fee?",
];

function errorMessage(detail: unknown) {
  return typeof detail === "string" ? detail : "Unable to answer that question.";
}

export function DocumentAssistant() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(errorMessage(payload.detail));
      setResult(payload as AssistantResult);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to answer that question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card assistant-card" aria-labelledby="assistant-title">
      <div className="card-heading">
        <div>
          <p className="step">Project knowledge</p>
          <h2 id="assistant-title">Ask about MGC Aurora Heights</h2>
        </div>
        <span className="model-tag">Sources included</span>
      </div>
      <p className="field-help">
        Ask about the supplied brochure, price list, or booking policy. Every answer identifies the supporting source.
      </p>
      <form className="assistant-form" onSubmit={submit} aria-busy={loading}>
        <label htmlFor="document-question">
          Your question
          <textarea
            id="document-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about pricing, booking, or the project..."
            rows={3}
          />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Finding answer…" : "Ask assistant"}</button>
      </form>
      <div className="examples" aria-label="Example questions">
        {examples.map((example) => (
          <button key={example} type="button" onClick={() => setQuestion(example)}>{example}</button>
        ))}
      </div>
      <div className="result-region" aria-live="polite">
        {error && <p className="error" role="alert">{error}</p>}
        {result && (
          <article className="assistant-result">
            <p className="result-label">Answer status: {result.status}</p>
            <p className="answer-text">{result.answer}</p>
            {result.calculation && <pre className="calculation">{result.calculation}</pre>}
            <h3>Sources</h3>
            <ul>{result.sources.map((source) => <li key={source}>{source}</li>)}</ul>
          </article>
        )}
      </div>
    </section>
  );
}
