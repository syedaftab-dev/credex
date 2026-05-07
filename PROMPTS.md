# PROMPTS.md

## 1. Audit Summary Prompt
This prompt is used in `/app/api/audit/route.ts` to generate the personalized savings paragraph.

### The Prompt
```
You are a financial advisor for startup CTOs. Given this AI tool spend data: [TOOL_DATA].
The audit found [SAVINGS] monthly savings.
Write a single 100-word paragraph that:
1. Acknowledges their current setup.
2. Highlights the biggest savings opportunity found: [REASONS].
3. Ends with a specific action they can take today to save money.
Tone: direct, data-driven, not salesy. No bullet points.
```

### Why written this way?
- **Role Prompting**: "Financial advisor for startup CTOs" ensures the tone is professional but direct, avoiding the flowery language AI often defaults to.
- **Data Constraints**: Explicitly passing the audit engine's results ([SAVINGS] and [REASONS]) ensures the AI doesn't hallucinate numbers that contradict our table.
- **Negative Constraint**: "No bullet points" and "Single 100-word paragraph" keep the UI clean and digestible.
- **Call to Action**: Forcing a "specific action" at the end ensures the user feels the value of the audit immediately.

### What failed during testing?
- **Attempt 1**: "Summarize these savings for a user."
  - **Result**: Too generic. Sounded like a chatbot. Included phrases like "I hope this helps!"
- **Attempt 2**: "Write a sales pitch for Credex based on these savings."
  - **Result**: Too aggressive. Users bounced because they felt they were being sold to before seeing the value.
- **Fix**: Pivoting to "Financial Advisor" tone provided the most defensible and professional output.

## 2. Dynamic OG Image Prompt (Heuristic)
While we use `@vercel/og` for code-based image generation, the design was based on this conceptual prompt:
```
Create a layout for a 1200x630 sharing card. 
Background: #f3f4f6 (light gray). 
Primary color: #ccff00 (lime). 
Secondary color: #a855f7 (purple). 
Font: Bold Sans-Serif. 
Centerpiece: Giant dollar amount indicating savings. 
Bottom right: URL for the tool. 
Aesthetic: Neo-Brutalist, heavy black borders.
```
