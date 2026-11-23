/* art / therapy — interactions
 * - builds the work list + filters from work-data.js
 * - lightweight video facades (iframes load only on click)
 * - hash-based filters (#work-music …) shared by header nav + filter bar
 *   (plain #name hashes so links also survive hosts that strip paths)
 * - restrained scroll reveals, honours prefers-reduced-motion
 */
(function () {
  "use strict";

  var WORK = window.AT_WORK || [];
  var CATS = window.AT_CATEGORIES || [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var listEl = $("#work-list");
  var filtersEl = $("#filters");
  var statusEl = $("#work-status");
  var workSection = $("#work");
  var currentFilter = "all";

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else if (k === "style") node.setAttribute("style", attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  function catLabel(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label;
    return id;
  }

  /* ---------------- embeds ---------------- */
  function embedUrl(e) {
    switch (e.type) {
      case "youtube":
        return "https://www.youtube-nocookie.com/embed/" + e.id +
          "?autoplay=1&rel=0&playsinline=1&modestbranding=1" + (e.start ? "&start=" + e.start : "");
      case "vimeo":
        return "https://player.vimeo.com/video/" + e.id +
          "?autoplay=1&dnt=1&title=0&byline=0&portrait=0" + (e.hash ? "&h=" + e.hash : "");
      case "vimeo-showcase":
        return "https://vimeo.com/showcase/" + e.showcase + "/embed?video=" + e.video + "&autoplay=1";
      case "tiktok":
        return "https://www.tiktok.com/player/v1/" + e.id + "?autoplay=1&description=0&music_info=0&rel=0";
    }
    return null;
  }

  var playing = null; // { media, facade }

  function stopPlaying() {
    if (!playing) return;
    var iframe = $("iframe", playing.media);
    if (iframe) iframe.remove();
    playing.media.appendChild(playing.facade);
    playing = null;
  }

  function play(item, media, facade) {
    var src = embedUrl(item.embed);
    if (!src) return;
    stopPlaying();
    var iframe = el("iframe", {
      src: src,
      title: item.title + " — video player",
      allow: "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write",
      allowfullscreen: "",
      referrerpolicy: "strict-origin-when-cross-origin"
    });
    facade.remove();
    media.appendChild(iframe);
    iframe.focus({ preventScroll: true });
    playing = { media: media, facade: facade };
  }

  /* ---------------- work items ---------------- */
  function poster(item, eager) {
    if (!item.thumb) return el("div", { class: "placeholder placeholder--" + (item.tone || "stone") }, [
      el("span", { class: "placeholder__label", text: item.placeholder ? "placeholder — asset pending" : "still pending" })
    ]);
    var img = el("img", {
      src: item.thumb,
      alt: "Still from " + item.title,
      loading: eager ? "eager" : "lazy",
      decoding: "async",
      width: 1280, height: 720,
      referrerpolicy: "no-referrer",
      class: "is-loading"
    });
    img.addEventListener("load", function () { img.classList.remove("is-loading"); });
    img.addEventListener("error", function () {
      // YouTube: fall back from maxres to hq poster
      if (/maxresdefault/.test(img.src)) { img.src = img.src.replace("maxresdefault", "hqdefault"); return; }
      img.replaceWith(el("div", { class: "placeholder placeholder--stone" }, [el("span", { class: "placeholder__label", text: "still pending" })]));
    });
    return img;
  }

  function buildItem(item, index) {
    var li = el("li", {
      class: "work-item reveal",
      id: "work-" + item.id,
      "data-categories": item.categories.join(" "),
      "data-aspect": item.aspect || "16/9"
    });
    var media = el("div", { class: "work-item__media", style: "--ar:" + (item.aspect || "16/9").replace("/", " / ") });
    var facade;

    // Preview builds on hosts that block iframes (window.AT_LINK_OUT) link out instead.
    if (item.embed && !window.AT_LINK_OUT) {
      facade = el("button", {
        type: "button",
        class: "work-item__play",
        "aria-label": "Play " + item.title + " (" + item.source.name + ")"
      }, [
        poster(item, index === 0),
        el("span", { class: "play-chip", "aria-hidden": "true" }, [
          el("span", { class: "play-chip__icon" }), "play"
        ])
      ]);
      if (!item.thumb) facade.classList.add("is-poster-missing");
      facade.addEventListener("click", function () { play(item, media, facade); });
    } else if (item.source) {
      facade = el("a", {
        class: "work-item__play",
        href: item.source.url,
        target: "_blank",
        rel: "noopener",
        "aria-label": "Watch " + item.title + " on " + item.source.name + " (opens in a new tab)"
      }, [
        poster(item, index === 0),
        el("span", { class: "play-chip", "aria-hidden": "true" }, ["watch on " + item.source.name.toLowerCase() + " ↗"])
      ]);
    } else {
      facade = poster(item, false);
    }
    media.appendChild(facade);

    var meta = el("p", { class: "work-item__meta" }, [
      el("span", { class: "work-item__tags", text: item.categories.map(catLabel).join(" · ") }),
      item.source
        ? el("a", { class: "work-item__source", href: item.source.url, target: "_blank", rel: "noopener" },
            [item.source.name + (item.source.by ? " — " + item.source.by : "") + " ↗"])
        : el("span", { class: "tag-placeholder", text: "placeholder" })
    ]);

    var caption = el("div", { class: "work-item__caption" }, [
      el("span", { class: "work-item__num", "aria-hidden": "true" }),
      el("p", { class: "work-item__kicker", text: item.kicker || "" }),
      el("h3", { class: "work-item__title", text: item.title }),
      meta
    ]);

    li.appendChild(media);
    li.appendChild(caption);
    return li;
  }

  /* ---------------- layout rhythm ----------------
   * Varied widths that read as an editorial sequence top-to-bottom.
   * Recomputed every time the filter changes so the rhythm holds.
   */
  var PATTERN = ["full", "pair-a", "pair-b", "right", "left", "pair-a", "pair-b", "inset"];

  function layout(visible) {
    visible.forEach(function (li, i) {
      var l = PATTERN[i % PATTERN.length];
      var next = visible[i + 1];
      if (l === "pair-a" && !next) l = "inset";
      var aspect = li.getAttribute("data-aspect");
      var rightish = l === "pair-b" || l === "right";
      if (aspect === "9/16") l = rightish ? "portrait-right" : "portrait-left";
      else if (aspect === "1/1") l = rightish ? "square-right" : "square-left";
      li.setAttribute("data-layout", l);
      var num = $(".work-item__num", li);
      if (num) num.textContent = String(i + 1).padStart(2, "0") + " / " + String(visible.length).padStart(2, "0");
    });
  }

  /* ---------------- filters ---------------- */
  function countFor(id) {
    if (id === "all") return WORK.length;
    return WORK.filter(function (w) { return w.categories.indexOf(id) > -1; }).length;
  }

  function buildFilters() {
    var all = [{ id: "all", label: "all work" }].concat(CATS);
    all.forEach(function (c) {
      var b = el("button", {
        type: "button",
        class: "filter" + (c.id === "all" ? " filter--all" : ""),
        "data-filter": c.id,
        "aria-pressed": c.id === currentFilter ? "true" : "false"
      }, [c.label, el("sup", { text: String(countFor(c.id)) })]);
      b.addEventListener("click", function () {
        setFilter(c.id, { updateHash: true, scroll: "if-needed" });
      });
      filtersEl.appendChild(b);
    });
  }

  function applyFilter(id) {
    var items = $$(".work-item", listEl);
    var visible = [];
    items.forEach(function (li) {
      var show = id === "all" || li.getAttribute("data-categories").split(" ").indexOf(id) > -1;
      li.hidden = !show;
      if (show) visible.push(li);
    });
    layout(visible);
    $$(".filter", filtersEl).forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-filter") === id ? "true" : "false");
    });
    $$("[data-filter-link]").forEach(function (a) {
      if (a.getAttribute("data-filter-link") === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    statusEl.textContent = "Showing " + visible.length + " project" + (visible.length === 1 ? "" : "s") +
      (id === "all" ? "" : " in " + catLabel(id)) + ".";
    observeReveals();
  }

  function setFilter(id, opts) {
    opts = opts || {};
    if (id !== "all" && !CATS.some(function (c) { return c.id === id; })) id = "all";
    var changed = id !== currentFilter;
    currentFilter = id;
    stopPlaying();

    if (opts.updateHash) {
      var hash = id === "all" ? "#work" : "#work-" + id;
      if (location.hash !== hash) {
        try { history.pushState(null, "", hash); } catch (e) { /* sandboxed hosts */ }
      }
    }

    var doScroll = function () {
      if (!opts.scroll) return;
      var top = workSection.getBoundingClientRect().top;
      if (opts.scroll === "always" || top < 0) {
        workSection.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      }
    };

    if (!changed) { doScroll(); return; }

    if (reduceMotion.matches || opts.instant) {
      applyFilter(id); doScroll(); return;
    }
    listEl.classList.add("is-filtering");
    window.setTimeout(function () {
      applyFilter(id);
      doScroll();
      requestAnimationFrame(function () { listEl.classList.remove("is-filtering"); });
    }, 320);
  }

  function filterFromHash() {
    var m = /^#work(?:-([a-z-]+))?$/.exec(location.hash);
    if (!m) return null;
    if (!m[1]) return "all";
    return CATS.some(function (c) { return c.id === m[1]; }) ? m[1] : null;
  }

  /* ---------------- reveals ---------------- */
  var io = null;
  function observeReveals() {
    var targets = $$(".reveal:not(.is-visible)");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------------- header + mobile nav ---------------- */
  function initHeader() {
    var header = $(".site-header");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $(".menu-toggle");
    var nav = $("#site-nav");
    var label = $(".menu-toggle__label", toggle);
    var mq = window.matchMedia("(max-width: 960px)");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      label.textContent = open ? "close" : "menu";
      if (open) { var first = $("a", nav); if (first) first.focus(); }
    }
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { if (mq.matches) setOpen(false); });
    });
    mq.addEventListener("change", function () { if (!mq.matches) setOpen(false); });

    // header filter links: #work-<category>
    $$("[data-filter-link]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setFilter(a.getAttribute("data-filter-link"), { updateHash: true, scroll: "always" });
      });
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    WORK.forEach(function (item, i) { listEl.appendChild(buildItem(item, i)); });
    var initial = filterFromHash() || "all";
    currentFilter = initial;
    buildFilters();
    applyFilter(initial);
    if (filterFromHash()) workSection.scrollIntoView({ block: "start" });

    window.addEventListener("popstate", function () {
      var f = filterFromHash();
      if (f) setFilter(f, { scroll: "always" });
    });
    window.addEventListener("hashchange", function () {
      var f = filterFromHash();
      if (f && f !== currentFilter) setFilter(f, { scroll: "always" });
    });

    // stagger hero reveals slightly
    $$(".hero .reveal").forEach(function (n, i) { n.style.setProperty("--d", (0.08 * i) + "s"); });

    initHeader();
    observeReveals();
    var y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
