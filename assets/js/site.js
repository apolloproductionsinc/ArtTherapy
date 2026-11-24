/* Art Supply Studios — shared behaviour for every page
 * header border on scroll, scroll reveals, live studio clock, footer year
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  AT.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* reveals ------------------------------------------------------- */
  var io = null;
  AT.observeReveals = function () {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".reveal:not(.is-visible)"));
    if (AT.reduceMotion.matches || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    }
    targets.forEach(function (t) { io.observe(t); });
  };

  /* every visible "/" is brand red --------------------------------- */
  AT.redSlashes = function (root) {
    root = root || document.body;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeValue.indexOf("/") === -1) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p || p.closest("script, style, svg, textarea, .slash")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment();
      n.nodeValue.split("/").forEach(function (part, i) {
        if (i > 0) { var s = document.createElement("span"); s.className = "slash"; s.textContent = "/"; frag.appendChild(s); }
        if (part) frag.appendChild(document.createTextNode(part));
      });
      n.parentNode.replaceChild(frag, n);
    });
  };

  /* studio clock: <span data-clock="America/Los_Angeles"> ---------- */
  function tickClocks() {
    document.querySelectorAll("[data-clock]").forEach(function (el) {
      try {
        el.textContent = new Intl.DateTimeFormat("en-US", {
          timeZone: el.getAttribute("data-clock"), hour: "numeric", minute: "2-digit", timeZoneName: "short"
        }).format(new Date());
      } catch (e) { /* unsupported zone: leave fallback text */ }
    });
  }

  function init() {
    var header = document.querySelector(".site-header");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    tickClocks();
    window.setInterval(tickClocks, 20000);
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
    AT.redSlashes();
    AT.observeReveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
