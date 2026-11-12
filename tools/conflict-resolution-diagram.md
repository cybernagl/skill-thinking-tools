# Conflict Resolution Diagram

Also: Evaporating Cloud, Konfliktwolke. A five-box diagram from the Theory of Constraints (Eliyahu Goldratt, 1990). Use it when two actions exclude each other and each side has a good reason. It removes the conflict by finding a false assumption. It does not look for a compromise.

## Structure

```
                 +--- B: need <--- D: want
A: objective <---+                     ^
                 |                     | conflict
                 +--- C: need <--- D': want
```

| Box | Content | Test |
|---|---|---|
| A | The objective that the two sides share | Each side agrees with it |
| B | The need that the first side protects | Necessary for A |
| C | The need that the second side protects | Necessary for A |
| D | The action that the first side demands | Its purpose is B |
| D' | The action that the second side demands | Its purpose is C, and it excludes D |

Each arrow is a necessity. Read it as: "To have [head], we must have [tail], because [assumption]." There are five arrows: B to A, C to A, D to B, D' to C, and the conflict between D and D'.

## Steps

1. Write D and D': the two actions, in the words of each side
2. Write B and C: ask of each action "What does this give you?"
3. Write A: the objective that needs B and C together
4. Read each arrow aloud in the necessity form. Correct the boxes until each side accepts its sentences
5. List the assumptions under each arrow: complete the "because" clause several times. Start with D to B, D' to C, and the conflict arrow ("We cannot do the two actions together, because ...")
6. Find an assumption that is false, or that an action can make false. That action is the injection
7. Check the injection: it must satisfy B and C in full. Then name the new problems that it causes

## Checks

- B and C are needs, not weaker forms of D and D'. "Freeze all features" is a want. "A team that can ship reliably" is a need
- Only D and D' conflict. If B and C conflict, A is wrong or too narrow
- A split of capacity between D and D' is a compromise, not an injection. Accept a solution only when you can name the assumption that it removes
- Mark each assumption as stated by a party or assumed by you. An assumption that you cannot verify becomes a question for that party
- If no assumption fails, say that the cloud does not evaporate. The choice is then a real trade-off: decide by which loss is harder to reverse

## Wrong Tool When

- The sides do not share an objective: find the interests first (principled negotiation)
- There are many parties or many linked issues: the diagram holds one conflict between two actions
- One side has a fact wrong: check the fact

## Sources

- Goldratt, Eliyahu M. What Is This Thing Called Theory of Constraints and How Should It Be Implemented? North River Press, 1990
- Goldratt, Eliyahu M. It's Not Luck. North River Press, 1994
- Dettmer, H. William. The Logical Thinking Process (source of the name Conflict Resolution Diagram)
