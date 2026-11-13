#!/usr/bin/env node
/* Checks the libraries in viz/lib against hand-worked cases. No dependencies.
 * Run: node viz/tests/run.js
 * The exit code is 1 if a check fails.
 */
"use strict";

var fs = require("fs");
var path = require("path");

var VIZ = path.join(__dirname, "..");
var Loops = require(path.join(VIZ, "lib", "loops.js"));
var Decision = require(path.join(VIZ, "lib", "decision.js"));

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(VIZ, "examples", name), "utf8"));
}
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

var passed = 0;
var failed = 0;

/* `actual` is a function, so that a check that throws is counted as a failure. */
function check(name, actual, expected) {
  var got;
  try {
    got = actual();
  } catch (error) {
    got = "threw: " + (error && error.message);
  }
  var ok;
  if (typeof expected === "number" && typeof got === "number") ok = Math.abs(got - expected) < 1e-9;
  else ok = JSON.stringify(got) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
    console.log("ok    " + name);
  } else {
    failed += 1;
    console.log("FAIL  " + name + "\n      expected " + JSON.stringify(expected) + "\n      got      " + JSON.stringify(got));
  }
}

// ---------------------------------------------------------------- loops

var loopData = fixture("loops-support-backlog.json");
var model = Loops.normalise(loopData);
var found = Loops.findLoops(model.nodes, model.links, 200);
function loopsOfType(type) {
  return found.loops.filter(function (loop) { return loop.type === type; });
}

check("loops: 9 elements", function () { return model.nodes.length; }, 9);
check("loops: 14 links", function () { return model.links.length; }, 14);
check("loops: no error in the fixture", function () { return model.errors; }, []);
check("loops: 6 loops", function () { return found.loops.length; }, 6);
check("loops: the list is not cut", function () { return found.capped; }, false);
check("loops: 5 reinforcing", function () { return loopsOfType("R").length; }, 5);
check("loops: 1 balancing", function () { return loopsOfType("B").length; }, 1);
check(
  "loops: the balancing loop is Backlog, Response time, Agents and overtime",
  function () {
    return loopsOfType("B")[0].nodes.map(function (i) { return model.nodes[i].label; });
  },
  ["Backlog", "Response time", "Agents and overtime"]
);
check(
  "loops: a link to an unknown element is reported and dropped",
  function () {
    var bad = Loops.normalise({ elements: ["A", "B"], links: [{ from: "A", to: "C", sign: "+" }] });
    return [bad.links.length, bad.errors.length];
  },
  [0, 1]
);

// ---------------------------------------------------------------- matrix

var matrix = fixture("matrix-erp-vendor.json");
var totals = Decision.matrixTotals(matrix);
var ranking = Decision.matrixRanking(matrix);
var changes = Decision.matrixStability(matrix);

check("matrix: total of Vendor C is 3.80", function () { return totals["Vendor C"]; }, 3.8);
check("matrix: total of Vendor A is 3.60", function () { return totals["Vendor A"]; }, 3.6);
check("matrix: total of Vendor B is 3.40", function () { return totals["Vendor B"]; }, 3.4);
check("matrix: ranking is C, A, B", function () { return ranking.ranked; }, ["Vendor C", "Vendor A", "Vendor B"]);
check("matrix: no knockout and no error in the fixture", function () { return [ranking.out, ranking.errors]; }, [[], []]);
check("matrix: exactly three first-place changes", function () { return changes.length; }, 3);
check(
  "matrix: weight 1 halved gives Vendor B, weight 2 doubled gives Vendor B, weight 3 doubled gives Vendor A",
  function () {
    return changes.map(function (c) { return [c.index + 1, c.change, c.first]; });
  },
  [[1, "halved", "Vendor B"], [2, "doubled", "Vendor B"], [3, "doubled", "Vendor A"]]
);
check(
  "matrix: the text of a change names the criterion",
  function () { return changes[0].text; },
  "Weight of 'Fit with the shop floor' halved: Vendor B moves to first place"
);
check(
  "matrix: weights given as an argument replace the weights in the data",
  function () { return Decision.matrixTotals(matrix, [2.5, 3, 2])["Vendor B"]; },
  26.5 / 7.5
);
check(
  "matrix: only the shares of the weights count",
  function () { return Decision.matrixTotals(matrix, [50, 30, 20])["Vendor C"]; },
  3.8
);
check(
  "matrix: weights that are all 0 give totals of 0",
  function () { return Decision.matrixTotals(matrix, [0, 0, 0])["Vendor C"]; },
  0
);
check(
  "matrix: equal totals keep the order of the data",
  function () { return Decision.matrixRanking(matrix, [0, 0, 0]).ranked; },
  ["Vendor A", "Vendor B", "Vendor C"]
);
check(
  "matrix: a knockout removes an option from the ranking",
  function () {
    var data = clone(matrix);
    data.knockouts = [{ option: "Vendor C", reason: "No support in the plant language" }];
    var result = Decision.matrixRanking(data);
    return [result.ranked, result.out];
  },
  [["Vendor A", "Vendor B"], ["Vendor C"]]
);
check(
  "matrix: the stability check does not rank a knockout (Vendor A is first, 3.60 to 3.40)",
  function () {
    var data = clone(matrix);
    data.knockouts = [{ option: "Vendor C" }];
    return Decision.matrixStability(data).map(function (c) { return [c.index + 1, c.change, c.first]; });
  },
  [[1, "halved", "Vendor B"], [2, "doubled", "Vendor B"], [3, "halved", "Vendor B"]]
);
check(
  "matrix: the contributions of the criteria add up to the total",
  function () {
    return Decision.matrixContributions(matrix, "Vendor C").map(function (part) { return Math.round(part.part * 100) / 100; });
  },
  [2.5, 0.9, 0.4]
);
check(
  "matrix: fixed() prints an exact half as Python does (3.125 gives 3.12, 3.375 gives 3.38)",
  function () {
    return [3.8, 3.125, 3.375, 3.625, -0.125, 2.675, 0].map(function (value) { return Decision.fixed(value, 2); });
  },
  ["3.80", "3.12", "3.38", "3.62", "-0.12", "2.67", "0.00"]
);
check(
  "matrix: a missing score gives an error message and no exception",
  function () {
    var data = clone(matrix);
    data.scores["Vendor A"] = [4, 2];
    var result = Decision.matrixRanking(data);
    return [result.ranked, result.errors];
  },
  [["Vendor C", "Vendor B"], ["Option 'Vendor A' has 2 scores for 3 criteria"]]
);
check(
  "matrix: empty data gives error messages and no exception",
  function () {
    var result = Decision.matrixRanking({});
    return [result.ranked, result.errors.length, Decision.matrixStability({})];
  },
  [[], 2, []]
);

// ---------------------------------------------------------------- tree

var tree = fixture("tree-exclusive-deal.json");
var before = JSON.stringify(tree.root);
var rolled = Decision.rollback(tree.root, tree.goal);

check("tree: Sign is 2.12", function () { return rolled.children[0].ev; }, 2.12);
check("tree: Stay non-exclusive is 1.30", function () { return rolled.children[1].ev; }, 1.3);
check("tree: the root is 2.12", function () { return rolled.ev; }, 2.12);
check("tree: Sign is the best choice", function () { return rolled.children[rolled.best].label; }, "Sign");
check("tree: no error in the fixture", function () { return rolled.errors; }, []);
check(
  "tree: node kinds are decision, chance, end",
  function () { return [rolled.kind, rolled.children[0].kind, rolled.children[0].children[0].kind]; },
  ["decision", "chance", "end"]
);
check("tree: the input is not changed", function () { return JSON.stringify(tree.root); }, before);
check("tree: the goal defaults to max", function () { return Decision.rollback(tree.root).best; }, 0);
check(
  "tree: the goal min picks 1.30",
  function () {
    var low = Decision.rollback(tree.root, "min");
    return [low.ev, low.children[low.best].label];
  },
  [1.3, "Stay non-exclusive"]
);
check(
  "tree: probabilities 0.6 and 0.3 give an error",
  function () {
    var root = clone(tree.root);
    root.children[0].children[1].p = 0.3;
    var result = Decision.rollback(root, "max");
    return [result.errors, isNaN(result.ev), isNaN(result.children[0].ev), result.children[1].ev];
  },
  [["The probabilities under 'Sign' add up to 0.900, not 1"], true, true, 1.3]
);
check(
  "tree: probabilities within 0.001 of 1 are accepted",
  function () {
    var root = clone(tree.root);
    root.children[0].children[1].p = 0.4005;
    return Decision.rollback(root, "max").errors;
  },
  []
);
check(
  "tree: a cost of 0.5 on the Sign node gives 1.62",
  function () {
    var root = clone(tree.root);
    root.children[0].cost = 0.5;
    var result = Decision.rollback(root, "max");
    return [Math.round(result.children[0].ev * 1e6) / 1e6, Math.round(result.ev * 1e6) / 1e6, result.best];
  },
  [1.62, 1.62, 0]
);
check(
  "tree: an end node without a value gives an error message and no exception",
  function () {
    var root = clone(tree.root);
    delete root.children[1].children[0].value;
    return Decision.rollback(root, "max").errors;
  },
  ["The end node 'Steady growth' has no value"]
);
check(
  "tree: a node with an explicit type keeps it",
  function () {
    var root = { type: "decision", children: [{ label: "A", p: 0.5, value: 1 }, { label: "B", p: 0.5, value: 3 }] };
    var result = Decision.rollback(root, "max");
    return [result.kind, result.ev, result.best];
  },
  ["decision", 3, 1]
);
check(
  "tree: break-even for Sign is 0.227, and Stay non-exclusive has none",
  function () {
    return Decision.breakEven(rolled, tree.goal).map(function (entry) {
      return [entry.label, entry.p === null ? null : Math.round(entry.p * 1000) / 1000, entry.above, entry.below];
    });
  },
  [["Sign", 0.227, "Sign", "Stay non-exclusive"], ["Stay non-exclusive", null, null, null]]
);
check(
  "tree: at the break-even probability the two choices have the same expected value",
  function () {
    var p = Decision.breakEven(rolled, tree.goal)[0].p;
    var root = clone(tree.root);
    root.children[0].children[0].p = p;
    root.children[0].children[1].p = 1 - p;
    var result = Decision.rollback(root, "max");
    return result.children[0].ev - result.children[1].ev;
  },
  0
);
check(
  "tree: input that is no tree gives error messages and no exception",
  function () {
    return [Decision.rollback(null).errors, Decision.rollback({ children: ["x"] }).errors.length, Decision.breakEven(null), Decision.matrixStability(null)];
  },
  [["The end node 'root' has no value"], 1, [], []]
);
check("tree: normalise scales to a sum of 1", function () { return Decision.normalise([2, 1, 1]); }, [0.5, 0.25, 0.25]);
check("tree: normalise gives null for a sum of 0", function () { return Decision.normalise([0, 0, -1]); }, null);

console.log("\n" + (passed + failed) + " checks, " + failed + " failed");
process.exit(failed ? 1 : 0);
