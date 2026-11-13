# Visuals

Some tools have an artifact that is a picture: a graph, a tree, a map, or points on two axes. For those tools, draw the picture. The form follows the output format: Mermaid in Markdown, D3 in HTML.

## When to Draw

- Draw only after the first check in `SKILL.md`, and only for a tool in the table below
- The picture is the artifact. It replaces the table or the list; do not give the two together
- A tool that is not in the table has a list or a table as its artifact. Do not draw it
- Do not invent positions. Put a point on an axis only when the case gives a number or the user gives an estimate, and mark each estimate

## Which Format

| The user wants | Give |
|---|---|
| A note, a document, a README, or no stated format | Markdown with a `mermaid` block where the artifact belongs |
| An HTML page, an interactive view, or a page to share | A D3 page from `viz/show.py` |

If the answer goes to a terminal, write the Markdown file or the page into the folder of the user's work and give the path. Do not print Mermaid source in a terminal answer. Never write into the skill folder.

## Forms

| Tool | Markdown: Mermaid | HTML: `viz/show.py` |
|---|---|---|
| Ishikawa diagram | `ishikawa-beta`, see `mermaid/ishikawa.mmd` | `fishbone` |
| Wardley map | `wardley-beta`, see `mermaid/wardley.mmd` | `map` with `kind: "wardley"` |
| Cynefin | `cynefin-beta`, see `mermaid/cynefin.mmd` | No page: use a table |
| Impact-effort matrix with scores | `quadrantChart` | `map` with `kind: "quadrant"` |
| Causal loop diagram, connection circles, system archetypes | `flowchart` with the sign on each link; list the loops below it | `loops` |
| Issue tree, Minto pyramid, 5 Whys, second-order thinking, abstraction laddering | `flowchart`: `LR` for an issue tree, `TB` for a pyramid, `BT` for a ladder | `hierarchy` |
| Expected value and decision tree | `flowchart LR` with the probability on each chance link and the expected value in each node | `tree` |
| Decision matrix, Pugh matrix | A Markdown table, with the stability result below it | `matrix` |
| Conflict resolution diagram, ladder of inference, iceberg model, concept map, OODA loop | `flowchart` or `block-beta` | No page: use the Markdown form |

## Computed Results

For loops, a decision matrix, and a decision tree, do not calculate by hand. Write the data file and run the script with `--check`. It prints the result and writes no page:

```
python3 <skill>/viz/show.py loops data.json --check
```

- `loops`: each feedback loop with its type. An even number of opposite links is reinforcing (R); an odd number is balancing (B)
- `matrix`: the ranking, the margin, and each change of first place when one weight is halved or doubled
- `tree`: the expected value of each node and the best first choice

Use these results in the answer and in the Mermaid diagram.

## Mermaid in Markdown

- Put the block where the artifact belongs in the document, with one line below it that says what the picture shows
- The three `-beta` types need a current renderer: Mermaid 11.16 or later, or Obsidian 1.15 or later. For an older renderer use a `mindmap` for the fishbone, a `flowchart` with one subgraph for each evolution stage for the Wardley map, and a table for Cynefin
- Start from the snippet. Change the content and keep the syntax
- `wardley-beta`: the coordinates are `[visibility, evolution]`, each from 0 to 1. Visibility is the vertical axis. This is the reverse of x and y
- `cynefin-beta`: each item is a quoted string on its own line below its domain. Use at most four items for each domain
- `ishikawa-beta`: the first line is the effect. The indent sets the level
- `quadrantChart`: a point is `Name: [x, y]` with values from 0 to 1 and no colon in the name. `quadrant-1` is top right, `quadrant-2` top left, `quadrant-3` bottom left, `quadrant-4` bottom right
- `flowchart`: put a label in quotes when it has a bracket, a colon, or a percent sign, as in `a["Label (detail)"]`. Do not use `end` as a node name
- Keep a diagram below about 25 nodes. Split a larger one
- Do not use an online render service or a link that carries the diagram in its address. These send the user's content to a third party

## D3 Pages in HTML

Write the data as JSON, then build the page:

```
python3 <skill>/viz/show.py <kind> data.json --out page.html
```

The page is one file with D3 inside it, and it works offline. Add `--open` only when the user asked to see the page. Each kind has an example in `viz/examples/`. Copy the example and replace its content.

| Kind | Data | The reader can |
|---|---|---|
| `loops` | `elements` (5 to 10 names) and `links` with `from`, `to`, `sign` (`+` or `-`), optional `delay`, `note`, `basis` | Select a loop and see it traced on the circle |
| `matrix` | `options`, `criteria` with `name` and `weight`, `scores` for each option, optional `knockouts` | Move the weights and see if the ranking holds |
| `tree` | `root` with `children`; a chance branch has `p`, an end has `value`; optional `cost`, `unit`, `goal` | Move the probabilities and see if the best choice holds |
| `hierarchy` | `root` with `label`, optional `note`, `tag`, `via`, `children`; `direction` is `right`, `down`, or `up` | Collapse and expand branches |
| `fishbone` | `effect` and `categories`, each with `causes` that have a `label` and a `status` (confirmed, probable, open, ruled out) | Read the note of each cause |
| `map` | `kind` (`wardley` or `quadrant`) and `points` with `x`, `y`, optional `estimate`, `moveTo`, `note`; optional `links` | Read the values and note of each point |

In the answer, give the conclusion, then the path of the page, then what the picture shows.
