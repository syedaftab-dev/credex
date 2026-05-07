# USER_INTERVIEWS.md

## Interview 1: Alex R., CTO @ Fintech Seed Startup (12 devs)
**Direct Quote**: "I didn't realize half the team was expensing Claude Pro on their personal cards while we already have a ChatGPT Team account. It's only $20, but it adds up to $3,000/year across the whole team that just... disappears."
**Surprise Thing**: Alex didn't care about the API costs as much as the "Seat Waste." He was surprised that the tool flagged his 12-seat Business account as unnecessary because only 3 people used the admin features.
**Design Change**: Added the "Seats" input to Step 1. Originally I just asked for total spend, but Alex said "I need to see it per-seat to know if I should downgrade the plan type."

## Interview 2: Sarah L., Founder @ AI Marketing Tool (4 devs)
**Direct Quote**: "We use the API heavily, but for coding, I just told everyone to get whatever they wanted. Now I see we're paying for Cursor, Copilot, AND Windsurf. It's chaotic. I need a single 'AI Productivity' line item."
**Surprise Thing**: Sarah was looking for "Tool Consolidation" more than "Price Savings." She wanted to know which tool was the *best* value, not just the cheapest.
**Design Change**: Implemented the "Redundancy" logic in the audit engine. If multiple tools are used for "coding," we now flag it immediately as a primary savings opportunity.

## Interview 3: Michael T., VP Engineering @ Growth Stage (45 devs)
**Direct Quote**: "At 50 people, $20/mo is $12k/year. That's a developer's health insurance. If I can cut that in half by switching to a unified Enterprise plan, I'll do it today. But the math has to be defensible for my CFO."
**Surprise Thing**: Michael wanted a "Shareable Link" he could send to his CFO. He said a screenshot isn't enough; he needs something that looks "official" and live.
**Design Change**: Built the `Share URL` feature with public access. Michael inspired the "Hero Metric" at the top of the results page—making the "Annual Savings" the biggest number on the screen to help it pass the "CFO Test."
