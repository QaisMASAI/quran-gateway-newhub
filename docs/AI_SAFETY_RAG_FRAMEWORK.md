# Quran Gateway — AI Safety, RAG Grounded Generation & Hallucination Prevention Guide

**Author**: Senior AI Safety & Hallucination Prevention Engineer  
**Target Accuracy Standard**: Zero Unverified Theological Claims (100% Citation Verification)  
**Target Latency**: Sub-800ms End-to-End RAG Generation  

---

## Executive Summary

To safeguard Quran Gateway against AI hallucinations, fabricated Hadith numbers, or distorted verse interpretations, all AI-assisted features (Asbab al-Nuzul, Tafsir summaries, Fiqh contextual guidance) operate under a strict **Retrieve-Then-Generate Grounded RAG Architecture** with automatic citation verification and a human-in-the-loop Scholar Moderation Queue.

---

## 1. RAG Grounded Generation Pipeline

```
                                  +-----------------------+
                                  | User Question / Query |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  | Vector & FTS Grounded |
                                  | Context Retrieval     |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  | Versioned Prompt      |
                                  | Template Injection    |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |  LLM Generation Pass  |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  | Citation Verification |
                                  | & Fact-Checker Engine |
                                  +-----------+-----------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
        [Confidence >= 0.90 & Grounded]                     [Confidence < 0.90 or Unverified]
                     |                                                 |
                     v                                                 v
             (Auto-Published)                              (Queued for Scholar Review)
```

---

## 2. Hallucination Prevention & Citation Verification Rules

1. **Pre-Generation Retrieval Guard**: AI models are NEVER permitted to generate answers directly from pre-trained parametric memory alone. Every prompt injects verified context retrieved from indexed Quranic databases, classical Tafsir, and Sahih Hadith collections.
2. **Verse Key Audit**: Regex checks (`\b\d{1,3}:\d{1,3}\b`) cross-reference all verse keys mentioned in the output against the verified Quran database.
3. **Hadith Citation Audit**: Any reference to Bukhari, Muslim, Tirmidhi, Abu Dawud, etc., must be verified against the retrieved context. Unverified numbers immediately trigger a penalty flag.
4. **Speculation Penalty**: Speculative terms (*"maybe", "could be rumored", "I think"*) automatically reduce the confidence score below the auto-publish threshold.

---

## 3. Versioned Prompt Template System

All prompts are version-controlled in `/src/lib/ai/ai-safety-rag.ts`:

```typescript
export const PROMPT_LIBRARY: Record<string, PromptTemplate> = {
  "asbab_nuzul-v2.1": {
    id: "asbab_nuzul-v2.1",
    version: "2.1.0",
    domain: "asbab_nuzul",
    systemInstructions: "STRICT CONSTRAINT: You MUST NEVER speculate or invent historical contexts...",
    userPromptTemplate: "Verse Key: {{verseKey}}\nContext: {{retrievedContext}}...",
    prohibitedBehaviors: [
      "No unsourced historical anecdotes",
      "No speculation on divine intent outside scholarly consensus",
    ],
  },
};
```

---

## 4. Scholar Review & Moderation Queue Workflow

1. **Auto-Publication Threshold**: Responses with Confidence Score >= 0.90 and 0 invalid citations are immediately published.
2. **Scholar Escalation**: Responses with Confidence Score < 0.90 or containing unverified flags are diverted to `pending_scholar_review`.
3. **Scholar Action**: Verified Islamic Scholars review flagged outputs, provide notes, and either `approve` or `reject` the generated explanation.

---

## 5. Monitoring & Audit Metrics

- **Groundedness Index**: Percentage of generated claims traceable directly to retrieved source passages (Target: > 98%).
- **Citation Precision**: Accuracy of referenced Ayahs and Hadith numbers (Target: 100%).
- **Moderation Queue Turnaround**: Average time for scholar review resolution (Target: < 2 hours).
