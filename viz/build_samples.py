#!/usr/bin/env python3
"""Build the sample pages in docs/samples from viz/examples.

For maintainers: run it after a change to a template, so that the samples on
the project site show the current pages. It writes only into docs/samples.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import show  # noqa: E402

SAMPLES = [
    ("loops", "loops-support-backlog.json", "loop-map.html"),
    ("matrix", "matrix-erp-vendor.json", "decision-matrix.html"),
    ("tree", "tree-exclusive-deal.json", "decision-tree.html"),
    ("hierarchy", "hierarchy-issue-tree.json", "issue-tree.html"),
    ("fishbone", "fishbone-bus-test.json", "fishbone.html"),
    ("map", "map-wardley-heat-pump.json", "wardley-map.html"),
    ("map", "map-impact-effort.json", "impact-effort.html"),
]


def main():
    target = os.path.join(show.SKILL, "docs", "samples")
    os.makedirs(target, exist_ok=True)
    for kind, example, name in SAMPLES:
        template, libs, report = show.KINDS[kind]
        with open(os.path.join(HERE, "examples", example), encoding="utf-8") as handle:
            data = json.load(handle)
        report(data)
        with open(os.path.join(target, name), "w", encoding="utf-8") as handle:
            handle.write(show.build(template, data, libs))
        print("docs/samples/" + name)


if __name__ == "__main__":
    main()
