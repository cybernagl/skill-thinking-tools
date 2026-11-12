# Thinking Tools Skill

An agent skill that routes to 43 named thinking tools for problem
framing, diagnosis, systems analysis, decisions, plan tests, forecasts,
conflicts, strategy, and communication. The list starts from the 25
tools on [untools.co](https://untools.co) and adds tools for situations
that the untools list does not cover, such as the pre-mortem, Analysis
of Competing Hypotheses, reference class forecasting, and the kernel of
strategy.

Written by Claude Code, for Claude Code and other agents that read
`SKILL.md` files.

## Design

The skill is small on purpose. Agents were tested without it before a
line was written:

- A frontier model (Claude Fable 5.2) applied every named tool
  correctly in 11 of 11 runs, and reasoned soundly in 10 runs where no
  tool was named. For such a model the skill adds the selection table
  and the traps. It does not add knowledge
- A small model (Claude Haiku 5.5) gave the correct structure for 32 of
  38 tools from memory. It failed on six less-known tools. Those six
  have a reference file in `tools/`
- All other tools have one router row with their structure and their
  main trap

The result is one skill with a router, not one skill for each tool. A
tool gets its own file only where a test showed that an agent gets it
wrong without one.

## Install

    git clone https://github.com/cybernagl/skill-thinking-tools ~/dev/skill-thinking-tools
    ln -s ~/dev/skill-thinking-tools ~/.claude/skills/thinking-tools

There are no dependencies.

## Contents

- `SKILL.md`: when to use the skill, how to choose a tool, the shape of
  an answer, and the router (12 situations, 43 tools)
- `tools/abstraction-laddering.md`
- `tools/confidence-speed-quality.md`
- `tools/conflict-resolution-diagram.md`: the Evaporating Cloud
- `tools/connection-circles.md`
- `tools/hard-choice-model.md`
- `tools/productive-thinking-model.md`

The Zwicky box has its own skill:
[skill-zwicky-box](https://github.com/cybernagl/skill-zwicky-box).

## Sources and Credit

The selection of the first 25 tools follows untools.co. No text from
untools.co is copied. Each description is original, names the person
who developed the tool, and, for the six reference files, lists the
primary sources.

Other agent skills cover similar ground with a different design, for
example [cc-thinking-skills](https://github.com/tjboudreaux/cc-thinking-skills)
(one skill for each mental model) and
[suho/thinking-tools](https://github.com/suho/thinking-tools).

## License

MIT
