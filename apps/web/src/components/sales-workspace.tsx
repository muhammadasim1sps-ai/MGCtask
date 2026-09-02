"use client";

import { useState } from "react";
import { DocumentAssistant } from "@/components/document-assistant";
import { LeadScoreForm } from "@/components/lead-score-form";

type Workspace = "assistant" | "scoring";

const workspaces: Array<{ id: Workspace; label: string; title: string; description: string }> = [
  { id: "assistant", label: "Ask documents", title: "Find a documented answer", description: "Check pricing, booking policy, and project details with cited sources." },
  { id: "scoring", label: "Score a lead", title: "Prioritise your next follow-up", description: "Use only details known when the lead first arrives." },
];

export function SalesWorkspace() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>("assistant");
  const active = workspaces.find((workspace) => workspace.id === activeWorkspace)!;

  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <div className="workspace-intro">
        <p className="eyebrow">Sales workspace</p>
        <h2 id="workspace-title">{active.title}</h2>
        <p>{active.description}</p>
      </div>
      <div className="workspace-tabs" role="tablist" aria-label="Sales tools">
        {workspaces.map((workspace) => (
          <button
            aria-controls={`${workspace.id}-panel`}
            aria-selected={activeWorkspace === workspace.id}
            className="workspace-tab"
            id={`${workspace.id}-tab`}
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.id)}
            role="tab"
            type="button"
          >
            {workspace.label}
          </button>
        ))}
      </div>
      <div aria-labelledby={`${activeWorkspace}-tab`} id={`${activeWorkspace}-panel`} role="tabpanel">
        {activeWorkspace === "assistant" ? <DocumentAssistant /> : <LeadScoreForm />}
      </div>
    </section>
  );
}
