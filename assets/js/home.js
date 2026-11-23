/* art / therapy — landing page
 * 1. Intro: "a/t" holds for a second, then "art" and "therapy" open
 *    outward from the slash, then a down arrow invites the scroll.
 * 2. Capabilities list: hover / focus / tap highlights a capability,
 *    shows its line of copy and swaps the still beside it.
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  var HOLD_MS = 1000;      // how long "a/t" holds before opening
  var OPEN_MS = 1250;      // must match the CSS transition on .mark__grow

  function intro() {
    var body = document.body;
    var mark = document.querySelector(".mark");
    var arrow = document.querySelector(".intro__arrow");
    if (!mark) return;
    var grows = Array.prototype.slice.call(mark.querySelectorAll(".mark__grow"));

    function finish() {
      body.classList.remove("is-intro");
      grows.forEach(function (g) { g.style.width = "auto"; });
      if (arrow) arrow.classList.add("is-on");
    }

    // Reduced motion, or the visitor has already scrolled: show the end state.
    if (AT.reduceMotion.matches || window.scrollY > 40) {
      mark.classList.add("is-open");
      finish();
      return;
    }

    var start = function () {
      window.setTimeout(function () {
        mark.classList.add("is-animating");
        // next frame so the width transition has a start value to run from
        requestAnimationFrame(function () {
          grows.forEach(function (g) { g.style.width = g.scrollWidth + "px"; });
          mark.classList.add("is-open");
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
      if (window.scrollY > 40) { window.removeEventListener("scroll", onS); mark.classList.add("is-open"); finish(); }
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
