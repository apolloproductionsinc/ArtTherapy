/* Art Supply — landing page
 * 1. Flip window: the top of the first screen flips through selected work
 *    (ids in the figure's data-flip attribute, stills from work-data.js).
 *    A project with a `loop` video plays it silently while it is showing.
 *    Auto-advances; pauses on hover, keyboard focus, off screen or when the
 *    tab is hidden; prev / pause / next controls. With reduced motion it
 *    swaps without the 3D flip, shows stills and does not auto-advance.
 * 2. Capabilities wheel: the five capabilities sit around a dial that turns
 *    to bring the chosen one to the top (red pointer). Turns on its own,
 *    pauses on hover / focus / off screen; click a name or use the arrows.
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  var FLIP_MS = 3600;    // time each project stays up
  var WHEEL_MS = 3800;   // time each capability stays up

  function pad(n) { return String(n).padStart(2, "0"); }
  function reduced() { return AT.reduceMotion && AT.reduceMotion.matches; }

  /* small helper: autoplay that pauses for hover, focus, visibility */
  function autoplay(root, step, ms, toggle) {
    var timer = 0, userPaused = reduced(), hovered = false, focused = false, visible = true;
    function playing() { return !userPaused && !hovered && !focused && visible && !document.hidden; }
    function schedule() {
      clearTimeout(timer);
      if (playing()) timer = setTimeout(function () { step(); schedule(); }, ms);
    }
    function sync() {
      if (!toggle) return;
      toggle.textContent = userPaused ? "play" : "pause";
      toggle.setAttribute("aria-pressed", userPaused ? "true" : "false");
      toggle.setAttribute("aria-label", userPaused ? "Play" : "Pause");
    }
    if (toggle) toggle.addEventListener("click", function () { userPaused = !userPaused; sync(); schedule(); });
    root.addEventListener("mouseenter", function () { hovered = true; schedule(); });
    root.addEventListener("mouseleave", function () { hovered = false; schedule(); });
    root.addEventListener("focusin", function () { focused = true; schedule(); });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) { focused = false; schedule(); } });
    document.addEventListener("visibilitychange", schedule);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }, { threshold: 0.2 }).observe(root);
    }
    sync(); schedule();
    return { restart: schedule };
  }

  /* 1. flip window ------------------------------------------------- */
  function flipWindow() {
    var root = document.querySelector("[data-flip]");
    if (!root || !AT.findWork) return;
    var items = root.getAttribute("data-flip").split(",")
      .map(function (id) { return AT.findWork(id.trim()); })
      .filter(function (w) { return w && w.thumb; });
    if (!items.length) return;

    var win = root.querySelector(".flip__window");
    var card = root.querySelector(".flip__card");
    var faces = Array.prototype.map.call(root.querySelectorAll(".flip__face"), function (f) {
      var video = document.createElement("video");
      video.muted = true; video.loop = true; video.playsInline = true;
      video.setAttribute("muted", ""); video.setAttribute("playsinline", ""); video.setAttribute("aria-hidden", "true");
      video.preload = "none"; video.hidden = true;
      f.appendChild(video);
      return { el: f, img: f.querySelector("img"), video: video };
    });
    var countEl = root.querySelector(".flip__count");
    var titleEl = root.querySelector(".flip__title");
    var i = 0, angle = 0, busy = false;

    function fill(face, item, eager) {
      face.img.loading = eager ? "eager" : "lazy";
      face.img.referrerPolicy = "no-referrer";
      face.img.alt = "Still from " + item.title;
      face.img.src = item.thumb;
      if (item.loop && !reduced()) {
        if (face.video.getAttribute("src") !== item.loop) { face.video.src = item.loop; face.video.poster = item.thumb; }
        face.video.hidden = false;
      } else {
        face.video.pause(); face.video.removeAttribute("src"); face.video.hidden = true;
      }
    }
    function show(face) {
      faces.forEach(function (f) { if (f !== face) f.video.pause(); });
      if (!face.video.hidden) { var p = face.video.play(); if (p && p.catch) p.catch(function () {}); }
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
      if (reduced()) {
        fill(faces[0], items[next], true);
        i = next; caption(items[i]); preload((i + 1) % items.length);
        return;
      }
      // the face turned away gets the next project, then the card turns
      var hidden = (Math.round(angle / 180) % 2 === 0) ? faces[1] : faces[0];
      busy = true;
      fill(hidden, items[next], true);
      var turn = function () {
        angle += dir * 180;
        card.style.transform = "rotateX(" + angle + "deg)";
        i = next; caption(items[i]); show(hidden);
        setTimeout(function () { busy = false; preload((i + 1) % items.length); }, 1000);
      };
      if (hidden.img.decode) hidden.img.decode().then(turn, turn); else turn();
    }

    fill(faces[0], items[0], true); show(faces[0]);
    caption(items[0]);
    if (items[1]) preload(1);

    var auto = autoplay(root, function () { go(1, false); }, FLIP_MS, root.querySelector("[data-flip-toggle]"));
    root.querySelector("[data-flip-next]").addEventListener("click", function () { go(1, true); auto.restart(); });
    root.querySelector("[data-flip-prev]").addEventListener("click", function () { go(-1, true); auto.restart(); });
  }

  /* 2. capabilities wheel ------------------------------------------ */
  function capsWheel() {
    var root = document.querySelector("[data-wheel]");
    if (!root) return;
    var ring = root.querySelector(".wheel__ring");
    var items = Array.prototype.slice.call(root.querySelectorAll(".wheel__item"));
    var n = items.length, step = 360 / n;
    var numEl = root.querySelector(".wheel__num");
    var nameEl = root.querySelector(".wheel__name");
    var descEl = root.querySelector(".wheel__desc");
    var k = 0, rot = 0;

    items.forEach(function (btn, idx) { btn.parentNode.style.setProperty("--a", (idx * step) + "deg"); });

    function select(idx, fromUser) {
      idx = (idx + n) % n;
      // turn the shortest way round to bring idx to the top
      var delta = ((idx - k) % n + n) % n;
      if (delta > n / 2) delta -= n;
      rot -= delta * step;
      k = idx;
      ring.style.setProperty("--rot", rot + "deg");
      items.forEach(function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
      numEl.textContent = pad(k + 1) + " / " + pad(n);
      nameEl.textContent = items[k].textContent;
      descEl.setAttribute("aria-live", fromUser ? "polite" : "off");
      descEl.textContent = items[k].getAttribute("data-desc");
    }

    var auto = autoplay(root, function () { select(k + 1, false); }, WHEEL_MS, root.querySelector("[data-wheel-toggle]"));
    items.forEach(function (btn, idx) {
      btn.addEventListener("click", function () { select(idx, true); auto.restart(); });
    });
    root.querySelector("[data-wheel-prev]").addEventListener("click", function () { select(k - 1, true); auto.restart(); });
    root.querySelector("[data-wheel-next]").addEventListener("click", function () { select(k + 1, true); auto.restart(); });
    root.addEventListener("keydown", function (e) {
      if (!e.target.closest || !e.target.closest(".wheel__item")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select(k + 1, true); items[k].focus(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select(k - 1, true); items[k].focus(); }
    });
    select(0, false);
  }

  function init() { flipWindow(); capsWheel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
