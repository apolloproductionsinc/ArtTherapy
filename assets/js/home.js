/* art / therapy — landing page
 * 1. Intro: "a/t" holds for a second over a still Rorschach blot, then
 *    "art" and "therapy" open outward from the slash, the blot starts
 *    moving, and a down arrow invites the scroll.
 * 2. Capabilities list: hover / focus / tap highlights a capability,
 *    shows its line of copy and swaps the still beside it.
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  var HOLD_MS = 1000;      // how long "a/t" holds before opening
  var OPEN_MS = 1250;      // must match the CSS transition on .mark__grow

  function cameFromSite() {
    if (location.hash === "#statement") return true;
    try {
      var ref = document.referrer ? new URL(document.referrer) : null;
      return !!ref && ref.origin === location.origin && ref.pathname !== location.pathname;
    } catch (e) { return false; }
  }

  // Once the visitor has scrolled past the intro (and stopped scrolling),
  // take the intro out of the page so scrolling up stops at the statement.
  var retired = false;
  function retireIntro(opts) {
    if (retired) return;
    var introEl = document.querySelector(".intro");
    var anchor = document.querySelector("#statement");
    if (!introEl || !anchor) return;
    retired = true;
    var root = document.documentElement, prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    var before = anchor.getBoundingClientRect().top;
    introEl.hidden = true;
    document.body.classList.add("intro-gone");
    document.querySelectorAll(".statement .reveal").forEach(function (n) { n.classList.add("is-visible"); });
    if (opts && opts.toTop) window.scrollTo(0, 0);
    else window.scrollBy(0, anchor.getBoundingClientRect().top - before);
    requestAnimationFrame(function () { root.style.scrollBehavior = prev; });
  }

  function watchIntroExit() {
    var introEl = document.querySelector(".intro");
    var header = document.querySelector(".site-header");
    if (!introEl) return;
    var timer = 0;
    var check = function () {
      if (retired) return;
      var hh = header ? header.offsetHeight : 0;
      // the arrow sits at the foot of the intro; once it has passed under the
      // header (the arrow's own scroll lands ~64px short of the top) retire it
      if (introEl.getBoundingClientRect().bottom <= hh + 100) retireIntro();
    };
    // wait until scrolling settles so a smooth scroll (e.g. the arrow) can finish
    var onScroll = function () {
      clearTimeout(timer);
      timer = setTimeout(check, 140);
      if (retired) window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if ("onscrollend" in window) window.addEventListener("scrollend", check);
  }

  function intro() {
    var body = document.body;
    var mark = document.querySelector(".mark");
    var arrow = document.querySelector(".intro__arrow");
    if (!mark) return;
    var grows = Array.prototype.slice.call(mark.querySelectorAll(".mark__grow"));
    // inkblot: drawn still now, set moving when the words spread apart
    var blotSvg = document.querySelector(".intro__blot svg");
    var blot = blotSvg && AT.makeBlot ? AT.makeBlot(blotSvg, {
      seed: parseInt(blotSvg.getAttribute("data-blot"), 10) || 7,
      count: parseInt(blotSvg.getAttribute("data-count"), 10) || 24
    }) : null;
    var startBlot = function () { if (blot) blot.start(); };

    function finish() {
      body.classList.remove("is-intro");
      grows.forEach(function (g) { g.style.width = "auto"; });
      if (arrow) arrow.classList.add("is-on");
    }

    // Coming back from another page of the site (index.html#statement, or a
    // same-site referrer): skip the intro and open framed on the statement.
    if (cameFromSite()) {
      mark.classList.add("is-open");
      finish();
      retireIntro({ toTop: true });
      return;
    }
    watchIntroExit();

    // Reduced motion, or the visitor has already scrolled: show the end state.
    if (AT.reduceMotion.matches || window.scrollY > 40) {
      mark.classList.add("is-open");
      finish();
      startBlot();
      return;
    }

    var start = function () {
      window.setTimeout(function () {
        mark.classList.add("is-animating");
        // next frame so the width transition has a start value to run from
        requestAnimationFrame(function () {
          grows.forEach(function (g) { g.style.width = g.scrollWidth + "px"; });
          mark.classList.add("is-open");
          startBlot();
        });
        window.setTimeout(function () {
          mark.classList.remove("is-animating");
          finish();
        }, OPEN_MS + 150);
      }, HOLD_MS);
    };
    // wait for the webfont (if any) so the measured widths are right
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start, start);
    else start();

    // let people skip straight past the intro
    window.addEventListener("scroll", function onS() {
      if (window.scrollY > 40) { window.removeEventListener("scroll", onS); mark.classList.add("is-open"); finish(); startBlot(); }
    }, { passive: true });
  }

  function services() {
    var list = document.querySelector(".services__list");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".services__item"));
    var desc = document.querySelector(".services__desc");
    var frame = document.querySelector(".services__img");
    var cap = document.querySelector(".services__cap");
    var imgs = {};

    items.forEach(function (btn) {
      var work = AT.findWork && AT.findWork(btn.getAttribute("data-still"));
      if (work && work.thumb && frame) {
        var img = AT.el("img", { src: work.thumb, alt: "", loading: "lazy", decoding: "async", referrerpolicy: "no-referrer" });
        frame.appendChild(img);
        imgs[btn.id] = { img: img, title: work.title };
      }
      var activate = function () {
        items.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        if (desc) desc.textContent = btn.getAttribute("data-desc");
        Object.keys(imgs).forEach(function (k) { imgs[k].img.classList.toggle("is-active", k === btn.id); });
        if (cap) cap.textContent = imgs[btn.id] ? "still: " + imgs[btn.id].title : "";
      };
      btn.addEventListener("mouseenter", activate);
      btn.addEventListener("focus", activate);
      btn.addEventListener("click", activate);
    });
    if (items[0]) {
      var first = items[0];
      first.setAttribute("aria-pressed", "true");
      if (imgs[first.id]) { imgs[first.id].img.loading = "eager"; imgs[first.id].img.classList.add("is-active"); if (cap) cap.textContent = "still: " + imgs[first.id].title; }
    }
  }

  function init() { intro(); services(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
