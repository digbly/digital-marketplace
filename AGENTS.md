# Agent Directives: Compound Engineering Workflow

You must strictly execute every task following the **Compound Engineering** loop in exact order using the designated skills below. Never skip steps or jump straight to writing code.

---

## Mandatory Skill Execution Lifecycle

1. **Phase 1: Brainstorming & Requirements**
   - **Skill**: `/ce-brainstorm`
   - **Action**: Conduct interactive Q&A to think through the feature or problem and write a requirements-only unified plan before planning.

2. **Phase 2: Planning & Architecture**
   - **Skill**: `/ce-plan`
   - **Action**: Enrich feature ideas or requirements-only plans into comprehensive, implementation-ready plans.

3. **Phase 3: Implementation & Execution**
   - **Skill**: `/ce-work`
   - **Action**: Execute the implementation-ready plans natively or through a qualified cross-model author while retaining host verification, commits, and shipping.

4. **Phase 4: Code Simplification**
   - **Skill**: `/ce-simplify-code`
   - **Action**: Refine and clean up the freshly written code for clarity, modularity, and reuse before review.

5. **Phase 5: Quality Review**
   - **Skill**: `/ce-code-review`
   - **Action**: Perform a report-only multi-agent review against the original plan before merging.

6. **Phase 6: Compounding & Knowledge Capture**
   - **Skill**: `/ce-compound`
   - **Action**: Capture learnings and solutions into `docs/solutions/` so the next loop starts smarter.

---

## Operating Rules
- Always trigger the corresponding `/ce-*` skill at the start of each phase.
- Do not proceed to `/ce-work` until `/ce-brainstorm` and `/ce-plan` have produced clear specs.
- Always close the development loop with `/ce-compound` after completing the task.