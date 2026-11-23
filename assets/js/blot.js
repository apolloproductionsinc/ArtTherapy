/* art / therapy — Rorschach inkblot
 * A mirrored, "gooey" SVG blot (carried over from the first design).
 * It renders a still frame immediately; call .start() to set it moving.
 * Motion eases in from zero so the still frame never jumps, pauses when
 * the blot is off screen, and is skipped entirely under reduced motion.
 *
 *   var blot = AT.makeBlot(svgElement, { seed: 7, count: 24, h: 700 });
 *   blot.start();
 */
(function () {
  "use strict";
  var AT = window.AT = window.AT || {};
  var NS = "http://www.w3.org/2000/svg";

  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }

  AT.makeBlot = function (svg, opts) {
    opts = opts || {};
    var W = 1000, H = opts.h || 700, cx = W / 2;
    var rand = rng(opts.seed || 7);
    var uid = "blot" + Math.floor(rand() * 1e6);
    var RAMP = 1.6; // seconds for motion to ease in

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML =
      '<defs><filter id="' + uid + '-goo" filterUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="' + (opts.blur || 16) + '" result="b"/>' +
      // softer alpha threshold than a hard "goo" so the edges feather slightly
      '<feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"/></filter>' +
      // tonal fill: deeper stone at the spine, paling toward the edges
      '<radialGradient id="' + uid + '-fill" gradientUnits="userSpaceOnUse" cx="' + cx + '" cy="' + (H * 0.52) + '" r="' + (W * 0.5) + '">' +
      '<stop offset="0" style="stop-color:var(--blot-deep,#c9c4bc)"/>' +
      '<stop offset="0.42" style="stop-color:var(--blot-mid,#dedad4)"/>' +
      '<stop offset="1" style="stop-color:var(--blot-pale,#f4f2ef)"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<g filter="url(#' + uid + '-goo)" fill="url(#' + uid + '-fill)">' +
      '<g id="' + uid + '-half"></g>' +
      '<use href="#' + uid + '-half" transform="matrix(-1 0 0 1 ' + W + ' 0)"/>' +
      '</g>';
    var half = svg.querySelector("#" + uid + "-half");

    var blobs = [], n = opts.count || 22;
    for (var i = 0; i < n; i++) {
      var big = i < n * 0.55;
      blobs.push({
        x: cx - (big ? 10 + rand() * 230 : 60 + rand() * 360),
        y: H * 0.2 + rand() * H * 0.6,
        r: big ? 34 + rand() * 56 : 6 + rand() * 22,
        ax: 10 + rand() * 40, ay: 10 + rand() * 40,
        sx: 0.2 + rand() * 0.5, sy: 0.2 + rand() * 0.5,
        p: rand() * Math.PI * 2, t: i / n
      });
    }
    // a central spine so the two halves always join
    for (var k = 0; k < 5; k++) blobs.push({ x: cx - 6, y: H * (0.18 + k * 0.16), r: 34 + rand() * 30, ax: 4, ay: 18, sx: 0.3, sy: 0.25, p: rand() * 6, t: 0 });

    var circles = blobs.map(function (b) {
      var c = document.createElementNS(NS, "circle");
      half.appendChild(c);
      return c;
    });

    var px = 0, py = 0, tpx = 0, tpy = 0;
    // amp 0 = the still frame; amp 1 = full motion
    function frame(s, amp) {
      px += (tpx - px) * 0.05; py += (tpy - py) * 0.05;
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var x = b.x + amp * (Math.sin(s * b.sx + b.p) * b.ax + px * 40 * (1 - b.t));
        var y = b.y + amp * (Math.cos(s * b.sy + b.p) * b.ay + py * 30);
        var r = b.r * (1 - amp * 0.07 * (1 - Math.sin(s * 0.6 + b.p))); // breathes between 86% and 100%
        if (x > cx - 4 + b.r * 0.3) x = cx - 4 + b.r * 0.3; // stay on the left; the mirror does the rest
        circles[i].setAttribute("cx", x.toFixed(1));
        circles[i].setAttribute("cy", y.toFixed(1));
        circles[i].setAttribute("r", r.toFixed(1));
      }
    }
    frame(0, 0);

    var started = false, running = false, raf = 0, t0 = 0, visible = true;
    function loop(now) {
      if (!t0) t0 = now;
      var s = (now - t0) / 1000;
      var e = Math.min(1, s / RAMP);
      var amp = e * e * (3 - 2 * e); // smoothstep
      frame(s, amp);
      if (running) raf = requestAnimationFrame(loop);
    }
    function run() { if (!running && started && visible) { running = true; raf = requestAnimationFrame(loop); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; if (visible) run(); else stop(); });
      }).observe(svg);
    }

    return {
      start: function () {
        if (started || (AT.reduceMotion && AT.reduceMotion.matches)) return;
        started = true;
        window.addEventListener("pointermove", function (e) {
          tpx = (e.clientX / window.innerWidth - 0.5) * -1;
          tpy = (e.clientY / window.innerHeight - 0.5);
        }, { passive: true });
        run();
      }
    };
  };
})();
