import { SalesWorkspace } from "@/components/sales-workspace";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MGC Developments · Sales prioritisation</p>
        <h1 id="page-title">Make the next conversation count.</h1>
        <p className="lede">
          Ask a question about Aurora Heights or quickly prioritise a new lead. Both tools are designed
          to support your judgement, not replace it.
        </p>
      </section>
      <SalesWorkspace />
    </main>
  );
}
