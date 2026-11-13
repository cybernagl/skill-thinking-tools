---
name: thinking-tools
description: Use when the user names a thinking tool, framework, or mental model, or asks for the diagram of one (for example Cynefin, issue tree, pre-mortem, evaporating cloud, decision matrix, decision tree, fishbone or Ishikawa diagram, causal loop diagram, OODA, Minto pyramid, Wardley map), asks which framework, method, or mental model to use, asks in so many words for a structured, systematic, or framework-based approach to a problem or decision, or asks for the agenda of a thinking, decision, or problem-solving workshop. Not for an ordinary request to decide, diagnose, debug, plan, or write that does not ask for a method, and not for diagrams of software, data, or processes. Also applies to the German terms Denkwerkzeug, Denkmodell, Entscheidungsmatrix, Ursachenanalyse, Fischgrätdiagramm, and Konfliktwolke.
---

# Thinking Tools

## Overview

A router for about 40 named thinking tools: which tool fits which situation, its exact structure, and its main trap. The tool serves the answer. Use a tool only when its structure does work that plain reasoning does not do.

## First Check

Did the user do one of these things?

- Name a tool, framework, or mental model
- Ask which tool or method to use
- Ask in so many words for a structured or systematic approach
- Ask for the agenda of a workshop

If the answer is no, this skill does not apply. Answer as you would without it: no tool, no matrix, no diagram, no added sections. In tests, answers that added a framework that the user did not request were longer and were judged worse than plain answers.

If the answer is yes, continue.

Related skills: `zwicky-box` for a solution space with several dimensions, `disciplined-entrepreneurship` for venture planning, `superpowers:systematic-debugging` for defects in code.

## How to Choose

1. Find the situation in the router and pick one tool
2. If one fact or one constraint decides the question, say so and decide. Do not build a matrix around a question that is already decided
3. If the user named a tool, apply that tool. If a different tool fits better, say so in one line
4. Add a second tool only when it answers a different question, for example a diagnosis first and a decision after it
5. Some router rows name a file. Those tools have a structure that is often reproduced wrongly. Read the file before you apply the tool

## Shape of the Answer

1. The conclusion or recommendation
2. The artifact of the tool (matrix, tree, diagram, or list), filled with the facts of the case. Mark each entry that is your assumption and not a stated fact
3. What the tool showed that changes the recommendation. If it changed nothing, say so
4. The checks or data that can overturn the result

If the artifact of the tool is a picture (a diagram, a tree, a map), read `visuals.md`: a Mermaid block when the answer is Markdown, a D3 page when the answer is HTML.

## Router

Each row gives the structure and the trap, which is the usual error and how to avoid it.

### Classify the Situation

| Tool | Structure | Trap |
|---|---|---|
| Cynefin (Snowden) | Five domains with their responses. Clear: sense, categorise, respond. Complicated: sense, analyse, respond. Complex: probe, sense, respond. Chaotic: act, sense, respond. Confusion: split the situation into parts | One domain for the whole situation. Classify each part |
| Type 1 and Type 2 decisions (Bezos) | Type 1 cannot be reversed: decide slowly and with care. Type 2 can be reversed: decide fast, with about 70% of the information you want | The careful process applied to a reversible decision |
| Hard choice model: `tools/hard-choice-model.md` | Impact against ease of comparison. Four kinds: no-brainer, apples and oranges, big choice, hard choice | Missing information taken for a hard choice |
| Confidence determines speed vs. quality: `tools/confidence-speed-quality.md` | Confidence in the problem and in the solution sets the mode: learn fast, or build for quality | Conviction counted as confidence |

### Frame the Problem

| Tool | Structure | Trap |
|---|---|---|
| Abstraction laddering: `tools/abstraction-laddering.md` | "Why?" moves up to a wider problem statement, "how?" moves down to a narrower one. Choose the level to solve | One chain only. Ask "why else?" |
| First principles | List the assumptions. Keep only what physics, logic, or hard evidence requires. Build the solution again from those | The name without the work. State the constraints you kept and the conventions you dropped |
| Issue tree (Minto, consulting practice) | One root question. Branches that do not overlap and leave no gap (MECE). A "why" tree for a diagnosis, a "how" tree for solutions. Each leaf is a question that data can answer | Branches that overlap. No priorities: rank the branches and start with the largest |
| Productive Thinking Model (Hurson): `tools/productive-thinking-model.md` | Six named steps from "What's going on?" to "Align resources" | The first question that comes to mind gets solved |

### Find the Cause

| Tool | Structure | Trap |
|---|---|---|
| Ishikawa diagram (fishbone) | The effect at the head. Category bones, for production the 6M: people, machine, method, material, measurement, environment. Causes and sub-causes on each bone | The diagram collects opinions. Verify each probable cause with data |
| 5 Whys (Toyota) | Ask "why?" of each answer until the answer is a cause in the process or the system | One chain where the causes branch. A stop at "human error" |
| Kepner-Tregoe problem analysis | A table of IS and IS NOT for what, where, when, and extent. Then the distinctions, then the changes. Test each possible cause against each line | An empty IS NOT column. A cause that explains only the IS column |
| Analysis of Competing Hypotheses (Heuer) | A matrix of hypotheses against evidence. Rate each item as consistent or inconsistent with each hypothesis. The hypothesis with the least evidence against it stays | A count of the evidence that fits. Remove evidence that fits all hypotheses, and test the result against an error in a key item |
| Iceberg model | Four levels: events, patterns, structures, mental models. Each level explains the level above it | Four lists with no link between the levels |
| Ladder of inference (Argyris) | Rungs from the bottom: observable data, selected data, meanings, assumptions, conclusions, beliefs, actions | A conclusion defended before its data is checked. Go down the ladder, yours and the other person's |

### Understand a System

| Tool | Structure | Trap |
|---|---|---|
| Causal loop diagram | Variables are nouns that can go up or down. Each link is + (same direction) or - (opposite direction). A loop with an even number of - links is reinforcing (R). An odd number is balancing (B). Mark the delays | Events or actions used as variables. No delays |
| Connection circles: `tools/connection-circles.md` | Five to ten elements on a circle, arrows for cause, closed paths traced as loops | Lines counted where loops must be traced |
| System archetypes (Senge, Kim) | Known loop patterns: fixes that fail, shifting the burden, limits to growth, tragedy of the commons, eroding goals, escalation, success to the successful, growth and underinvestment | A match on the story. Match on the loop structure |
| Leverage points (Meadows) | Twelve places to intervene, from parameters (weakest) through feedback loops, information flows, rules, and goals to paradigms (strongest) | All effort on parameters |
| Five focusing steps (Goldratt) | Identify the constraint, exploit it, subordinate all else to it, elevate it, then start again | Work on a step that is not the constraint |
| Concept map (Novak) | A focus question. Concepts in nodes. Each link has a linking phrase, so that node, phrase, node reads as a statement. Cross-links between branches | Links with no phrase |

### Generate Options

For two options that exclude each other, see the conflict resolution diagram below.

| Tool | Structure | Trap |
|---|---|---|
| Zwicky box: skill `zwicky-box` | Parameters against options. Each path through the matrix is a concept | See that skill |
| Inversion | Ask how to cause the failure with certainty. Then prevent each item on that list | A list of failures with no action from it |
| TRIZ contradictions (Altshuller) | State the ideal final result. Technical contradiction (better A makes B worse): use the 40 inventive principles. Physical contradiction (one part must be X and not X): separate in space, in time, on condition, or between part and whole | Cells of the contradiction matrix quoted from memory. Look them up, or select principles by mechanism and say so |

### Choose

| Tool | Structure | Trap |
|---|---|---|
| Decision matrix | Options against weighted criteria. Apply knock-out criteria first. Score, multiply, sum | Weights adjusted until the favourite wins. Show if the ranking holds with other weights |
| Pugh matrix | Each concept rated better (+), same (S), or worse (-) than a baseline concept, for each criterion | The sums treated as a score. The purpose is to improve and combine concepts |
| Impact-effort matrix | Two-by-two: quick wins, major projects, fill-ins, thankless tasks | Impact and effort are guesses. Mark the uncertain ones |
| Eisenhower matrix | Urgent against important: do, schedule, delegate, drop | Urgent taken for important |
| Six Thinking Hats (de Bono) | One mode at a time, all people in the same mode. White: facts. Red: feelings. Black: risks. Yellow: benefits. Green: ideas. Blue: process | The hats merge into one general list. Keep the output of each hat apart |
| Expected value and decision tree | Decision nodes, chance nodes with probabilities that sum to 1, payoffs at the ends. Calculate from the ends back to the start | Exact numbers from guessed probabilities. Show how the choice changes when they change |

### Test a Plan

| Tool | Structure | Trap |
|---|---|---|
| Pre-mortem (Klein) | Assume that the plan has failed. Each person writes the reasons alone. Collect them. Change the plan for the most probable ones | A general risk list. The reasons must be specific to this plan, and the result is a changed plan |
| Second-order thinking | For each option ask "and then what?", for each affected party and at several points in time | A stop after the first effect |
| Key assumptions check | For each assumption: why you believe it, what would make it false, and the effect on the conclusion if it is false | Only the assumptions that someone stated. Find the ones that nobody said |

### Estimate and Forecast

| Tool | Structure | Trap |
|---|---|---|
| Reference class forecasting (Kahneman, Flyvbjerg) | Choose a class of similar past cases. Get the distribution of their results. Place this case in the distribution. Adjust only for differences that you can name | A class that flatters the case. No real data: search for the base rates, or say that you have none |
| Fermi estimation | Split the quantity into factors that you can estimate. Give each factor a range. Multiply. Check the result by a second route | One number with no range |

### Act Under Pressure

| Tool | Structure | Trap |
|---|---|---|
| OODA loop (Boyd) | Observe, orient, decide, act. Orientation shapes the other three | A simple cycle that is run faster. The gain comes from a better orientation |

### Resolve a Conflict

| Tool | Structure | Trap |
|---|---|---|
| Conflict resolution diagram (Goldratt): `tools/conflict-resolution-diagram.md` | Five boxes: objective A, needs B and C, conflicting wants D and D'. Find the false assumption under an arrow | A compromise presented as a solution |
| Principled negotiation (Fisher, Ury) | Separate the people from the problem. Interests, not positions. Options for mutual gain. Objective criteria. Know your best alternative (BATNA) | Bargaining over positions |

### Set a Strategy

| Tool | Structure | Trap |
|---|---|---|
| Kernel of strategy (Rumelt) | Diagnosis of the challenge. Guiding policy. Coherent actions | Goals in the place of a strategy. A policy that excludes nothing |
| Playing to Win cascade (Lafley, Martin) | Five linked choices: winning aspiration, where to play, how to win, capabilities, management systems. Test each option with "What would have to be true?" | Five answers that do not constrain each other |
| Wardley map | Anchor on a user need. Components by visibility to the user (vertical) and by evolution (horizontal): genesis, custom-built, product, commodity. Arrows for movement | No anchor. No movement |
| Scenario planning (Shell, Schwartz) | A focal question. Driving forces. The two most uncertain and most important forces as axes. Four scenarios, each with a name and early signs | Best case, base case, worst case. Scenarios are not forecasts |

### Communicate

| Tool | Structure | Trap |
|---|---|---|
| Minto pyramid | The answer first. Below it, groups of arguments that do not overlap. Each level answers the question that the level above raises. Introduction: situation, complication, question, answer | The story in time order with the answer at the end |
| Situation-Behavior-Impact (CCL) | The situation (when and where). The behaviour that you observed. Its impact on you or on others. Then ask for the other view | A judgment about the person in the place of the behaviour |

## Common Mistakes

- A tool that the user did not ask for: go back to the first check
- A tool on an answer that was already clear: skip the tool and give the answer
- Three tools as sketches: do one tool in full
- An artifact with no conclusion: the recommendation comes first
- A structure written from memory when the router names a file: read the file
