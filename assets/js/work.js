/* Art Supply — work list
 * Renders projects from work-data.js into any <ol data-work-list>.
 *   data-work-list="all"              every project, with the filter bar
 *   data-work-list="ids:a,b,c"        just those projects (landing feature)
 * Filters: all / commercial / documentary / live / experiential / music,
 * deep-linkable as work.html#music etc.
 * Video posters are click-to-load facades; set window.AT_LINK_OUT = true
 * on hosts that block iframes so posters link to the source instead.
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  var WORK = window.AT_WORK || [];
  var CATS = window.AT_CATEGORIES || [];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

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

  var playing = null;
  function stopPlaying() {
    if (!playing) return;
    var f = $("iframe", playing.media);
    if (f) f.remove();
    playing.media.appendChild(playing.facade);
    playing = null;
  }
  function play(item, media, facade) {
    var src = embedUrl(item.embed);
    if (!src) return;
    stopPlaying();
    var iframe = el("iframe", {
      src: src, title: item.title + " — video player",
      allow: "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write",
      allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin"
    });
    facade.remove();
    media.appendChild(iframe);
    iframe.focus({ preventScroll: true });
    playing = { media: media, facade: facade };
  }

  /* items --------------------------------------------------------- */
  function poster(item, eager) {
    if (!item.thumb) return el("div", { class: "placeholder placeholder--" + (item.tone || "stone") }, [
      el("span", { class: "placeholder__label", text: item.placeholder ? "placeholder — asset pending" : "still pending" })
    ]);
    var img = el("img", {
      src: item.thumb, alt: "Still from " + item.title,
      loading: eager ? "eager" : "lazy", decoding: "async",
      width: 1280, height: 720, referrerpolicy: "no-referrer", class: "is-loading"
    });
    img.addEventListener("load", function () { img.classList.remove("is-loading"); });
    img.addEventListener("error", function () {
      if (/maxresdefault/.test(img.src)) { img.src = img.src.replace("maxresdefault", "hqdefault"); return; }
      img.replaceWith(el("div", { class: "placeholder" }, [el("span", { class: "placeholder__label", text: "still pending" })]));
    });
    return img;
  }

  function buildItem(item, eager) {
    var li = el("li", {
      class: "work-item reveal", id: "work-" + item.id,
      "data-categories": item.categories.join(" "), "data-aspect": item.aspect || "16/9"
    });
    var media = el("div", { class: "work-item__media" });
    var facade;

    if (item.embed && !window.AT_LINK_OUT) {
      facade = el("button", { type: "button", class: "work-item__play", "aria-label": "Play " + item.title + " (" + item.source.name + ")" }, [
        poster(item, eager),
        el("span", { class: "play-chip", "aria-hidden": "true" }, [el("span", { class: "play-chip__icon" }), "play"])
      ]);
      if (!item.thumb) facade.classList.add("is-poster-missing");
      facade.addEventListener("click", function () { play(item, media, facade); });
    } else if (item.source) {
      facade = el("a", {
        class: "work-item__play", href: item.source.url, target: "_blank", rel: "noopener",
        "aria-label": "Watch " + item.title + " on " + item.source.name + " (opens in a new tab)"
      }, [
        poster(item, eager),
        el("span", { class: "play-chip", "aria-hidden": "true" }, ["watch on " + item.source.name + " ↗"])
      ]);
      if (!item.thumb) facade.classList.add("is-poster-missing");
    } else {
      facade = poster(item, false);
    }
    media.appendChild(facade);

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

  /* numbering for the visible tiles (all tiles share one size) */
  function layout(visible) {
    visible.forEach(function (li, i) {
      var num = $(".work-item__num", li);
      if (num) {
        num.textContent = String(i + 1).padStart(2, "0") + " ";
        num.appendChild(el("span", { class: "slash", text: "/" }));
        num.appendChild(document.createTextNode(" " + String(visible.length).padStart(2, "0")));
      }
    });
  }

  /* filters (work page) ------------------------------------------ */
  function setupFilters(list, bar, status) {
    var current = "all";
    var all = [{ id: "all", label: "all" }].concat(CATS);
    var count = function (id) { return id === "all" ? WORK.length : WORK.filter(function (w) { return w.categories.indexOf(id) > -1; }).length; };

    all.forEach(function (c, i) {
      if (i > 0) bar.appendChild(el("span", { class: "subnav__sep slash", "aria-hidden": "true", text: "/" }));
      var b = el("button", { type: "button", class: "filter", "data-filter": c.id, "aria-pressed": "false" },
        [c.label, el("sup", { text: String(count(c.id)) })]);
      b.addEventListener("click", function () { set(c.id, true); });
      bar.appendChild(b);
    });

    function apply(id) {
      var visible = [];
      $$(".work-item", list).forEach(function (li) {
        var show = id === "all" || li.getAttribute("data-categories").split(" ").indexOf(id) > -1;
        li.hidden = !show;
        if (show) visible.push(li);
      });
      layout(visible);
      $$(".filter", bar).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === id ? "true" : "false"); });
      if (status) status.textContent = "Showing " + visible.length + " project" + (visible.length === 1 ? "" : "s") + (id === "all" ? "" : " in " + catLabel(id)) + ".";
      if (AT.observeReveals) AT.observeReveals();
    }

    function set(id, fromClick) {
      if (id !== "all" && !CATS.some(function (c) { return c.id === id; })) id = "all";
      stopPlaying();
      if (fromClick) {
        var hash = id === "all" ? " " : "#" + id;
        try { history.replaceState(null, "", hash === " " ? location.pathname + location.search : hash); } catch (e) {}
      }
      if (id === current) return;
      current = id;
      var top = list.getBoundingClientRect().top;
      var finish = function () {
        apply(id);
        if (top < 0) bar.scrollIntoView({ behavior: AT.reduceMotion.matches ? "auto" : "smooth", block: "start" });
      };
      if (AT.reduceMotion.matches) { finish(); return; }
      list.classList.add("is-filtering");
      setTimeout(function () { finish(); requestAnimationFrame(function () { list.classList.remove("is-filtering"); }); }, 280);
    }

    var fromHash = function () { var h = location.hash.replace("#", ""); return CATS.some(function (c) { return c.id === h; }) ? h : "all"; };
    current = fromHash();
    apply(current);
    window.addEventListener("hashchange", function () { set(fromHash(), false); });
  }

  /* init ---------------------------------------------------------- */
  function init() {
    $$("[data-work-list]").forEach(function (list) {
      var spec = list.getAttribute("data-work-list");
      var items = spec.indexOf("ids:") === 0
        ? spec.slice(4).split(",").map(function (id) { return AT.findWork(id.trim()); }).filter(Boolean)
        : WORK;
      items.forEach(function (item, i) { list.appendChild(buildItem(item, i === 0)); });
      if (AT.redSlashes) AT.redSlashes(list); // any "/" in titles or captions
      var bar = document.getElementById(list.getAttribute("data-filter-bar") || "");
      if (bar) setupFilters(list, bar, document.getElementById("work-status"));
      else layout($$(".work-item", list));
    });
    if (AT.observeReveals) AT.observeReveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
