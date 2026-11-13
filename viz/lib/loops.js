/* Feedback loops in a signed causal graph.
 * Used by the loop-map page and by the tests (browser and Node).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ThinkingLoops = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var OPPOSITE = { "-": 1, "−": 1, o: 1, opposite: 1, minus: 1, negative: 1 };
  var SAME = { "+": 1, s: 1, same: 1, plus: 1, positive: 1 };

  /* Accepts { elements: ["A", {id, label}], links: [{from, to, sign, delay, note, basis}] }.
   * Returns { nodes, links, errors }. A link with an unknown element or sign is dropped and reported. */
  function normalise(data) {
    var errors = [];
    var nodes = [];
    var index = {};
    (data.elements || []).forEach(function (el) {
      var node = typeof el === "string" ? { id: el, label: el } : { id: String(el.id || el.label), label: String(el.label || el.id) };
      if (index[node.id] !== undefined) {
        errors.push("Element listed twice: " + node.id);
        return;
      }
      index[node.id] = nodes.length;
      nodes.push(node);
    });
    var byLabel = {};
    nodes.forEach(function (n, i) {
      byLabel[n.label] = i;
    });
    function find(ref) {
      if (index[ref] !== undefined) return index[ref];
      if (byLabel[ref] !== undefined) return byLabel[ref];
      return -1;
    }
    var links = [];
    (data.links || []).forEach(function (l, i) {
      var from = find(String(l.from));
      var to = find(String(l.to));
      var raw = String(l.sign === undefined ? "" : l.sign).trim().toLowerCase();
      if (from < 0 || to < 0) {
        errors.push("Link " + (i + 1) + " names an element that is not in the list: " + l.from + " -> " + l.to);
        return;
      }
      if (from === to) {
        errors.push("Link " + (i + 1) + " goes from an element to itself: " + l.from);
        return;
      }
      if (!OPPOSITE[raw] && !SAME[raw]) {
        errors.push("Link " + (i + 1) + " has no valid sign (use \"+\" or \"-\"): " + l.from + " -> " + l.to);
        return;
      }
      links.push({
        from: from,
        to: to,
        sign: OPPOSITE[raw] ? "-" : "+",
        delay: Boolean(l.delay),
        note: l.note ? String(l.note) : "",
        basis: l.basis ? String(l.basis) : "",
      });
    });
    return { nodes: nodes, links: links, errors: errors };
  }

  /* All simple cycles, each found once (it starts at its lowest-numbered node).
   * A loop with an even number of opposite links is reinforcing (R), an odd number is balancing (B).
   * Stops after `cap` loops and sets `capped`. */
  function findLoops(nodes, links, cap) {
    cap = cap || 200;
    var out = nodes.map(function () {
      return [];
    });
    links.forEach(function (l, i) {
      out[l.from].push({ to: l.to, link: i });
    });
    var loops = [];
    var capped = false;

    function walk(start, node, pathNodes, pathLinks, seen) {
      if (capped) return;
      var edges = out[node];
      for (var e = 0; e < edges.length; e++) {
        var next = edges[e].to;
        if (next === start) {
          if (loops.length >= cap) {
            capped = true;
            return;
          }
          loops.push({ nodes: pathNodes.slice(), links: pathLinks.concat(edges[e].link) });
        } else if (next > start && !seen[next]) {
          seen[next] = true;
          pathNodes.push(next);
          pathLinks.push(edges[e].link);
          walk(start, next, pathNodes, pathLinks, seen);
          pathLinks.pop();
          pathNodes.pop();
          seen[next] = false;
          if (capped) return;
        }
      }
    }

    for (var s = 0; s < nodes.length && !capped; s++) {
      var seen = {};
      seen[s] = true;
      walk(s, s, [s], [], seen);
    }

    loops.sort(function (a, b) {
      return a.links.length - b.links.length || a.nodes[0] - b.nodes[0];
    });
    var count = { R: 0, B: 0 };
    loops.forEach(function (loop) {
      loop.opposite = loop.links.filter(function (i) {
        return links[i].sign === "-";
      }).length;
      loop.type = loop.opposite % 2 === 0 ? "R" : "B";
      count[loop.type] += 1;
      loop.name = loop.type + count[loop.type];
      loop.delays = loop.links.filter(function (i) {
        return links[i].delay;
      }).length;
      loop.text = loop.nodes
        .concat(loop.nodes[0])
        .map(function (n) {
          return nodes[n].label;
        })
        .join(" → ");
    });
    return { loops: loops, capped: capped };
  }

  return { normalise: normalise, findLoops: findLoops };
});
