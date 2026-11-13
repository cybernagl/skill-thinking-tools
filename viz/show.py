#!/usr/bin/env python3
"""Build a standalone HTML page that shows the artifact of a thinking tool.

  python3 show.py mermaid FILE [FILE ...]   Mermaid diagrams (.mmd files, or .md files with mermaid blocks)
  python3 show.py loops   DATA.json         loop map: connection circle with signed links and its feedback loops
  python3 show.py matrix  DATA.json         decision matrix with weights that the reader can change
  python3 show.py tree    DATA.json         decision tree with expected values that recalculate
  python3 show.py hierarchy DATA.json       tree of statements: issue tree, pyramid, chain of whys, consequences
  python3 show.py fishbone DATA.json        Ishikawa diagram: one effect, categories, causes with a status
  python3 show.py map     DATA.json         points on two axes: Wardley map, or impact against effort

Options:
  --out FILE   where to write the page (default: ./<kind>-<name>.html in the current folder)
  --open       open the page in the default browser after it is written
  --check      print the computed result only, write no page

The script prints the computed result (loops, ranking, expected values). Use those
numbers in the answer; do not calculate them by hand. The page is one file. The
D3 pages work offline. The Mermaid page loads Mermaid from a CDN when it is opened.
The script never writes into the skill folder, and it sends no data anywhere.
"""
import argparse
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
MERMAID_VERSION = "12.3.0"
D3_FILE = os.path.join(HERE, "vendor", "d3.v7.9.2.min.js")


def fail(message):
    sys.exit("show.py: " + message)


def read(path):
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def json_for_html(value):
    """JSON that is safe inside a <script> element."""
    text = json.dumps(value, ensure_ascii=False)
    return (
        text.replace("</", "<\\/")
        .replace("<!--", "<\\!--")
        .replace(" ", "\\u2028")
        .replace(" ", "\\u2029")
    )


def js_for_html(source):
    return source.replace("</script", "<\\/script")


def build(template, data, libs=(), with_d3=True):
    page = read(os.path.join(HERE, "templates", template))
    page = page.replace("/*__D3__*/", js_for_html(read(D3_FILE)) if with_d3 else "")
    page = page.replace("/*__LIB__*/", "\n".join(js_for_html(read(os.path.join(HERE, "lib", lib))) for lib in libs))
    return page.replace("__DATA__", json_for_html(data))


# ---------------------------------------------------------------- loops

OPPOSITE = {"-", "−", "o", "opposite", "minus", "negative"}
SAME = {"+", "s", "same", "plus", "positive"}


def loops_model(data):
    errors, nodes, index = [], [], {}
    for element in data.get("elements", []):
        if isinstance(element, str):
            ident, label = element, element
        else:
            ident = str(element.get("id") or element.get("label"))
            label = str(element.get("label") or element.get("id"))
        if ident in index:
            errors.append("Element listed twice: " + ident)
            continue
        index[ident] = len(nodes)
        nodes.append(label)
    by_label = {label: i for i, label in enumerate(nodes)}
    links = []
    for number, link in enumerate(data.get("links", []), 1):
        ends = []
        for key in ("from", "to"):
            ref = str(link.get(key))
            ends.append(index.get(ref, by_label.get(ref, -1)))
        sign = str(link.get("sign", "")).strip().lower()
        name = "%s -> %s" % (link.get("from"), link.get("to"))
        if min(ends) < 0:
            errors.append("Link %d names an element that is not in the list: %s" % (number, name))
        elif ends[0] == ends[1]:
            errors.append("Link %d goes from an element to itself: %s" % (number, link.get("from")))
        elif sign not in OPPOSITE and sign not in SAME:
            errors.append('Link %d has no valid sign (use "+" or "-"): %s' % (number, name))
        else:
            links.append((ends[0], ends[1], "-" if sign in OPPOSITE else "+", bool(link.get("delay"))))
    return nodes, links, errors


def find_loops(nodes, links, cap=200):
    """All simple cycles, each found once: a cycle starts at its lowest-numbered node."""
    out = [[] for _ in nodes]
    for number, (source, target, _sign, _delay) in enumerate(links):
        out[source].append((target, number))
    loops, capped = [], False

    def walk(start, node, path_nodes, path_links, seen):
        nonlocal capped
        for target, number in out[node]:
            if capped:
                return
            if target == start:
                if len(loops) >= cap:
                    capped = True
                    return
                loops.append((list(path_nodes), path_links + [number]))
            elif target > start and target not in seen:
                seen.add(target)
                path_nodes.append(target)
                walk(start, target, path_nodes, path_links + [number], seen)
                path_nodes.pop()
                seen.discard(target)

    for start in range(len(nodes)):
        if capped:
            break
        walk(start, start, [start], [], {start})
    loops.sort(key=lambda loop: (len(loop[1]), loop[0][0]))
    result, count = [], {"R": 0, "B": 0}
    for path_nodes, path_links in loops:
        opposite = sum(1 for number in path_links if links[number][2] == "-")
        kind = "R" if opposite % 2 == 0 else "B"
        count[kind] += 1
        result.append(
            {
                "name": "%s%d" % (kind, count[kind]),
                "type": kind,
                "opposite": opposite,
                "delays": sum(1 for number in path_links if links[number][3]),
                "nodes": path_nodes,
                "links": path_links,
                "text": " -> ".join(nodes[i] for i in path_nodes + [path_nodes[0]]),
            }
        )
    return result, capped


def report_loops(data):
    nodes, links, errors = loops_model(data)
    loops, capped = find_loops(nodes, links)
    lines = ["%d elements, %d links, %d feedback loops" % (len(nodes), len(links), len(loops))]
    for loop in loops:
        kind = "reinforcing" if loop["type"] == "R" else "balancing"
        extra = ", %d delayed" % loop["delays"] if loop["delays"] else ""
        lines.append("  %s %s: %s (%d opposite%s)" % (loop["name"], kind, loop["text"], loop["opposite"], extra))
    if capped:
        lines.append("  More than 200 loops: the list is cut. Use fewer elements.")
    if not 5 <= len(nodes) <= 10:
        lines.append("  Note: a connection circle works with 5 to 10 elements; this one has %d." % len(nodes))
    lines += ["  NOT DRAWN: " + error for error in errors]
    return lines


# ---------------------------------------------------------------- matrix


def matrix_totals(data, weights=None):
    options = data["options"]
    criteria = data["criteria"]
    weights = [float(c["weight"]) for c in criteria] if weights is None else weights
    total = sum(weights) or 1.0
    result = {}
    out = {k.get("option") for k in data.get("knockouts", [])}
    for option in options:
        if option not in data.get("scores", {}):
            if option in out:
                continue
            fail("matrix: option %r has no scores" % option)
        scores = data["scores"][option]
        if len(scores) != len(criteria):
            fail("matrix: option %r has %d scores for %d criteria" % (option, len(scores), len(criteria)))
        result[option] = sum(w * float(s) for w, s in zip(weights, scores)) / total
    return result


def matrix_ranking(data, weights=None):
    out = {k.get("option") for k in data.get("knockouts", [])}
    totals = matrix_totals(data, weights)
    ranked = sorted((o for o in data["options"] if o not in out and o in totals), key=lambda o: -totals[o])
    return ranked, totals


def report_matrix(data):
    ranked, totals = matrix_ranking(data)
    lines = []
    for knockout in data.get("knockouts", []):
        lines.append("  Out before scoring: %s (%s)" % (knockout.get("option"), knockout.get("reason", "no reason given")))
    for place, option in enumerate(ranked, 1):
        lines.append("  %d. %s: %.2f" % (place, option, totals[option]))
    base = [float(c["weight"]) for c in data["criteria"]]
    flips = []
    for i, criterion in enumerate(data["criteria"]):
        for factor, word in ((0.5, "halved"), (2.0, "doubled")):
            weights = list(base)
            weights[i] *= factor
            other, _ = matrix_ranking(data, weights)
            if ranked and other and other[0] != ranked[0]:
                flips.append("  Weight of %r %s: %s moves to first place" % (criterion["name"], word, other[0]))
    if len(ranked) > 1:
        margin = totals[ranked[0]] - totals[ranked[1]]
        lines.append("  Margin between first and second: %.2f" % margin)
    lines.append("  Stability: " + ("the first place holds when any one weight is halved or doubled" if not flips else "the first place changes"))
    return ["%d options, %d criteria" % (len(data["options"]), len(data["criteria"]))] + lines + flips


# ---------------------------------------------------------------- tree


def node_kind(node):
    children = node.get("children") or []
    if not children:
        return "end"
    if node.get("type") in ("decision", "chance"):
        return node["type"]
    return "chance" if any("p" in child for child in children) else "decision"


def rollback(node, goal="max", path="root"):
    """Expected value of a node. Adds 'ev', 'kind', and for a decision node 'best' to the tree."""
    kind = node_kind(node)
    node["kind"] = kind
    cost = float(node.get("cost", 0) or 0)
    if kind == "end":
        if "value" not in node:
            fail("tree: the end node %r has no value" % node.get("label", path))
        node["ev"] = float(node["value"]) - cost
        return node["ev"]
    values = [rollback(child, goal, "%s > %s" % (path, child.get("label", "?"))) for child in node["children"]]
    if kind == "chance":
        probabilities = [float(child.get("p", 0)) for child in node["children"]]
        if abs(sum(probabilities) - 1.0) > 0.001:
            fail("tree: the probabilities under %r add up to %.3f, not 1" % (node.get("label", path), sum(probabilities)))
        node["ev"] = sum(p * v for p, v in zip(probabilities, values)) - cost
    else:
        pick = max if goal == "max" else min
        node["ev"] = pick(values) - cost
        node["best"] = values.index(pick(values))
    return node["ev"]


def report_tree(data):
    goal = data.get("goal", "max")
    if goal not in ("max", "min"):
        fail('tree: "goal" must be "max" or "min", not %r' % goal)
    unit = data.get("unit", "")
    root = json.loads(json.dumps(data["root"]))
    rollback(root, goal)
    lines = []

    def describe(node, depth, chosen):
        chance = " (p %.2f)" % float(node["p"]) if "p" in node else ""
        word = "value" if node["kind"] == "end" else "EV"
        mark = "  <- best" if chosen else ""
        lines.append(("  %s%s%s: %s %.3f %s" % ("  " * depth, node.get("label", ""), chance, word, node["ev"], unit)).rstrip() + mark)
        for i, child in enumerate(node.get("children") or []):
            describe(child, depth + 1, node["kind"] == "decision" and node.get("best") == i)

    describe(root, 0, False)
    if root["kind"] == "decision":
        best = root["children"][root["best"]]
        lines.append("  Best first choice (%s expected value): %s, EV %.3f %s" % ("highest" if goal == "max" else "lowest", best.get("label", "?"), best["ev"], unit))
    return ["decision tree, expected values by rollback"] + lines


# ---------------------------------------------------------------- hierarchy, fishbone, map


def report_hierarchy(data):
    if "root" not in data:
        fail("hierarchy: the data has no root")
    count, depth, leaves = [0], [0], [0]

    def visit(node, level):
        if not isinstance(node, dict) or not node.get("label"):
            fail("hierarchy: each node needs a label")
        count[0] += 1
        depth[0] = max(depth[0], level)
        children = node.get("children") or []
        if not children:
            leaves[0] += 1
        for child in children:
            visit(child, level + 1)

    visit(data["root"], 1)
    lines = ["%d statements, %d levels, %d at the ends" % (count[0], depth[0], leaves[0])]
    if count[0] > 40:
        lines.append("  Note: more than 40 statements are hard to read on one page. Cut the tree or split it.")
    return lines


def report_fishbone(data):
    if not data.get("effect"):
        fail("fishbone: the data has no effect")
    categories = data.get("categories") or []
    causes = [cause for category in categories for cause in category.get("causes") or []]
    status = {}
    known = ("confirmed", "probable", "open", "ruled out")
    for cause in causes:
        key = str(cause.get("status", "open")).strip().lower().replace("-", " ").replace("_", " ") if isinstance(cause, dict) else "open"
        key = key if key in known else "open"
        status[key] = status.get(key, 0) + 1
    lines = ["effect: %s" % data["effect"], "  %d categories, %d causes" % (len(categories), len(causes))]
    lines += ["  %s: %d" % (key, number) for key, number in sorted(status.items())]
    return lines


def report_map(data):
    points = data.get("points") or []
    low, high = data.get("scale", [0, 1])
    names, lines = set(), []
    for point in points:
        ident = str(point.get("id") or point.get("label"))
        names.update({ident, str(point.get("label"))})
        for axis in ("x", "y"):
            if not isinstance(point.get(axis), (int, float)) or not low <= point[axis] <= high:
                lines.append("  NOT DRAWN: %s has no %s between %s and %s" % (ident, axis, low, high))
        if "moveTo" in point and (not isinstance(point["moveTo"], (int, float)) or not low <= point["moveTo"] <= high):
            lines.append("  NO ARROW: %s has a moveTo that is not between %s and %s" % (ident, low, high))
    for link in data.get("links") or []:
        for key in ("from", "to"):
            if str(link.get(key)) not in names:
                lines.append("  NOT DRAWN: a link names a point that is not in the list: %s" % link.get(key))
    estimates = sum(1 for point in points if point.get("estimate"))
    head = "%s map: %d points, %d links" % (data.get("kind", "quadrant"), len(points), len(data.get("links") or []))
    if estimates:
        lines.append("  %d positions are marked as estimates" % estimates)
    return [head] + lines


# ---------------------------------------------------------------- mermaid


def mermaid_items(paths):
    items = []
    for path in paths:
        text = read(path)
        name = os.path.splitext(os.path.basename(path))[0]
        if path.lower().endswith((".md", ".markdown")):
            heading = name
            position = 0
            for match in re.finditer(r"^(#{1,6})\s+(.+?)\s*$|^```mermaid\s*\n(.*?)^```\s*$", text, re.M | re.S):
                if match.group(2) is not None:
                    heading = match.group(2)
                else:
                    position += 1
                    items.append({"title": heading, "code": match.group(3)})
            if not position:
                fail("mermaid: no ```mermaid block in " + path)
        else:
            items.append({"title": name, "code": text})
    return items


# ---------------------------------------------------------------- main

KINDS = {
    "loops": ("loops.html", ("loops.js",), report_loops),
    "matrix": ("matrix.html", ("decision.js",), report_matrix),
    "tree": ("tree.html", ("decision.js",), report_tree),
    "hierarchy": ("hierarchy.html", (), report_hierarchy),
    "fishbone": ("fishbone.html", (), report_fishbone),
    "map": ("map.html", (), report_map),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("kind", choices=["mermaid"] + sorted(KINDS))
    parser.add_argument("inputs", nargs="+")
    parser.add_argument("--out")
    parser.add_argument("--open", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    for path in args.inputs:
        if not os.path.isfile(path):
            fail("no such file: " + path)

    if args.kind == "mermaid":
        items = mermaid_items(args.inputs)
        print("%d Mermaid diagram%s (rendered with Mermaid %s when the page is opened)" % (len(items), "" if len(items) == 1 else "s", MERMAID_VERSION))
        page = build("mermaid.html", {"version": MERMAID_VERSION, "diagrams": items}, with_d3=False)
    else:
        if len(args.inputs) != 1:
            fail("%s takes one JSON file" % args.kind)
        try:
            data = json.loads(read(args.inputs[0]))
        except ValueError as error:
            fail("the input is not valid JSON: %s" % error)
        template, libs, report = KINDS[args.kind]
        print("\n".join(report(data)))
        page = "" if args.check else build(template, data, libs)

    if args.check:
        return
    stem = os.path.splitext(os.path.basename(args.inputs[0]))[0]
    out = os.path.abspath(args.out or "%s-%s.html" % (args.kind, stem))
    if os.path.commonpath([out, SKILL]) == SKILL:
        fail("the page must not be written into the skill folder. Run the command from the folder of your work, or give --out")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as handle:
        handle.write(page)
    print("page: " + out)
    if args.open:
        opener = "open" if sys.platform == "darwin" else "xdg-open"
        try:
            subprocess.run([opener, out], check=False)
        except OSError:
            print("could not open the page; open the file in a browser")


if __name__ == "__main__":
    main()
