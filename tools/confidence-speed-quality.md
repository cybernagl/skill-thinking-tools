# Confidence Determines Speed vs. Quality

A product-building rule from Brandon Chu (2018). Speed and quality are not a fixed trade-off. Your confidence decides which one to favour for a given piece of work.

## Structure

Two confidence questions, each answered with evidence:

| Question | Low confidence | High confidence |
|---|---|---|
| Is the problem important? | Nobody outside the team has confirmed it | Customers confirmed it, or data shows it |
| Is the solution correct? | The solution is your idea, not tested | Customers validated the solution |

The two answers put the work on a line:

```
low confidence  <------------------------------>  high confidence
favour speed: build little, learn fast           favour quality: build it properly, no shortcuts
```

## Steps

1. For each piece of work, answer the two questions. Write the evidence next to each answer
2. Problem confidence low: do not build yet. Find out if the problem is real (talk to users, look at the data)
3. Problem confidence high, solution confidence low: build the smallest version that can show if the solution works, and say that it is a test
4. Two times high: build for quality
5. Rate the work again when new evidence arrives. Work moves along the line

## Checks

- Confidence means evidence, not conviction. A team is usually too sure of its own ideas. "We are certain" with no customer evidence is low confidence
- The rule tells you how to build each item. It does not rank the items
- Agree the mode with the stakeholders. A fast test that others take for the finished product causes conflict
- A request for a solution ("build an API") is evidence for a problem, not for that solution

## Wrong Tool When

- Safety-critical or regulated work: quality is fixed and is not traded
- The question is which item to do first: use an impact-effort matrix or a decision matrix

## Sources

- Chu, Brandon. "Product Management Mental Models for Everyone." The Black Box of Product Management, 2018 (model 6)
- O'Haire, Wes. "Mental Models for Designers." Dropbox Design, 2019 (two-by-two variant, credited to Chu)
