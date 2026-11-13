#!/usr/bin/env python3
"""Checks for viz/show.py against hand-worked cases. Run: python3 viz/tests/test_show.py

The script also runs viz/tests/run.js when Node is installed, so that the Python
results and the JavaScript results of the pages are checked against the same cases.
"""
import copy
import json
import os
import shutil
import subprocess
import sys
import tempfile

VIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, VIZ)
import show  # noqa: E402

failures = []


def check(name, condition, detail=""):
    print(("ok   " if condition else "FAIL ") + name + ((" | " + str(detail)) if detail and not condition else ""))
    if not condition:
        failures.append(name)


def load(name):
    with open(os.path.join(VIZ, "examples", name), encoding="utf-8") as handle:
        return json.load(handle)


# Loops: the support example has six loops, five reinforcing and one balancing.
nodes, links, errors = show.loops_model(load("loops-support-backlog.json"))
loops, capped = show.find_loops(nodes, links)
check("loops: 9 elements, 14 links, no errors", (len(nodes), len(links), errors) == (9, 14, []), (len(nodes), len(links), errors))
check("loops: 6 loops", len(loops) == 6, len(loops))
check("loops: 5 reinforcing, 1 balancing", [l["type"] for l in loops].count("R") == 5 and [l["type"] for l in loops].count("B") == 1)
balancing = [l for l in loops if l["type"] == "B"][0]
check("loops: the balancing loop is the hiring loop", {nodes[i] for i in balancing["nodes"]} == {"Backlog", "Response time", "Agents and overtime"})
check("loops: not capped", capped is False)
_, bad_links, bad_errors = show.loops_model({"elements": ["A", "B"], "links": [{"from": "A", "to": "C", "sign": "+"}, {"from": "A", "to": "B", "sign": "?"}]})
check("loops: bad links are reported and dropped", len(bad_links) == 0 and len(bad_errors) == 2, bad_errors)
two = show.loops_model({"elements": ["A", "B"], "links": [{"from": "A", "to": "B", "sign": "+"}, {"from": "B", "to": "A", "sign": "-"}]})
check("loops: one opposite link makes a balancing loop", show.find_loops(two[0], two[1])[0][0]["type"] == "B")

# Matrix: (5*4 + 3*2 + 2*5) / 10 = 3.6, (15 + 15 + 4) / 10 = 3.4, (25 + 9 + 4) / 10 = 3.8.
matrix = load("matrix-erp-vendor.json")
ranked, totals = show.matrix_ranking(matrix)
check("matrix: totals", [round(totals[o], 2) for o in ("Vendor A", "Vendor B", "Vendor C")] == [3.6, 3.4, 3.8], totals)
check("matrix: ranking", ranked == ["Vendor C", "Vendor A", "Vendor B"], ranked)
report = "\n".join(show.report_matrix(matrix))
check("matrix: three first-place changes", report.count("moves to first place") == 3, report)
check("matrix: weight 1 halved gives Vendor B", "'Fit with the shop floor' halved: Vendor B" in report)
check("matrix: weight 2 doubled gives Vendor B", "'Implementation risk' doubled: Vendor B" in report)
check("matrix: weight 3 doubled gives Vendor A", "'Cost over five years' doubled: Vendor A" in report)
knocked = copy.deepcopy(matrix)
knocked["knockouts"] = [{"option": "Vendor C", "reason": "No support in German"}]
check("matrix: a knockout leaves the ranking", show.matrix_ranking(knocked)[0] == ["Vendor A", "Vendor B"])

# Tree: 0.6 * 3.0 + 0.4 * 0.8 = 2.12 and 0.5 * 1.6 + 0.5 * 1.0 = 1.30.
tree = load("tree-exclusive-deal.json")
root = copy.deepcopy(tree["root"])
check("tree: root expected value 2.12", round(show.rollback(root), 2) == 2.12, root.get("ev"))
check("tree: branch values", [round(c["ev"], 2) for c in root["children"]] == [2.12, 1.3])
check("tree: best first choice is Sign", root["children"][root["best"]]["label"] == "Sign")
low = copy.deepcopy(tree["root"])
check("tree: goal min picks 1.30", round(show.rollback(low, "min"), 2) == 1.3)
costly = copy.deepcopy(tree["root"])
costly["children"][0]["cost"] = 0.5
show.rollback(costly)
check("tree: a cost of 0.5 on Sign gives 1.62", round(costly["children"][0]["ev"], 2) == 1.62, costly["children"][0]["ev"])
broken = copy.deepcopy(tree["root"])
broken["children"][0]["children"][1]["p"] = 0.3
try:
    show.rollback(broken)
    check("tree: probabilities that do not add up to 1 are refused", False)
except SystemExit:
    check("tree: probabilities that do not add up to 1 are refused", True)

# Build: pages are written, they contain the data, and nothing is written into the skill folder.
work = tempfile.mkdtemp(prefix="thinking-tools-test-")
try:
    script = os.path.join(VIZ, "show.py")
    for kind, example in (("loops", "loops-support-backlog.json"), ("matrix", "matrix-erp-vendor.json"), ("tree", "tree-exclusive-deal.json")):
        template = os.path.join(VIZ, "templates", show.KINDS[kind][0])
        if not os.path.isfile(template):
            check("build: %s page (template missing)" % kind, False)
            continue
        out = os.path.join(work, kind + ".html")
        run = subprocess.run([sys.executable, script, kind, os.path.join(VIZ, "examples", example), "--out", out], capture_output=True, text=True)
        page = open(out, encoding="utf-8").read() if os.path.isfile(out) else ""
        loads_nothing = 'src="http' not in page and "<link" not in page and "@import" not in page
        check("build: %s page" % kind, run.returncode == 0 and "__DATA__" not in page and "/*__D3__*/" not in page and loads_nothing, run.stderr)
    with open(os.path.join(work, "one.mmd"), "w", encoding="utf-8") as handle:
        handle.write("flowchart LR\n  a[\"A </script> B\"] --> b\n")
    out = os.path.join(work, "mermaid.html")
    run = subprocess.run([sys.executable, script, "mermaid", os.path.join(work, "one.mmd"), "--out", out], capture_output=True, text=True)
    page = open(out, encoding="utf-8").read() if os.path.isfile(out) else ""
    check("build: mermaid page escapes a closing script tag in the data", run.returncode == 0 and "A </script> B" not in page and "A <\\/script> B" in page, run.stderr)
    inside = subprocess.run([sys.executable, script, "loops", os.path.join(VIZ, "examples", "loops-support-backlog.json"), "--out", os.path.join(VIZ, "x.html")], capture_output=True, text=True)
    check("build: refuses to write into the skill folder", inside.returncode != 0 and not os.path.exists(os.path.join(VIZ, "x.html")))
    # The same guard when the skill is installed as a symbolic link and the script is called through the link.
    link = os.path.join(work, "linked-skill")
    os.symlink(os.path.dirname(VIZ), link)
    default_out = os.path.join(VIZ, "loops-loops-support-backlog.html")
    linked = subprocess.run([sys.executable, os.path.join(link, "viz", "show.py"), "loops", os.path.join(VIZ, "examples", "loops-support-backlog.json")], capture_output=True, text=True, cwd=VIZ)
    refused = linked.returncode != 0 and not os.path.exists(default_out)
    if os.path.exists(default_out):
        os.remove(default_out)
    check("build: refuses to write into the skill folder through a symbolic link", refused)
finally:
    shutil.rmtree(work, ignore_errors=True)

node = shutil.which("node")
run_js = os.path.join(VIZ, "tests", "run.js")
if node and os.path.isfile(run_js):
    result = subprocess.run([node, run_js], capture_output=True, text=True)
    print(result.stdout.strip())
    check("javascript libraries (node viz/tests/run.js)", result.returncode == 0, result.stderr.strip()[:300])
else:
    print("skip javascript checks (Node or run.js not found)")

print("\n%d failed" % len(failures) if failures else "\nall checks passed")
sys.exit(1 if failures else 0)
