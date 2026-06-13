/* ============================================================
   START BUTTON — PRODUCER PACKET TEMPLATE (pptxgenjs)
   ------------------------------------------------------------
   Clean template for the packet deck. Edit THEME to restyle the
   whole packet; each slide type below matches the show's packet:
     cover · timeline · compare · stats · versus · history ·
     clips · closing
   Used by index.html:  PacketTemplate.build(pptxgen, data, meta)
   ============================================================ */
(function (global) {
  "use strict";

  // ── EDIT ME: deck-wide design tokens ──
  // Split-complementary palette from #505ED7
  //   Base   blue-indigo  HSL(234°,63%,58%)
  //   Split1 warm orange  HSL( 24°,63%,56%)  → accent / gold role
  //   Split2 yel-green    HSL( 84°,63%,60%)  → positive / ok role
  var THEME = {
    bg:        "0E101B",   // deep indigo-black background
    panel:     "191B29",   // card / row surface
    panelLine: "282A3E",   // hairline borders
    ink:       "E2E4F3",   // primary text (cool near-white)
    dim:       "7E83A9",   // secondary / muted text
    gold:      "D58048",   // warm orange — accent, eyebrows, stats, chips
    goldLight: "E7B797",   // light orange — callout text
    green:     "A6D959",   // yellow-green — positive / out-now
    red:       "E06060",   // muted red — negative / warning
    blue:      "6E79DE",   // blue-indigo (base hue) — info, borders
    font:      "Arial",
    headFont:  "Cambria",
  };

  var W = 13.33, H = 7.5, M = 0.6;          // 16:9, inches
  var CONTENT_TOP = 1.78;

  function bgFill(slide) { slide.background = { color: THEME.bg }; }

  function header(slide, num, eyebrow, title, subtitle) {
    bgFill(slide);
    if (num) {
      slide.addText(String(num).padStart(2, "0"), {
        x: W - 1.9, y: 0.18, w: 1.3, h: 1.1, align: "right",
        fontFace: THEME.headFont, fontSize: 44, bold: true,
        color: THEME.gold, transparency: 70,
      });
    }
    slide.addText((eyebrow || "").toUpperCase(), {
      x: M, y: 0.32, w: W - 2.4, h: 0.3, fontFace: THEME.font,
      fontSize: 10.5, bold: true, color: THEME.gold, charSpacing: 3,
    });
    slide.addText(title || "", {
      x: M, y: 0.62, w: W - 2.4, h: 0.62, fontFace: THEME.headFont,
      fontSize: 25, bold: true, color: THEME.ink,
    });
    slide.addText(subtitle || "", {
      x: M, y: 1.24, w: W - 2.4, h: 0.36, fontFace: THEME.font,
      fontSize: 12.5, italic: true, color: THEME.dim,
    });
  }

  function bullets(items, opts) {
    return (items || []).map(function (t) {
      return { text: String(t), options: Object.assign({
        bullet: { code: "2022", indent: 10 }, breakLine: true,
      }, opts || {}) };
    });
  }

  function chipRow(slide, chips, y) {
    var x = M;
    (chips || []).slice(0, 6).forEach(function (c) {
      var label = (c.label || "").toUpperCase();
      var w = Math.max(1.6, Math.min(3.8, label.length * 0.098 + 0.5));
      if (x + w > W - M) { x = M; y += 0.48; }
      var col = c.status === "soon" ? THEME.gold : THEME.green;
      slide.addText(label, {
        x: x, y: y, w: w, h: 0.34, align: "center",
        fontFace: THEME.font, fontSize: 8.5, bold: true, color: col,
        fill: { color: THEME.panel }, line: { color: col, width: 0.75 },
        charSpacing: 1.5,
      });
      x += w + 0.18;
    });
  }

  // ── SLIDE: cover ──
  function cover(pptx, data, meta) {
    var s = pptx.addSlide();
    bgFill(s);
    s.addText("START BUTTON", {
      x: M, y: 0.5, w: 8, h: 0.4, fontFace: THEME.font, fontSize: 13,
      bold: true, color: THEME.gold, charSpacing: 6,
    });
    s.addText("PRODUCER PACKET", {
      x: M, y: 2.05, w: 8, h: 0.35, fontFace: THEME.font, fontSize: 11,
      bold: true, color: THEME.dim, charSpacing: 5,
    });
    s.addText(meta.theme || "", {
      x: M, y: 2.45, w: W - 1.2, h: 1.15, fontFace: THEME.headFont,
      fontSize: 48, bold: true, color: THEME.ink,
    });
    s.addText(data.tagline || "", {
      x: M, y: 3.65, w: W - 3, h: 0.5, fontFace: THEME.font,
      fontSize: 15, italic: true, color: THEME.dim,
    });
    chipRow(s, data.chips, 4.7);
    s.addText((meta.dateNice || "") + "   ·   For Production Use", {
      x: M, y: H - 0.75, w: 8, h: 0.3, fontFace: THEME.font,
      fontSize: 10, color: THEME.dim, charSpacing: 2,
    });
  }

  // ── SLIDE: timeline (release calendar / sequence) ──
  function timeline(pptx, d, num) {
    var s = pptx.addSlide();
    header(s, num, d.eyebrow || "Timeline", d.title, d.subtitle);
    var rows = (d.rows || []).slice(0, 9).map(function (r) {
      return [
        { text: r.when || "", options: { color: THEME.gold, bold: true, fontSize: 10.5, align: "left" } },
        { text: r.what || "", options: { color: THEME.ink, bold: true, fontSize: 11.5 } },
        { text: r.detail || "", options: { color: THEME.dim, fontSize: 10 } },
      ];
    });
    s.addTable(rows, {
      x: M, y: CONTENT_TOP, w: W - 2 * M, colW: [1.7, 3.6, 6.83],
      fontFace: THEME.font, fill: { color: THEME.panel }, color: THEME.ink,
      border: [
        { type: "solid", color: THEME.bg, pt: 3 },     // top
        { type: "none" }, { type: "solid", color: THEME.bg, pt: 3 }, { type: "none" },
      ],
      margin: [0.06, 0.1, 0.06, 0.1], valign: "middle",
      rowH: Math.min(0.62, 5.1 / Math.max(rows.length, 1)),
    });
  }

  // ── SLIDE: compare (two cards, big stats) ──
  function compare(pptx, d, num) {
    var s = pptx.addSlide();
    header(s, num, d.eyebrow || "Head to Head", d.title, d.subtitle);
    var cardW = (W - 2 * M - 0.35) / 2, cardH = 4.35;
    var statColors = [THEME.gold, THEME.green];
    (d.cards || []).slice(0, 2).forEach(function (c, i) {
      var x = M + i * (cardW + 0.35), y = CONTENT_TOP;
      s.addShape("roundRect", {
        x: x, y: y, w: cardW, h: cardH, rectRadius: 0.06,
        fill: { color: THEME.panel }, line: { color: THEME.panelLine, width: 0.75 },
      });
      s.addText((c.name || "").toUpperCase(), {
        x: x + 0.3, y: y + 0.22, w: cardW - 0.6, h: 0.35,
        fontFace: THEME.font, fontSize: 14, bold: true, color: THEME.ink, charSpacing: 1.5,
      });
      s.addText(c.meta || "", {
        x: x + 0.3, y: y + 0.58, w: cardW - 0.6, h: 0.28,
        fontFace: THEME.font, fontSize: 9, color: THEME.dim,
      });
      s.addText(c.stat || "", {
        x: x + 0.3, y: y + 0.9, w: cardW - 0.6, h: 0.85,
        fontFace: THEME.headFont, fontSize: 44, bold: true, color: statColors[i],
      });
      s.addText(c.statLabel || "", {
        x: x + 0.3, y: y + 1.75, w: cardW - 0.6, h: 0.28,
        fontFace: THEME.font, fontSize: 9.5, bold: true, color: THEME.dim, charSpacing: 1.5,
      });
      s.addText(bullets(c.facts, { fontSize: 10, color: THEME.ink }), {
        x: x + 0.3, y: y + 2.12, w: cardW - 0.6, h: cardH - 2.35,
        fontFace: THEME.font, valign: "top", lineSpacingMultiple: 1.15,
      });
    });
    if (d.footer) {
      s.addText(d.footer, {
        x: M, y: CONTENT_TOP + cardH + 0.18, w: W - 2 * M, h: 0.45, align: "center",
        fontFace: THEME.font, fontSize: 10.5, italic: true, color: THEME.goldLight,
      });
    }
  }

  // ── SLIDE: stats (big number + key facts + talking points) ──
  function stats(pptx, d, num) {
    var s = pptx.addSlide();
    header(s, num, d.eyebrow || "By the Numbers", d.title, d.subtitle);
    var y = CONTENT_TOP, h = 4.9;
    s.addShape("roundRect", {
      x: M, y: y, w: 3.3, h: h, rectRadius: 0.06,
      fill: { color: THEME.panel }, line: { color: THEME.panelLine, width: 0.75 },
    });
    s.addText(d.meta1 || "", { x: M + 0.28, y: y + 0.25, w: 2.8, h: 0.3, fontFace: THEME.font, fontSize: 10.5, bold: true, color: THEME.ink });
    s.addText(d.meta2 || "", { x: M + 0.28, y: y + 0.55, w: 2.8, h: 0.3, fontFace: THEME.font, fontSize: 9.5, color: THEME.dim });
    s.addText(d.stat || "", { x: M + 0.28, y: y + 1.0, w: 2.8, h: 1.2, fontFace: THEME.headFont, fontSize: 60, bold: true, color: THEME.gold });
    s.addText(d.statLabel || "", { x: M + 0.28, y: y + 2.25, w: 2.8, h: 0.7, fontFace: THEME.font, fontSize: 11, bold: true, color: THEME.dim, charSpacing: 1 });
    (d.badges || []).slice(0, 2).forEach(function (b, i) {
      s.addText(b, {
        x: M + 0.28, y: y + 3.15 + i * 0.55, w: 2.74, h: 0.42, align: "center",
        fontFace: THEME.font, fontSize: 9, bold: true, color: THEME.green,
        fill: { color: THEME.bg }, line: { color: THEME.green, width: 0.75 },
      });
    });
    var colW = (W - M - (M + 3.3 + 0.35) - 0.35) / 2;
    var col1x = M + 3.3 + 0.35, col2x = col1x + colW + 0.35;
    [[col1x, d.factsTitle || "KEY FACTS", d.facts, THEME.gold],
     [col2x, d.talkingTitle || "TALKING POINTS", d.talking, THEME.blue]].forEach(function (col) {
      s.addText(col[1].toUpperCase(), {
        x: col[0], y: y + 0.05, w: colW, h: 0.32,
        fontFace: THEME.font, fontSize: 10.5, bold: true, color: col[3], charSpacing: 2.5,
      });
      s.addText(bullets(col[2], { fontSize: 10.5, color: THEME.ink }), {
        x: col[0], y: y + 0.45, w: colW, h: h - 0.5,
        fontFace: THEME.font, valign: "top", lineSpacingMultiple: 1.25,
      });
    });
  }

  // ── SLIDE: versus (discourse vs reality sentiment map) ──
  function versus(pptx, d, num) {
    var s = pptx.addSlide();
    header(s, num, d.eyebrow || "Sentiment Map", d.title, d.subtitle);
    var rows = [[
      { text: "✗  " + (d.leftLabel || "WHAT THE DISCOURSE SAYS").toUpperCase(),
        options: { bold: true, fontSize: 10.5, color: "E2E4F3", fill: { color: "5E1A1A" }, charSpacing: 1.5 } },
      { text: "✓  " + (d.rightLabel || "WHAT THE GAMES SAY").toUpperCase(),
        options: { bold: true, fontSize: 10.5, color: "E2E4F3", fill: { color: "2E4A14" }, charSpacing: 1.5 } },
    ]];
    (d.rows || []).slice(0, 7).forEach(function (r) {
      rows.push([
        { text: r.claim || "", options: { fontSize: 10.5, color: THEME.dim, fill: { color: THEME.panel } } },
        { text: r.reality || "", options: { fontSize: 10.5, color: THEME.green, fill: { color: THEME.panel } } },
      ]);
    });
    s.addTable(rows, {
      x: M, y: CONTENT_TOP, w: W - 2 * M, colW: [(W - 2 * M) / 2, (W - 2 * M) / 2],
      fontFace: THEME.font,
      border: [{ type: "solid", color: THEME.bg, pt: 3 }, { type: "solid", color: THEME.bg, pt: 3 },
               { type: "solid", color: THEME.bg, pt: 3 }, { type: "solid", color: THEME.bg, pt: 3 }],
      margin: [0.07, 0.12, 0.07, 0.12], valign: "middle",
      rowH: Math.min(0.66, 5.0 / Math.max(rows.length, 1)),
    });
  }

  // ── SLIDE: history (table through the years) ──
  function history(pptx, d, num) {
    var s = pptx.addSlide();
    header(s, num, d.eyebrow || "Through the Years", d.title, d.subtitle);
    function verdictColor(v) {
      v = String(v || "").toLowerCase();
      if (/9\d|10\/10|great|good|classic/.test(v)) return THEME.green;
      if (/poor|bad|fail/.test(v)) return THEME.red;
      return THEME.gold;
    }
    var rows = (d.rows || []).slice(0, 9).map(function (r) {
      return [
        { text: String(r.year || ""), options: { color: THEME.gold, bold: true, fontSize: 10.5 } },
        { text: r.name || "", options: { color: THEME.ink, bold: true, fontSize: 11 } },
        { text: r.maker || "", options: { color: THEME.dim, fontSize: 9.5 } },
        { text: String(r.verdict || ""), options: { color: verdictColor(r.verdict), bold: true, fontSize: 10.5 } },
        { text: r.note || "", options: { color: THEME.dim, fontSize: 9.5 } },
      ];
    });
    s.addTable(rows, {
      x: M, y: CONTENT_TOP, w: W - 2 * M, colW: [1.0, 3.1, 2.2, 1.2, 4.63],
      fontFace: THEME.font, fill: { color: THEME.panel },
      border: [{ type: "solid", color: THEME.bg, pt: 3 }, { type: "none" },
               { type: "solid", color: THEME.bg, pt: 3 }, { type: "none" }],
      margin: [0.05, 0.1, 0.05, 0.1], valign: "middle",
      rowH: Math.min(0.6, 5.1 / Math.max(rows.length, 1)),
    });
  }

  // ── SLIDE: clip sources grid ──
  function clips(pptx, list) {
    var s = pptx.addSlide();
    header(s, null, "Clip Sources", "Where to pull footage for each segment", "Verify availability before air");
    var cardW = (W - 2 * M - 0.35) / 2, cardH = 1.62;
    (list || []).slice(0, 6).forEach(function (c, i) {
      var x = M + (i % 2) * (cardW + 0.35);
      var y = CONTENT_TOP + Math.floor(i / 2) * (cardH + 0.16);
      s.addShape("roundRect", {
        x: x, y: y, w: cardW, h: cardH, rectRadius: 0.05,
        fill: { color: THEME.panel }, line: { color: THEME.panelLine, width: 0.75 },
      });
      s.addText("SEG " + (c.segment || "?"), {
        x: x + 0.22, y: y + 0.16, w: 0.85, h: 0.28, align: "center",
        fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.bg,
        fill: { color: THEME.gold },
      });
      s.addText(c.title || "", {
        x: x + 1.2, y: y + 0.12, w: cardW - 1.42, h: 0.38,
        fontFace: THEME.font, fontSize: 10.5, bold: true, color: THEME.ink,
      });
      s.addText(c.where || "", {
        x: x + 0.22, y: y + 0.56, w: cardW - 0.44, h: 0.34,
        fontFace: THEME.font, fontSize: 8.5, color: THEME.blue,
      });
      s.addText(c.note || "", {
        x: x + 0.22, y: y + 0.94, w: cardW - 0.44, h: 0.6,
        fontFace: THEME.font, fontSize: 8.5, italic: true, color: THEME.dim,
      });
    });
  }

  // ── SLIDE: closing ──
  function closing(pptx, data, meta) {
    var s = pptx.addSlide();
    bgFill(s);
    s.addText("START BUTTON", {
      x: M, y: 1.7, w: 8, h: 0.35, fontFace: THEME.font, fontSize: 12,
      bold: true, color: THEME.gold, charSpacing: 6,
    });
    s.addText(meta.theme || "", {
      x: M, y: 2.1, w: W - 1.2, h: 0.9, fontFace: THEME.headFont,
      fontSize: 36, bold: true, color: THEME.ink,
    });
    s.addText("Producer Packet  ·  " + (meta.dateNice || ""), {
      x: M, y: 3.0, w: 8, h: 0.32, fontFace: THEME.font, fontSize: 11, color: THEME.dim,
    });
    var statW = 2.5;
    (data.closingStats || []).slice(0, 4).forEach(function (st, i) {
      var x = M + i * (statW + 0.3);
      s.addText(String(st.value || ""), {
        x: x, y: 4.0, w: statW, h: 0.75, fontFace: THEME.headFont,
        fontSize: 34, bold: true, color: THEME.gold,
      });
      s.addText(st.label || "", {
        x: x, y: 4.75, w: statW, h: 0.3, fontFace: THEME.font,
        fontSize: 10, color: THEME.dim, charSpacing: 1,
      });
    });
    s.addText("Confidential — For Production Use Only", {
      x: M, y: H - 0.7, w: 8, h: 0.3, fontFace: THEME.font,
      fontSize: 9, color: THEME.dim, charSpacing: 2,
    });
  }

  var BUILDERS = { timeline: timeline, compare: compare, stats: stats, versus: versus, history: history };

  // ── Entry point: data = model JSON, meta = {theme, dateNice} ──
  function build(pptx, data, meta) {
    pptx.defineLayout({ name: "WIDE", width: W, height: H });
    pptx.layout = "WIDE";
    cover(pptx, data, meta);
    (data.slides || []).forEach(function (d, i) {
      var fn = BUILDERS[d.type] || stats;
      fn(pptx, d, i + 1);
    });
    clips(pptx, data.clips);
    closing(pptx, data, meta);
    return pptx;
  }

  global.PacketTemplate = { build: build, THEME: THEME };
})(typeof window !== "undefined" ? window : globalThis);
