/* Art Supply Studios — landing page
 * 1. Flip window: the top half of the first screen flips through selected
 *    work (ids in the figure's data-flip attribute, stills from work-data.js).
 *    Auto-advances; pauses on hover, keyboard focus, when off screen or when
 *    the tab is hidden, and has prev / pause / next controls. With reduced
 *    motion it swaps without the 3D flip and does not auto-advance.
 * 2. Capabilities list: hover / focus / tap highlights a capability and
 *    shows its line of copy.
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  var INTERVAL_MS = 3600;   // time each project stays up

  function pad(n) { return String(n).padStart(2, "0"); }

  function flipWindow() {
    var root = document.querySelector("[data-flip]");
    if (!root || !AT.findWork) return;
    var items = root.getAttribute("data-flip").split(",")
      .map(function (id) { return AT.findWork(id.trim()); })
      .filter(function (w) { return w && w.thumb; });
    if (!items.length) return;

    var win = root.querySelector(".flip__window");
    var card = root.querySelector(".flip__card");
    var faceA = root.querySelector(".flip__face--a img");
    var faceB = root.querySelector(".flip__face--b img");
    var countEl = root.querySelector(".flip__count");
    var titleEl = root.querySelector(".flip__title");
    var toggle = root.querySelector("[data-flip-toggle]");
    var reduce = AT.reduceMotion && AT.reduceMotion.matches;

    var i = 0, angle = 0, timer = 0, busy = false;
    var userPaused = reduce, hovered = false, focused = false, visible = true;

    function setImg(img, item, eager) {
      img.loading = eager ? "eager" : "lazy";
      img.referrerPolicy = "no-referrer";
      img.alt = "Still from " + item.title;
      img.src = item.thumb;
    }
    function caption(item) {
      countEl.textContent = pad(i + 1) + " / " + pad(items.length);
      titleEl.textContent = item.title;
      win.setAttribute("aria-label", "See all work. Now showing: " + item.title);
    }
    function preload(n) { var im = new Image(); im.referrerPolicy = "no-referrer"; im.src = items[n].thumb; }

    function go(dir, fromUser) {
      if (busy || items.length < 2) return;
      var next = (i + dir + items.length) % items.length;
      titleEl.setAttribute("aria-live", fromUser ? "polite" : "off");
      if (reduce) {
        setImg(faceA, items[next], true);
        i = next; caption(items[i]); preload((i + 1) % items.length);
        return;
      }
      // the face currently turned away gets the next still, then the card turns
      var hidden = (Math.round(angle / 180) % 2 === 0) ? faceB : faceA;
      busy = true;
      setImg(hidden, items[next], true);
      var turn = function () {
        angle += dir * 180;
        card.style.transform = "rotateX(" + angle + "deg)";
        i = next; caption(items[i]);
        setTimeout(function () { busy = false; preload((i + 1) % items.length); }, 1000);
      };
      if (hidden.decode) hidden.decode().then(turn, turn); else turn();
    }

    function playing() { return !userPaused && !hovered && !focused && visible && !document.hidden; }
    function schedule() {
      clearTimeout(timer);
      if (playing()) timer = setTimeout(function () { go(1, false); schedule(); }, INTERVAL_MS);
    }

    setImg(faceA, items[0], true);
    caption(items[0]);
    if (items[1]) preload(1);

    root.querySelector("[data-flip-next]").addEventListener("click", function () { go(1, true); schedule(); });
    root.querySelector("[data-flip-prev]").addEventListener("click", function () { go(-1, true); schedule(); });
    function syncToggle() {
      toggle.textContent = userPaused ? "play" : "pause";
      toggle.setAttribute("aria-pressed", userPaused ? "true" : "false");
      toggle.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
    }
    toggle.addEventListener("click", function () { userPaused = !userPaused; syncToggle(); schedule(); });
    syncToggle();

    root.addEventListener("mouseenter", function () { hovered = true; schedule(); });
    root.addEventListener("mouseleave", function () { hovered = false; schedule(); });
    root.addEventListener("focusin", function () { focused = true; schedule(); });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) { focused = false; schedule(); } });
    document.addEventListener("visibilitychange", schedule);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }).observe(root);
    }
    schedule();
  }

  function services() {
    var list = document.querySelector(".services__list");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".services__item"));
    var desc = document.querySelector(".services__desc");
    items.forEach(function (btn) {
      var activate = function () {
        items.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        if (desc) desc.textContent = btn.getAttribute("data-desc");
      };
      btn.addEventListener("mouseenter", activate);
      btn.addEventListener("focus", activate);
      btn.addEventListener("click", activate);
    });
    if (items[0]) items[0].setAttribute("aria-pressed", "true");
  }

  function init() { flipWindow(); services(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
