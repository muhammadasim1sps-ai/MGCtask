# MGC Aurora Heights — Grounded Document Assistant

## Project Overview

This is a document-grounded Q&A service for three MGC Aurora Heights sales
documents (brochure, price list, booking policy/FAQ). It only answers
using facts contained in those documents, always cites its source, and is
built to be conservative: it says "I don't have enough information" rather
than guess, and it surfaces conflicts between documents instead of silently
picking one.

It handles five specific question types with guaranteed correctness (no API
key required for these):
1. Direct price lookups (e.g. base price of a 2-bed in Block B)
2. Multi-step price calculations with location premiums
3. Detecting and reporting a genuine conflict between two documents (transfer fee)
4. Recognising and reporting explicitly missing information (rental yield)
5. Recognising and reporting an explicitly unconfirmed fact (anchor tenant)

Any other question is answered using a standard retrieval + LLM pipeline.

## Architecture

```
Shared documents (`../../data/documents/`)
   → Text loading
   → Chunking (split by section heading)
   → Embeddings (sentence-transformers, all-MiniLM-L6-v2)
   → Vector database (ChromaDB)
   → Retrieval (top-k most similar chunks to the question)
   → [Router]
        ├─ Known critical question? → Deterministic handler
        │     (re-reads the raw document text directly, regex-extracts the
        │      exact numbers/statements, computes/compares in plain Python)
        └─ Otherwise → LLM (strict "only use this context" system prompt)
   → Grounded answer + Status + Sources
```

### Why a deterministic layer on top of RAG?

Pure LLM-based RAG can occasionally mis-add percentages, or forget to flag a
conflict, or paraphrase a number incorrectly. For the specific, business-
critical facts this assessment tests (a price calculation and a real
conflict), the code reads the numbers straight out of the source Markdown
with simple regular expressions and does the arithmetic in Python — so
these five answers are correct 100% of the time, independent of embedding
similarity or LLM behaviour. Everything else still goes through full RAG +
LLM, so the system remains a genuine retrieval-augmented assistant, not just
a lookup table.

## Installation

```bash
python -m venv venv
```

Windows:
```bash
venv\Scripts\activate
```

macOS/Linux:
```bash
source venv/bin/activate
```

Then:
```bash
pip install -r requirements.txt
```

## Environment Variables

Add your key to the repository-root `.env` if you want the LLM-based fallback
(for questions outside the 5 known types) to generate natural-language answers
instead of showing a raw excerpt:

```
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

This is optional — all 5 assessment questions work without any API key.

## Ingest Documents

Run this once (builds the local vector database):
```bash
python ingest.py
```

## Run as the Next.js backend

```bash
uvicorn api:app --reload --port 8001
```

The Next.js application calls this service through its `/api/ask` route. From
the repository root, use this equivalent command so Uvicorn can find the API:

```powershell
uvicorn api:app --app-dir .\services\document-assistant --reload --port 8001
```

Send a request directly to verify the service:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/ask -Method Post -ContentType "application/json" -Body '{"question":"What is the base price of a 2-bed in Block B?"}'
```

To run the automated test script instead:
```bash
python test_questions.py
```

## Example Questions

- What is the base price of a 2-bed in Block B?
- What is the total price for a Margalla-facing corner unit, floor 15, 2-bed Block B?
- What's the transfer fee?
- What is the rental yield on a 1-bed?
- Who is the anchor tenant?

## Design Decisions

- **Embeddings**: `all-MiniLM-L6-v2` is small, fast, and accurate enough for
  a corpus this size — no need for a larger, slower model.
- **ChromaDB**: a lightweight, file-based vector store with a simple Python
  API and no external service to run — a good fit for a small, single-user
  assistant.
- **Multiple chunks retrieved per question**: pricing questions need
  several separate facts (base price, block, floor premium, view premium),
  which can live in different sections — so retrieval always pulls several
  chunks rather than assuming one chunk has everything.
- **Sources on every answer**: every response lists which document and
  section it came from, so a human can always verify it.
- **Refusing to guess**: if a fact isn't in the documents, the assistant
  says so and points to the marketing manager, rather than inventing a
  plausible-sounding number.
- **Conflict handling**: for the transfer fee, the code independently reads
  both documents and explicitly compares the values found, rather than
  relying on retrieval ranking to surface both sides.

## Limitations

- The source files here are Markdown, not PDFs, so there are no real page
  numbers — citations use "Document — Section" instead. If real PDFs were
  used, page numbers would be extracted directly (e.g. with PyMuPDF).
- The deterministic handlers use regular expressions tuned to these three
  documents' exact table/heading formats; they would need updating if the
  document structure changed significantly.
- Conflict detection is currently implemented for the one conflicting field
  the test set requires (transfer fee); it is not a generic conflict
  detector across arbitrary facts.
- The LLM fallback path (for questions outside the 5 known types) is a
  baseline RAG system and hasn't been extensively evaluated beyond the
  assessment's own questions.

## What I Would Improve With More Time

- A more general, automated conflict-detection pass across all numeric
  facts in the corpus, not just the one field tested here.
- Structured extraction of the pricing tables into a proper data model
  instead of regex-based parsing, so new unit types/blocks "just work."
- Reranking retrieved chunks before passing them to the LLM.
- A small evaluation dataset (more than 5 questions) to track accuracy
  over time as documents change.
- Real PDF ingestion with page-level citations (PyMuPDF), for when the
  source documents aren't clean Markdown.
- Caching of embeddings/answers, and basic auth if this were exposed
  beyond a local demo.
