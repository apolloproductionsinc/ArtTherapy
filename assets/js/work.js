/* Art Supply — work
 * Renders projects from work-data.js.
 *   <ol data-work-list="all" data-filter-bar="…" data-index="…">  tiles + filters + index list
 *   <ol data-work-list="ids:a,b,c">                                just those tiles
 * Filters: all / commercial / documentary / live / experiential / music,
 * deep-linkable as work.html#music. They narrow the tiles and the index.
 *   <section data-stage>   the work page: lands on one project full bleed,
 *                          with a drop-down index (filter + list) on the right
 * Clicking a tile opens the project full bleed across the whole screen (the
 * viewer): still or loop, play to load the video, ← / → through the filtered
 * projects, Esc or × to close.
 * Set window.AT_LINK_OUT = true on hosts that block iframes; the viewer then
 * links to the source instead of embedding the player.
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  var WORK = window.AT_WORK || [];
  var CATS = window.AT_CATEGORIES || [];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function reduced() { return AT.reduceMotion && AT.reduceMotion.matches; }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }
  AT.el = el;

  function catLabel(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label;
    return id;
  }
  AT.findWork = function (id) {
    for (var i = 0; i < WORK.length; i++) if (WORK[i].id === id) return WORK[i];
    return null;
  };

  var currentFilter = "all";
  function inFilter(item) { return currentFilter === "all" || item.categories.indexOf(currentFilter) > -1; }

  /* embeds -------------------------------------------------------- */
  function embedUrl(e) {
    switch (e.type) {
      case "youtube":
        return "https://www.youtube-nocookie.com/embed/" + e.id + "?autoplay=1&rel=0&playsinline=1&modestbranding=1" + (e.start ? "&start=" + e.start : "");
      case "vimeo":
        return "https://player.vimeo.com/video/" + e.id + "?autoplay=1&dnt=1&title=0&byline=0&portrait=0" + (e.hash ? "&h=" + e.hash : "");
      case "tiktok":
        return "https://www.tiktok.com/player/v1/" + e.id + "?autoplay=1&description=0&music_info=0&rel=0";
    }
    return null;
  }

  /* stills -------------------------------------------------------- */
  function placeholder(item) {
    return el("div", { class: "placeholder placeholder--" + (item.tone || "stone") }, [
      el("span", { class: "placeholder__label", text: item.placeholder ? "placeholder — asset pending" : "still pending" })
    ]);
  }
  function poster(item, eager) {
    if (!item.thumb) return placeholder(item);
    var img = el("img", {
      src: item.thumb, alt: "Still from " + item.title,
      loading: eager ? "eager" : "lazy", decoding: "async",
      width: 1280, height: 720, referrerpolicy: "no-referrer", class: "is-loading"
    });
    img.addEventListener("load", function () { img.classList.remove("is-loading"); });
    img.addEventListener("error", function () {
      if (/maxresdefault/.test(img.src)) { img.src = img.src.replace("maxresdefault", "hqdefault"); return; }
      img.replaceWith(placeholder(item));
    });
    return img;
  }

  /* the viewer: one project, full bleed across the whole screen ----- */
  var V = null;
  function buildViewer() {
    var stage = el("div", { class: "viewer__stage" });
    var count = el("span", { class: "viewer__count" });
    var title = el("h2", { class: "viewer__title", id: "viewer-title" });
    var close = el("button", { type: "button", class: "viewer__btn viewer__close", "aria-label": "Close" }, ["close ×"]);
    var center = el("div", { class: "viewer__center" });
    var meta = el("p", { class: "viewer__meta" });
    var prev = el("button", { type: "button", class: "viewer__btn", "aria-label": "Previous project" }, ["← prev"]);
    var next = el("button", { type: "button", class: "viewer__btn", "aria-label": "Next project" }, ["next →"]);
    var root = el("div", { class: "viewer", role: "dialog", "aria-modal": "true", "aria-labelledby": "viewer-title", hidden: "" }, [
      stage,
      el("div", { class: "viewer__shade", "aria-hidden": "true" }),
      el("div", { class: "viewer__top" }, [count, title, close]),
      center,
      el("div", { class: "viewer__bottom" }, [meta, el("div", { class: "viewer__nav" }, [prev, next])])
    ]);
    document.body.appendChild(root);
    close.addEventListener("click", closeViewer);
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    // Esc also works when focus has wandered outside the viewer's own controls
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && V && !V.root.hidden && !V.root.contains(e.target)) closeViewer();
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeViewer(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
      if (e.key === "Tab") { // keep focus inside the viewer
        var f = $$("button, a[href], iframe", root).filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    V = { root: root, stage: stage, count: count, title: title, close: close, center: center, meta: meta, seq: [], pos: 0, lastFocus: null };
  }

  function renderViewer() {
    var item = V.seq[V.pos];
    V.root.classList.remove("is-playing");
    V.stage.textContent = "";
    V.center.textContent = "";
    if (item.thumb) {
      var img = el("img", { src: item.thumb, alt: "Still from " + item.title, decoding: "async", referrerpolicy: "no-referrer" });
      V.stage.appendChild(img);
      if (item.loop && !reduced()) {
        var v = el("video", { muted: "", loop: "", playsinline: "", autoplay: "", "aria-hidden": "true" });
        v.muted = true; v.src = item.loop; v.poster = item.thumb;
        V.stage.appendChild(v);
      }
    } else {
      V.stage.appendChild(placeholder(item));
    }
    V.count.textContent = pad(V.pos + 1) + " / " + pad(V.seq.length);
    V.title.textContent = item.title;
    V.meta.textContent = [item.kicker, item.categories.map(catLabel).join(" · ")].filter(Boolean).join("  —  ");
    if (item.source) {
      V.meta.appendChild(document.createTextNode("  —  "));
      V.meta.appendChild(el("a", { href: item.source.url, target: "_blank", rel: "noopener", class: "ul-link" },
        [item.source.name + (item.source.by ? " — " + item.source.by : "") + " ↗"]));
    }
    if (item.embed && !window.AT_LINK_OUT) {
      var playBtn = el("button", { type: "button", class: "viewer__play", "aria-label": "Play " + item.title }, [
        el("span", { class: "viewer__play-icon", "aria-hidden": "true" }), "play"
      ]);
      playBtn.addEventListener("click", function () {
        var iframe = el("iframe", {
          src: embedUrl(item.embed), title: item.title + " — video player",
          allow: "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write",
          allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin"
        });
        V.stage.textContent = "";
        V.stage.appendChild(iframe);
        V.center.textContent = "";
        V.root.classList.add("is-playing");
        // keep focus on our controls so Esc / arrows still work; Tab reaches the player
        V.close.focus({ preventScroll: true });
      });
      V.center.appendChild(playBtn);
    } else if (item.source) {
      V.center.appendChild(el("a", { class: "viewer__play viewer__play--out", href: item.source.url, target: "_blank", rel: "noopener" },
        ["watch on " + item.source.name + " ↗"]));
    }
  }

  function markCurrent(id) {
    $$(".idx").forEach(function (b) { b.classList.toggle("is-current", b.getAttribute("data-id") === id); });
  }
  function openViewer(item) {
    if (!V) buildViewer();
    V.seq = WORK.filter(inFilter);
    if (V.seq.indexOf(item) < 0) V.seq = WORK.slice();
    V.pos = V.seq.indexOf(item);
    V.lastFocus = document.activeElement;
    renderViewer();
    V.root.hidden = false;
    document.documentElement.classList.add("viewer-open");
    requestAnimationFrame(function () { V.root.classList.add("is-open"); });
    V.close.focus({ preventScroll: true });
    markCurrent(item.id);
  }
  function step(dir) {
    if (!V || V.seq.length < 2) return;
    V.pos = (V.pos + dir + V.seq.length) % V.seq.length;
    renderViewer();
    markCurrent(V.seq[V.pos].id);
  }
  function closeViewer() {
    if (!V || V.root.hidden) return;
    V.root.classList.remove("is-open", "is-playing");
    V.stage.textContent = ""; // stops any playing video
    var done = function () { V.root.hidden = true; };
    if (reduced()) done(); else setTimeout(done, 300);
    document.documentElement.classList.remove("viewer-open");
    if (V.lastFocus && V.lastFocus.focus) V.lastFocus.focus({ preventScroll: true });
  }
  AT.openWork = openViewer;

  /* tiles ---------------------------------------------------------- */
  /* motion preview: a short silent loop (item.loop) over the still.
     Hover / keyboard focus plays it on pointer devices; on touch screens
     it plays while the tile is mostly on screen. Off with reduced motion. */
  var touchIO = null;
  function addLoop(li, facade, item) {
    if (reduced()) return;
    var v = el("video", { class: "work-item__loop", muted: "", loop: "", playsinline: "", preload: "none", "aria-hidden": "true" });
    v.muted = true;
    v.src = item.loop;
    if (item.thumb) v.poster = item.thumb;
    facade.appendChild(v);
    var start = function () { var p = v.play(); li.classList.add("is-looping"); if (p && p.catch) p.catch(function () {}); };
    var stop = function () { v.pause(); li.classList.remove("is-looping"); };
    if (window.matchMedia("(hover: hover)").matches) {
      li.addEventListener("mouseenter", start);
      li.addEventListener("mouseleave", stop);
      li.addEventListener("focusin", start);
      li.addEventListener("focusout", stop);
    } else if ("IntersectionObserver" in window) {
      if (!touchIO) touchIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { var f = e.target._loop; if (f) (e.intersectionRatio > 0.6 ? f.start : f.stop)(); });
      }, { threshold: [0, 0.6, 1] });
      li._loop = { start: start, stop: stop };
      touchIO.observe(li);
    }
  }

  function buildItem(item, eager) {
    var li = el("li", {
      class: "work-item reveal", id: "work-" + item.id,
      "data-id": item.id, "data-categories": item.categories.join(" ")
    });
    var media = el("div", { class: "work-item__media" });
    var facade = el("button", { type: "button", class: "work-item__play", "aria-label": "Open " + item.title }, [
      poster(item, eager),
      el("span", { class: "play-chip", "aria-hidden": "true" }, ["view"])
    ]);
    if (!item.thumb) facade.classList.add("is-poster-missing");
    facade.addEventListener("click", function () { openViewer(item); });
    media.appendChild(facade);
    if (item.loop) addLoop(li, facade, item);

    var meta = el("p", { class: "work-item__meta" }, [
      el("span", { class: "work-item__tags", text: item.categories.map(catLabel).join(" · ") }),
      item.source
        ? el("a", { class: "work-item__source ul-link", href: item.source.url, target: "_blank", rel: "noopener" },
            [item.source.name + (item.source.by ? " — " + item.source.by : "") + " ↗"])
        : el("span", { class: "tag-placeholder", text: item.tempStill ? "temp still — video pending" : "placeholder" }),
      item.tempStill && item.source ? el("span", { class: "tag-placeholder", text: "temp still" }) : null
    ]);

    li.appendChild(media);
    li.appendChild(el("div", { class: "work-item__caption" }, [
      el("span", { class: "work-item__num", "aria-hidden": "true" }),
      el("p", { class: "work-item__kicker", text: item.kicker || "" }),
      el("h3", { class: "work-item__title", text: item.title }),
      meta
    ]));
    return li;
  }

  /* index list along the right ------------------------------------- */
  function buildIndex(list, items, onPick) {
    items.forEach(function (item) {
      var btn = el("button", { type: "button", class: "idx", "data-id": item.id }, [
        el("span", { class: "idx__num", "aria-hidden": "true" }),
        el("span", { class: "idx__title", text: item.title }),
        el("span", { class: "idx__kicker", text: item.kicker || "" })
      ]);
      btn.addEventListener("click", function () { (onPick || openViewer)(item); });
      var hot = function (on) { var t = document.getElementById("work-" + item.id); if (t) t.classList.toggle("is-hot", on); };
      btn.addEventListener("mouseenter", function () { hot(true); });
      btn.addEventListener("mouseleave", function () { hot(false); });
      list.appendChild(el("li", { class: "idx-row", "data-categories": item.categories.join(" ") }, [btn]));
    });
  }

  /* numbering for whatever is visible */
  function number(rows, sel, withTotal) {
    rows.forEach(function (row, i) {
      var num = $(sel, row);
      if (!num) return;
      num.textContent = pad(i + 1);
      if (withTotal) {
        num.appendChild(document.createTextNode(" "));
        num.appendChild(el("span", { class: "slash", text: "/" }));
        num.appendChild(document.createTextNode(" " + pad(rows.length)));
      }
    });
  }

  /* filters -------------------------------------------------------- */
  function setupFilters(list, bar, status, index) {
    var all = [{ id: "all", label: "all" }].concat(CATS);
    var count = function (id) { return id === "all" ? WORK.length : WORK.filter(function (w) { return w.categories.indexOf(id) > -1; }).length; };

    all.forEach(function (c, i) {
      if (i > 0) bar.appendChild(el("span", { class: "subnav__sep slash", "aria-hidden": "true", text: "/" }));
      var b = el("button", { type: "button", class: "filter", "data-filter": c.id, "aria-pressed": "false" },
        [c.label, el("sup", { text: String(count(c.id)) })]);
      b.addEventListener("click", function () { set(c.id, true); });
      bar.appendChild(b);
    });

    function show(rows, id) {
      var visible = [];
      rows.forEach(function (row) {
        var on = id === "all" || row.getAttribute("data-categories").split(" ").indexOf(id) > -1;
        row.hidden = !on;
        if (on) visible.push(row);
      });
      return visible;
    }
    function apply(id) {
      currentFilter = id;
      var tiles = show($$(".work-item", list), id);
      number(tiles, ".work-item__num", true);
      if (index) number(show($$(".idx-row", index), id), ".idx__num", false);
      $$(".filter", bar).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === id ? "true" : "false"); });
      if (status) status.textContent = "Showing " + tiles.length + " project" + (tiles.length === 1 ? "" : "s") + (id === "all" ? "" : " in " + catLabel(id)) + ".";
      if (AT.observeReveals) AT.observeReveals();
    }
    function set(id, fromClick) {
      if (id !== "all" && !CATS.some(function (c) { return c.id === id; })) id = "all";
      if (fromClick) {
        try { history.replaceState(null, "", id === "all" ? location.pathname + location.search : "#" + id); } catch (e) {}
      }
      if (id === currentFilter) return;
      var top = list.getBoundingClientRect().top;
      var finish = function () {
        apply(id);
        if (top < 0) list.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      };
      if (reduced()) { finish(); return; }
      list.classList.add("is-filtering");
      if (index) index.classList.add("is-filtering");
      setTimeout(function () {
        finish();
        requestAnimationFrame(function () { list.classList.remove("is-filtering"); if (index) index.classList.remove("is-filtering"); });
      }, 240);
    }

    var fromHash = function () { var h = location.hash.replace("#", ""); return CATS.some(function (c) { return c.id === h; }) ? h : "all"; };
    apply(fromHash());
    window.addEventListener("hashchange", function () { set(fromHash(), false); });
  }

  /* work page: full-bleed stage + drop-down index -------------------
     The page lands on one project full bleed. "index" on the right drops
     down a panel with the category filter and the project list; picking a
     project swaps the work in place. ← / → (buttons or keys) step through
     the filtered projects; play loads the video; Esc closes the panel. */
  function setupStage(root) {
    var media = $(".stage__media", root), center = $(".stage__center", root);
    var countEl = $(".stage__count", root), titleEl = $(".stage__title", root), metaEl = $(".stage__meta", root);
    var toggle = $(".stage__toggle", root);
    var toggleCount = $(".stage__toggle-count", root);
    var bar = $(".work-index__filters", root), list = $(".work-index__list", root);
    var narrow = window.matchMedia("(max-width: 720px)");
    var seq = WORK.slice(), pos = 0;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      root.classList.toggle("is-panel-open", open);
    }
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });

    function frameFor(item) {
      var frame = el("div", { class: "stage__frame" });
      if (item.thumb) {
        frame.appendChild(el("img", { src: item.thumb, alt: "Still from " + item.title, decoding: "async", referrerpolicy: "no-referrer" }));
        if (item.loop && !reduced()) {
          var v = el("video", { muted: "", loop: "", playsinline: "", autoplay: "", "aria-hidden": "true" });
          v.muted = true; v.src = item.loop; v.poster = item.thumb;
          frame.appendChild(v);
        }
      } else {
        frame.appendChild(placeholder(item));
      }
      return frame;
    }
    function clearOld(nodes) { nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); }

    function show(item) {
      pos = Math.max(0, seq.indexOf(item));
      root.classList.remove("is-playing");
      var old = $$(".stage__frame, iframe", media);
      var frame = frameFor(item);
      media.appendChild(frame);
      var fadeIn = function () { frame.classList.add("is-in"); };
      if (reduced()) { fadeIn(); clearOld(old); }
      else {
        requestAnimationFrame(function () { requestAnimationFrame(fadeIn); });
        setTimeout(function () { clearOld(old); }, 700);
      }
      countEl.textContent = pad(pos + 1) + " / " + pad(seq.length);
      titleEl.textContent = item.title;
      metaEl.textContent = [item.kicker, item.categories.map(catLabel).join(" · ")].filter(Boolean).join("  —  ");
      if (item.source) {
        metaEl.appendChild(document.createTextNode("  —  "));
        metaEl.appendChild(el("a", { href: item.source.url, target: "_blank", rel: "noopener", class: "ul-link" },
          [item.source.name + (item.source.by ? " — " + item.source.by : "") + " ↗"]));
      }
      center.textContent = "";
      if (item.embed && !window.AT_LINK_OUT) {
        var playBtn = el("button", { type: "button", class: "viewer__play", "aria-label": "Play " + item.title }, [
          el("span", { class: "viewer__play-icon", "aria-hidden": "true" }), "play"
        ]);
        playBtn.addEventListener("click", function () {
          var iframe = el("iframe", {
            src: embedUrl(item.embed), title: item.title + " — video player",
            allow: "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write",
            allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin"
          });
          media.textContent = "";
          media.appendChild(iframe);
          center.textContent = "";
          root.classList.add("is-playing");
          $("[data-stage-next]", root).focus({ preventScroll: true });
        });
        center.appendChild(playBtn);
      } else if (item.source) {
        center.appendChild(el("a", { class: "viewer__play viewer__play--out", href: item.source.url, target: "_blank", rel: "noopener" },
          ["watch on " + item.source.name + " ↗"]));
      }
      markCurrent(item.id);
      var nextItem = seq[(pos + 1) % seq.length];
      if (nextItem && nextItem.thumb) { var im = new Image(); im.referrerPolicy = "no-referrer"; im.src = nextItem.thumb; }
    }
    function step(dir) { if (seq.length > 1) show(seq[(pos + dir + seq.length) % seq.length]); }
    $("[data-stage-prev]", root).addEventListener("click", function () { step(-1); });
    $("[data-stage-next]", root).addEventListener("click", function () { step(1); });

    buildIndex(list, WORK, function (item) {
      show(item);
      if (narrow.matches) setOpen(false);
    });
    if (AT.redSlashes) AT.redSlashes(list);

    var all = [{ id: "all", label: "all" }].concat(CATS);
    var count = function (id) { return id === "all" ? WORK.length : WORK.filter(function (w) { return w.categories.indexOf(id) > -1; }).length; };
    all.forEach(function (c, i) {
      if (i > 0) bar.appendChild(el("span", { class: "subnav__sep slash", "aria-hidden": "true", text: "/" }));
      var b = el("button", { type: "button", class: "filter", "data-filter": c.id, "aria-pressed": "false" },
        [c.label, el("sup", { text: String(count(c.id)) })]);
      b.addEventListener("click", function () { applyFilter(c.id, true); });
      bar.appendChild(b);
    });

    function applyFilter(id, fromClick) {
      if (id !== "all" && !CATS.some(function (c) { return c.id === id; })) id = "all";
      currentFilter = id;
      var rows = $$(".idx-row", list).filter(function (row) {
        var on = id === "all" || row.getAttribute("data-categories").split(" ").indexOf(id) > -1;
        row.hidden = !on;
        return on;
      });
      number(rows, ".idx__num", false);
      $$(".filter", bar).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === id ? "true" : "false"); });
      toggleCount.textContent = id === "all" ? "" : catLabel(id);
      var current = seq[pos];
      seq = WORK.filter(inFilter);
      show(seq.indexOf(current) > -1 ? current : seq[0]);
      if (fromClick) {
        try { history.replaceState(null, "", id === "all" ? location.pathname + location.search : "#" + id); } catch (e) {}
      }
    }

    document.addEventListener("keydown", function (e) {
      if (V && !V.root.hidden) return; // the pop-out viewer handles its own keys
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Escape" && root.classList.contains("is-panel-open")) { setOpen(false); toggle.focus(); }
    });

    var fromHash = function () { var h = location.hash.replace("#", ""); return CATS.some(function (c) { return c.id === h; }) ? h : "all"; };
    applyFilter(fromHash(), false);
    if (fromHash() !== "all") setOpen(true);
    window.addEventListener("hashchange", function () { applyFilter(fromHash(), false); });
  }

  /* init ---------------------------------------------------------- */
  function init() {
    $$("[data-stage]").forEach(setupStage);
    $$("[data-work-list]").forEach(function (list) {
      var spec = list.getAttribute("data-work-list");
      var items = spec.indexOf("ids:") === 0
        ? spec.slice(4).split(",").map(function (id) { return AT.findWork(id.trim()); }).filter(Boolean)
        : WORK;
      items.forEach(function (item, i) { list.appendChild(buildItem(item, i === 0)); });
      var index = document.getElementById(list.getAttribute("data-index") || "");
      if (index) buildIndex(index, items);
      if (AT.redSlashes) { AT.redSlashes(list); if (index) AT.redSlashes(index); }
      var bar = document.getElementById(list.getAttribute("data-filter-bar") || "");
      if (bar) setupFilters(list, bar, document.getElementById("work-status"), index);
      else number($$(".work-item", list), ".work-item__num", true);
    });
    if (AT.observeReveals) AT.observeReveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
