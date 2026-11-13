/* Decision matrix and decision tree calculations, with the same rules as show.py.
 * Used by the matrix page, the tree page, and the tests (browser and Node).
 * Bad input does not throw: the functions collect readable messages in `errors`.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ThinkingDecision = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function num(value) {
    if (typeof value === "number") return value;
    return typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  }
  function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }
  function list(value) {
    return Array.isArray(value) ? value : [];
  }
  function quote(text) {
    return "'" + text + "'";
  }
  /* Sum with a correction term for rounding errors (Neumaier). sum() in Python 3.12 and later does the same,
   * so the totals here and in show.py are equal to the last digit. */
  function sum(values) {
    var total = 0;
    var correction = 0;
    values.forEach(function (x) {
      var next = total + x;
      correction += Math.abs(total) >= Math.abs(x) ? total - next + x : x - next + total;
      total = next;
    });
    return correction && isFinite(correction) ? total + correction : total;
  }

  /* A number with a fixed count of decimals, as "%.2f" in Python prints it.
   * An exact half goes to the even digit (3.125 gives "3.12"); toFixed alone gives "3.13". */
  function fixed(value, digits) {
    value = Number(value);
    var size = Math.abs(value);
    var power = Math.pow(10, digits);
    if ((size * Math.pow(2, digits + 1)) % 2 !== 1) return value.toFixed(digits);
    var below = Math.floor(size * power);
    return (value < 0 ? "-" : "") + ((below % 2 ? below + 1 : below) / power).toFixed(digits);
  }

  // ---------------------------------------------------------------- matrix

  /* Accepts { options: ["A"], criteria: [{name, weight, note}], scores: { A: [4, 2] }, knockouts: [{option, reason}] }.
   * An option with unusable scores gets the total NaN. It is reported if it is not a knockout. */
  function matrixModel(data, weights) {
    data = data && typeof data === "object" ? data : {};
    var errors = [];
    var options = list(data.options).map(String);
    var criteria = list(data.criteria);
    var scores = data.scores && typeof data.scores === "object" ? data.scores : {};
    var out = [];
    list(data.knockouts).forEach(function (knockout) {
      var option = String(knockout && knockout.option);
      if (out.indexOf(option) < 0) out.push(option);
    });
    if (!options.length) errors.push("The data has no options");
    if (!criteria.length) errors.push("The data has no criteria");
    var given = weights !== undefined && weights !== null;
    var used = criteria.map(function (criterion, i) {
      var weight = num(given ? weights[i] : criterion && criterion.weight);
      if (isNaN(weight)) errors.push("The weight of " + quote(criterion && criterion.name) + " is not a number");
      return weight;
    });
    var weightSum = sum(used) || 1;
    var totals = {};
    options.forEach(function (option) {
      var row = has(scores, option) ? scores[option] : null;
      var problem = "";
      if (!Array.isArray(row)) problem = "has no scores";
      else if (row.length !== criteria.length) problem = "has " + row.length + " scores for " + criteria.length + " criteria";
      else if (row.some(function (score) { return isNaN(num(score)); })) problem = "has a score that is not a number";
      if (problem) {
        totals[option] = NaN;
        if (out.indexOf(option) < 0) errors.push("Option " + quote(option) + " " + problem);
        return;
      }
      totals[option] = sum(row.map(function (score, i) { return used[i] * num(score); })) / weightSum;
    });
    return { options: options, criteria: criteria, weights: used, sum: weightSum, totals: totals, out: out, errors: errors };
  }

  /* Weighted mean score for each option: { option: total }. The weights default to the weights in the data. */
  function matrixTotals(data, weights) {
    return matrixModel(data, weights).totals;
  }

  /* Returns { ranked, totals, out, errors, weights }. `ranked` has the best option first; equal totals keep the order of the data.
   * Options named in `knockouts` are in `out` and are not ranked. */
  function matrixRanking(data, weights) {
    var model = matrixModel(data, weights);
    var ranked = model.options.filter(function (option) {
      return model.out.indexOf(option) < 0 && !isNaN(model.totals[option]);
    });
    ranked.sort(function (a, b) {
      return model.totals[b] - model.totals[a];
    });
    return { ranked: ranked, totals: model.totals, out: model.out, errors: model.errors, weights: model.weights };
  }

  /* First-place changes when one weight at a time is halved or doubled.
   * Returns [{ index, criterion, change, factor, first, text }]. An empty list means that the first place holds. */
  function matrixStability(data) {
    var start = matrixRanking(data);
    var changes = [];
    if (!start.ranked.length) return changes;
    list(data && data.criteria).forEach(function (criterion, i) {
      [[0.5, "halved"], [2, "doubled"]].forEach(function (step) {
        var weights = start.weights.slice();
        weights[i] *= step[0];
        var other = matrixRanking(data, weights).ranked;
        if (other.length && other[0] !== start.ranked[0]) {
          var name = String(criterion && criterion.name);
          changes.push({
            index: i,
            criterion: name,
            change: step[1],
            factor: step[0],
            first: other[0],
            text: "Weight of " + quote(name) + " " + step[1] + ": " + other[0] + " moves to first place",
          });
        }
      });
    });
    return changes;
  }

  /* The part that each criterion adds to the total of one option: [{ criterion, weight, share, score, part }].
   * The parts add up to the total. Returns an empty list for an option without usable scores. */
  function matrixContributions(data, option, weights) {
    var model = matrixModel(data, weights);
    if (!has(model.totals, option) || isNaN(model.totals[option])) return [];
    return data.scores[option].map(function (score, i) {
      return {
        criterion: String(model.criteria[i] && model.criteria[i].name),
        weight: model.weights[i],
        share: model.weights[i] / model.sum,
        score: num(score),
        part: (model.weights[i] * num(score)) / model.sum,
      };
    });
  }

  // ---------------------------------------------------------------- tree

  function nodeKind(node) {
    var children = list(node.children);
    if (!children.length) return "end";
    if (node.type === "decision" || node.type === "chance") return node.type;
    return children.some(function (child) { return child && has(child, "p"); }) ? "chance" : "decision";
  }

  /* Expected values by rollback. Accepts a node { label, children, p, value, cost, type } and the goal "max" or "min".
   * Returns a copy of the tree: each node has `kind` and `ev`, a decision node has `best`, and the root has `errors`.
   * A node that cannot be calculated has the `ev` NaN. The input is not changed. */
  function rollback(root, goal) {
    var errors = [];
    var highest = goal === undefined || goal === "max";

    function walk(node, path) {
      node = node && typeof node === "object" ? node : {};
      var copy = {};
      Object.keys(node).forEach(function (key) {
        if (key !== "children") copy[key] = node[key];
      });
      var name = quote(has(node, "label") ? node.label : path);
      var cost = node.cost ? num(node.cost) : 0;
      if (isNaN(cost)) errors.push("The cost of " + name + " is not a number");
      copy.kind = nodeKind(node);
      if (copy.kind === "end") {
        copy.ev = has(node, "value") ? num(node.value) - cost : NaN;
        if (!has(node, "value")) errors.push("The end node " + name + " has no value");
        else if (isNaN(num(node.value))) errors.push("The value of the end node " + name + " is not a number");
        return copy;
      }
      copy.children = node.children.map(function (child) {
        return walk(child, path + " > " + (child && has(child, "label") ? child.label : "?"));
      });
      var values = copy.children.map(function (child) { return child.ev; });
      if (copy.kind === "chance") {
        var probabilities = node.children.map(function (child) { return child && has(child, "p") ? num(child.p) : 0; });
        var all = sum(probabilities);
        if (isNaN(all)) {
          errors.push("A probability under " + name + " is not a number");
          copy.ev = NaN;
        } else if (Math.abs(all - 1) > 0.001) {
          errors.push("The probabilities under " + name + " add up to " + all.toFixed(3) + ", not 1");
          copy.ev = NaN;
        } else {
          copy.ev = sum(probabilities.map(function (p, i) { return p * values[i]; })) - cost;
        }
      } else if (values.some(isNaN)) {
        copy.ev = NaN;
      } else {
        var best = 0;
        values.forEach(function (value, i) {
          if (highest ? value > values[best] : value < values[best]) best = i;
        });
        copy.ev = values[best] - cost;
        copy.best = best;
      }
      return copy;
    }

    var result = walk(root, "root");
    result.errors = errors;
    return result;
  }

  /* Break-even probabilities for the first choice. Accepts a tree from `rollback` and the same goal.
   * Gives one entry for each chance node with two outcomes directly under a root decision:
   * { index, label, outcome, p, above, below }. `p` is the probability of the first outcome at which the
   * root choice changes, or null if there is none between 0 and 1. `above` and `below` are the labels of
   * the best first choice on each side of `p`. */
  function breakEven(tree, goal) {
    var highest = goal === undefined || goal === "max";
    var result = [];
    var choices = list(tree && tree.children);
    if (!tree || tree.kind !== "decision") return result;
    choices.forEach(function (child, index) {
      if (child.kind !== "chance" || list(child.children).length !== 2) return;
      var first = child.children[0].ev;
      var second = child.children[1].ev;
      var cost = child.cost ? num(child.cost) : 0;
      var rival = -1;
      choices.forEach(function (other, i) {
        if (i === index) return;
        if (rival < 0 || (highest ? other.ev > choices[rival].ev : other.ev < choices[rival].ev)) rival = i;
      });
      var entry = { index: index, label: child.label, outcome: child.children[0].label, p: null, above: null, below: null };
      result.push(entry);
      if (rival < 0) return;
      var p = (choices[rival].ev + cost - second) / (first - second);
      if (!(p > 0 && p < 1)) return;
      var wins = first > second === highest;
      entry.p = p;
      entry.above = wins ? child.label : choices[rival].label;
      entry.below = wins ? choices[rival].label : child.label;
    });
    return result;
  }

  /* Scales a list of numbers to a sum of 1. A value below 0 or a value that is not a number counts as 0.
   * Returns null if the sum is 0. */
  function normalise(values) {
    var clean = list(values).map(function (value) {
      var n = num(value);
      return n > 0 ? n : 0;
    });
    var all = sum(clean);
    if (!(all > 0)) return null;
    return clean.map(function (value) { return value / all; });
  }

  return {
    matrixTotals: matrixTotals,
    matrixRanking: matrixRanking,
    matrixStability: matrixStability,
    matrixContributions: matrixContributions,
    fixed: fixed,
    nodeKind: nodeKind,
    rollback: rollback,
    breakEven: breakEven,
    normalise: normalise,
  };
});
