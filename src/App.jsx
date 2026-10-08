import React, { useState, useMemo } from "react";

// ---------- Sewing math (all in centimeters) ----------
// Formulas as provided: aisance/couture allowances are embedded directly
// in the constants below (e.g. (2+2), (2+4), etc).

function computePattern(m) {
  const poitrine = Number(m.poitrine);
  const hanche = Number(m.hanche);
  const maxPH = Math.max(poitrine, hanche);

  const buste = {
    largeur: maxPH / 2 + (2 + 2) + (2 + 2),
    longueur: Number(m.epauleGenou) + 5 + (2 + 4),
  };

  const manche = {
    longueur: Number(m.longueurBras) + (2 + 4),
    largeurEpaule: Number(m.bras) + (2 + 2) + (2 + 2),
    largeurPoignet: Number(m.main) + (2 + 2) + (2 + 2),
  };

  const col = {
    rayon: Number(m.cou) / (2 * Math.PI),
    profondeurFente: (Number(m.tete) - Number(m.cou)) / 2 + 4,
  };

  const triangle = {
    largeur: (Number(m.largeurFenteExtGenou) * 2 - maxPH) / 2,
    hauteur: Number(m.tailleGenou),
  };

  return { buste, manche, col, triangle };
}

function isValidDims(dims) {
  return Object.values(dims).every((v) => Number.isFinite(v) && v > 0);
}

// ---------- Formula explanations (annotated, with substituted values) ----------

function fmtVal(raw) {
  const n = Number(raw);
  return raw !== "" && raw != null && Number.isFinite(n) ? n.toFixed(1) : "…";
}

function buildExplanations(m) {
  const num = (k) => Number(m[k]) || 0;
  const has = (...keys) => keys.every((k) => m[k] !== "" && m[k] != null);

  const poitrine = num("poitrine");
  const hanche = num("hanche");
  const maxPH = Math.max(poitrine, hanche);

  return [
    {
      title: "Buste",
      cutNote: "couper 2",
      formulas: [
        {
          name: "Largeur buste",
          parts: [
            { expr: "MAX(Tour de poitrine, Tour de hanche)/2", note: "plus grand du tour de poitrine ou du tour de hanche" },
            { expr: "(2+2)", note: "marges d'aisance de chaque côté" },
            { expr: "(2+2)", note: "marges d'aisance de chaque côté" },
          ],
          substituted: `MAX(${fmtVal(m.poitrine)}, ${fmtVal(m.hanche)})/2 + 4 + 4`,
          ready: has("poitrine", "hanche"),
          result: maxPH / 2 + 4 + 4,
        },
        {
          name: "Longueur buste",
          parts: [
            { expr: "Hauteur épaule-genou", note: null },
            { expr: "5", note: "bourrelet de ceinture" },
            { expr: "2", note: "marge de couture haut de tunique" },
            { expr: "4", note: "ourlet bas de tunique" },
          ],
          substituted: `${fmtVal(m.epauleGenou)} + 5 + 2 + 4`,
          ready: has("epauleGenou"),
          result: num("epauleGenou") + 5 + 2 + 4,
        },
      ],
    },
    {
      title: "Manches",
      cutNote: "couper 2",
      formulas: [
        {
          name: "Longueur manche",
          parts: [
            { expr: "Longueur bras", note: null },
            { expr: "2", note: "marge de couture haut de bras" },
            { expr: "4", note: "ourlet bas du bras" },
          ],
          substituted: `${fmtVal(m.longueurBras)} + 2 + 4`,
          ready: has("longueurBras"),
          result: num("longueurBras") + 2 + 4,
        },
        {
          name: "Largeur épaule",
          parts: [
            { expr: "Tour de bras", note: null },
            { expr: "(2+2)", note: "marge d'aisance" },
            { expr: "(2+2)", note: "marge de couture" },
          ],
          substituted: `${fmtVal(m.bras)} + 4 + 4`,
          ready: has("bras"),
          result: num("bras") + 4 + 4,
        },
        {
          name: "Largeur poignet",
          parts: [
            { expr: "Tour de main", note: null },
            { expr: "(2+2)", note: "marge d'aisance" },
            { expr: "(2+2)", note: "marge de couture" },
          ],
          substituted: `${fmtVal(m.main)} + 4 + 4`,
          ready: has("main"),
          result: num("main") + 4 + 4,
        },
      ],
    },
    {
      title: "Col",
      cutNote: "couper 1",
      formulas: [
        {
          name: "Rayon cou",
          parts: [
            { expr: "Tour de cou / 2π", note: "rayon d'un cercle dont la circonférence vaut le tour de cou" },
          ],
          substituted: `${fmtVal(m.cou)} / 2π`,
          ready: has("cou"),
          result: num("cou") / (2 * Math.PI),
        },
        {
          name: "Profondeur fente",
          parts: [
            { expr: "(Tour de tête - Tour de cou)/2", note: "écart nécessaire pour que la tête passe par l'encolure" },
            { expr: "4", note: "marge de confort" },
          ],
          substituted: `(${fmtVal(m.tete)} - ${fmtVal(m.cou)})/2 + 4`,
          ready: has("tete", "cou"),
          result: (num("tete") - num("cou")) / 2 + 4,
        },
      ],
    },
    {
      title: "Triangles d'aisance",
      cutNote: "couper 2",
      formulas: [
        {
          name: "Largeur triangle",
          parts: [
            { expr: "[(Largeur fente extérieur genou × 2) - MAX(Tour de poitrine, Tour de hanche)]/2", note: "tissu supplémentaire nécessaire par rapport au buste, réparti sur les deux côtés" },
          ],
          substituted: `[(${fmtVal(m.largeurFenteExtGenou)} × 2) - MAX(${fmtVal(m.poitrine)}, ${fmtVal(m.hanche)})]/2`,
          ready: has("largeurFenteExtGenou", "poitrine", "hanche"),
          result: (num("largeurFenteExtGenou") * 2 - maxPH) / 2,
        },
        {
          name: "Hauteur côté",
          parts: [
            { expr: "Hauteur taille-genou", note: "extension du triangle sur toute la hauteur de la fente" },
          ],
          substituted: `${fmtVal(m.tailleGenou)}`,
          ready: has("tailleGenou"),
          result: num("tailleGenou"),
        },
      ],
    },
  ];
}

function computeBraies(m) {
  const n = (k) => Number(m[k]);
  const largeurHaut = Math.max(n("hanche") / 2, n("cuisse")) + (4 + 4) + (2 + 2);
  return {
    jambe: {
      largeurHaut,
      largeurMiCuisse: largeurHaut,
      largeurCheville: n("pied") + (4 + 4) + (2 + 2),
      hauteurMiCuisse: n("tailleMiCuisse") + 4,
      longueur: n("tailleCheville") + 4 + 4,
    },
    entrejambe: {
      base: n("largeurFenteIntMiCuisse") + (2 + 2),
      hauteurTriangle: n("tailleMiCuisse") - n("tailleHanche"),
      hauteurBande: n("tailleHanche") + 4,
      largeurBande: 5 + (2 + 2),
    },
  };
}

function buildBraiesExplanations(m) {
  const num = (k) => Number(m[k]) || 0;
  const has = (...keys) => keys.every((k) => m[k] !== "" && m[k] != null);
  const largeurHaut = Math.max(num("hanche") / 2, num("cuisse")) + 8 + 4;

  return [
    {
      title: "Jambes",
      cutNote: "couper 2",
      formulas: [
        {
          name: "Largeur au niveau des hanches",
          parts: [
            { expr: "MAX(Tour de hanche/2, Tour de cuisse)", note: "plus grand du demi-tour de hanche ou du tour de cuisse" },
            { expr: "(4+4)", note: "marge d'aisance de chaque côté" },
            { expr: "(2+2)", note: "marge de couture de chaque côté" },
          ],
          substituted: `MAX(${fmtVal(m.hanche)}/2, ${fmtVal(m.cuisse)}) + 8 + 4`,
          ready: has("hanche", "cuisse"),
          result: largeurHaut,
        },
        {
          name: "Largeur au niveau mi-cuisse",
          parts: [{ expr: "Largeur au niveau des hanches", note: null }],
          substituted: `${has("hanche", "cuisse") ? largeurHaut.toFixed(1) : "…"}`,
          ready: has("hanche", "cuisse"),
          result: largeurHaut,
        },
        {
          name: "Largeur au niveau de la cheville",
          parts: [
            { expr: "Tour de pied", note: null },
            { expr: "(4+4)", note: "marge d'aisance de chaque côté" },
            { expr: "(2+2)", note: "marge de couture de chaque côté" },
          ],
          substituted: `${fmtVal(m.pied)} + 8 + 4`,
          ready: has("pied"),
          result: num("pied") + 12,
        },
        {
          name: "Distance haut de la jambe → mi-cuisse",
          parts: [
            { expr: "Hauteur taille-mi-cuisse", note: null },
            { expr: "4", note: "ourlet haut" },
          ],
          substituted: `${fmtVal(m.tailleMiCuisse)} + 4`,
          ready: has("tailleMiCuisse"),
          result: num("tailleMiCuisse") + 4,
        },
        {
          name: "Distance haut de la jambe → cheville",
          parts: [
            { expr: "Hauteur taille-cheville", note: null },
            { expr: "4", note: "ourlet haut" },
            { expr: "4", note: "ourlet bas" },
          ],
          substituted: `${fmtVal(m.tailleCheville)} + 4 + 4`,
          ready: has("tailleCheville"),
          result: num("tailleCheville") + 8,
        },
      ],
    },
    {
      title: "Pièces d'entrejambe",
      cutNote: "couper 2",
      formulas: [
        {
          name: "Base du triangle (C → C1)",
          parts: [
            { expr: "Largeur fente intérieur mi-cuisse", note: null },
            { expr: "(2+2)", note: "marge de couture de chaque côté" },
          ],
          substituted: `${fmtVal(m.largeurFenteIntMiCuisse)} + 4`,
          ready: has("largeurFenteIntMiCuisse"),
          result: num("largeurFenteIntMiCuisse") + 4,
        },
        {
          name: "Hauteur du triangle (B → C)",
          parts: [
            { expr: "Hauteur taille-mi-cuisse − Hauteur taille-hanche", note: "le triangle part du bas du rectangle, au niveau de la hanche" },
          ],
          substituted: `${fmtVal(m.tailleMiCuisse)} − ${fmtVal(m.tailleHanche)}`,
          ready: has("tailleMiCuisse", "tailleHanche"),
          result: num("tailleMiCuisse") - num("tailleHanche"),
        },
        {
          name: "Hauteur du rectangle (A → B)",
          parts: [
            { expr: "Hauteur taille-hanche", note: null },
            { expr: "4", note: "ourlet haut" },
          ],
          substituted: `${fmtVal(m.tailleHanche)} + 4`,
          ready: has("tailleHanche"),
          result: num("tailleHanche") + 4,
        },
        {
          name: "Largeur du rectangle (A → A1)",
          parts: [
            { expr: "5", note: null },
            { expr: "(2+2)", note: "marge de couture" },
          ],
          substituted: "5 + 4",
          ready: true,
          result: 9,
        },
      ],
    },
  ];
}

// ---------- Reusable drafting-board SVG pieces ----------

function ArrowMarker({ id }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,1 L7,4 L0,7 Z" fill="var(--brass)" />
    </marker>
  );
}

function DimLine({ x1, y1, x2, y2, label, markerId, vertical }) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="var(--brass)" strokeWidth="1"
        markerStart={`url(#${markerId})`} markerEnd={`url(#${markerId})`}
      />
      <text
        x={vertical ? midX - 8 : midX}
        y={vertical ? midY : midY - 8}
        fill="var(--brass)"
        fontFamily="var(--font-mono)"
        fontSize="11"
        textAnchor="middle"
        transform={vertical ? `rotate(-90 ${midX - 8} ${midY})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

function GridBackdrop({ w, h }) {
  const cell = 20;
  const lines = [];
  for (let x = 0; x <= w; x += cell) lines.push(<line key={"v" + x} x1={x} y1={0} x2={x} y2={h} stroke="var(--grid-line)" strokeWidth="0.5" />);
  for (let y = 0; y <= h; y += cell) lines.push(<line key={"h" + y} x1={0} y1={y} x2={w} y2={y} stroke="var(--grid-line)" strokeWidth="0.5" />);
  return <g opacity="0.5">{lines}</g>;
}

function PatternCard({ title, cutNote, children, viewW, viewH, invalid, invalidMessage }) {
  const markerId = `arrow-${title.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className="pattern-card">
      <div className="pattern-card-header">
        <span className="pattern-card-title">{title}</span>
        <span className="pattern-card-cut">{cutNote}</span>
      </div>
      {invalid ? (
        <div className="pattern-warning">
          {invalidMessage || "Mesures insuffisantes pour tracer cette pièce — vérifiez les valeurs saisies."}
        </div>
      ) : (
        <svg viewBox={`0 0 ${viewW} ${viewH}`} width="100%" className="pattern-svg">
          <defs><ArrowMarker id={markerId} /></defs>
          <GridBackdrop w={viewW} h={viewH} />
          {children(markerId)}
        </svg>
      )}
    </div>
  );
}

function BusteSVG({ dims }) {
  const valid = isValidDims(dims);
  const pad = 40;
  const scale = valid ? Math.min(240 / dims.largeur, 320 / dims.longueur) : 1;
  const w = (dims.largeur || 0) * scale;
  const h = (dims.longueur || 0) * scale;
  const viewW = w + pad * 2 + 20;
  const viewH = h + pad * 2;
  const x0 = pad, y0 = pad;
  const cx = x0 + w / 2;
  const A = { x: cx, y: y0 };
  const A1 = { x: x0, y: y0 };
  const A2 = { x: x0 + w, y: y0 };
  const B = { x: cx, y: y0 + h };
  const B1 = { x: x0, y: y0 + h };
  const B2 = { x: x0 + w, y: y0 + h };
  return (
    <PatternCard title="Buste avant et arrière" cutNote="couper 2" viewW={viewW} viewH={viewH} invalid={!valid}>
      {(markerId) => (
        <>
          <rect x={x0} y={y0} width={w} height={h} fill="var(--parchment)" stroke="var(--ink)" strokeWidth="1.5" />
          <SymmetryAxis x={cx} y1={A.y} y2={B.y} />
          <PointMark {...A} label="A" dx={6} dy={15} />
          <PointMark {...A1} label="A1" dx={7} dy={15} />
          <PointMark {...A2} label="A2" dx={-7} dy={15} anchor="end" />
          <PointMark {...B} label="B" dx={6} dy={-6} />
          <PointMark {...B1} label="B1" dx={7} dy={-6} />
          <PointMark {...B2} label="B2" dx={-7} dy={-6} anchor="end" />
          <DimLine x1={x0} y1={y0 - 14} x2={x0 + w} y2={y0 - 14} label={`${dims.largeur.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={x0 - 14} y1={y0} x2={x0 - 14} y2={y0 + h} label={`${dims.longueur.toFixed(1)} cm`} markerId={markerId} vertical />
        </>
      )}
    </PatternCard>
  );
}

function MancheSVG({ dims }) {
  const valid = isValidDims(dims);
  const pad = 40;
  const scale = valid ? Math.min(220 / Math.max(dims.largeurEpaule, dims.largeurPoignet), 300 / dims.longueur) : 1;
  const top = (dims.largeurEpaule || 0) * scale;
  const bottom = (dims.largeurPoignet || 0) * scale;
  const len = (dims.longueur || 0) * scale;
  const maxW = Math.max(top, bottom);
  const viewW = maxW + pad * 2 + 20;
  const viewH = len + pad * 2;
  const x0 = pad + (maxW - top) / 2;
  const x1 = pad + (maxW - bottom) / 2;
  const y0 = pad, y1 = pad + len;
  const cx = pad + maxW / 2;
  const A = { x: cx, y: y0 };
  const A1 = { x: x0, y: y0 };
  const A2 = { x: x0 + top, y: y0 };
  const B = { x: cx, y: y1 };
  const B1 = { x: x1, y: y1 };
  const B2 = { x: x1 + bottom, y: y1 };
  const points = [A1, A2, B2, B1].map((q) => `${q.x},${q.y}`).join(" ");
  return (
    <PatternCard title="Manche" cutNote="couper 2" viewW={viewW} viewH={viewH} invalid={!valid}>
      {(markerId) => (
        <>
          <polygon points={points} fill="var(--parchment)" stroke="var(--ink)" strokeWidth="1.5" />
          <SymmetryAxis x={cx} y1={A.y} y2={B.y} />
          <PointMark {...A} label="A" dx={6} dy={15} />
          <PointMark {...A1} label="A1" dx={7} dy={15} />
          <PointMark {...A2} label="A2" dx={-7} dy={15} anchor="end" />
          <PointMark {...B} label="B" dx={6} dy={-6} />
          <PointMark {...B1} label="B1" dx={7} dy={-6} />
          <PointMark {...B2} label="B2" dx={-7} dy={-6} anchor="end" />
          <DimLine x1={x0} y1={y0 - 14} x2={x0 + top} y2={y0 - 14} label={`${dims.largeurEpaule.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={x1} y1={y1 + 26} x2={x1 + bottom} y2={y1 + 26} label={`${dims.largeurPoignet.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={pad - 14} y1={y0} x2={pad - 14} y2={y1} label={`${dims.longueur.toFixed(1)} cm`} markerId={markerId} vertical />
        </>
      )}
    </PatternCard>
  );
}

function EncolureSVG({ dims }) {
  const valid = isValidDims(dims);
  const margin = 30;
  const scale = 5;
  const r = (dims.rayon || 0) * scale;
  const slit = (dims.profondeurFente || 0) * scale;
  const swatchW = r * 2 + margin * 2;
  const swatchH = r * 2 + slit + margin * 2;
  const pad = 40;
  const viewW = swatchW + pad * 2 + 20;
  const viewH = swatchH + pad * 2;
  const x0 = pad, y0 = pad;
  const cx = x0 + margin + r;
  const cy = y0 + margin + r;
  const A = { x: cx, y: cy };
  const A1 = { x: cx - r, y: cy };
  const A2 = { x: cx + r, y: cy };
  const B = { x: cx, y: cy + r };
  const C = { x: cx, y: cy + r + slit };
  return (
    <PatternCard title="Trou d'encolure" cutNote="découpé dans le buste" viewW={viewW} viewH={viewH} invalid={!valid}>
      {(markerId) => (
        <>
          <rect x={x0} y={y0} width={swatchW} height={swatchH} fill="var(--parchment)" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={r} fill="#000" />
          <line x1={cx} y1={cy + r} x2={cx} y2={cy + r + slit} stroke="#000" strokeWidth="3" />
          <SymmetryAxis x={cx} y1={cy - r} y2={C.y} />
          <DimLine x1={cx} y1={cy} x2={cx + r} y2={cy} label={`${dims.rayon.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={cx + r + 16} y1={cy + r} x2={cx + r + 16} y2={cy + r + slit} label={`${dims.profondeurFente.toFixed(1)} cm`} markerId={markerId} vertical />
          <PointMark {...A} label="A" dx={6} dy={15} />
          <PointMark {...A1} label="A1" dx={-7} dy={4} anchor="end" />
          <PointMark {...A2} label="A2" dx={7} dy={4} />
          <PointMark {...B} label="B" dx={6} dy={14} />
          <PointMark {...C} label="C" dx={6} dy={4} />
        </>
      )}
    </PatternCard>
  );
}

function TriangleSVG({ dims }) {
  const halfBase = (dims.largeur || 0) / 2;
  const validBase = Number.isFinite(dims.largeur) && dims.largeur > 0;
  const validHyp = Number.isFinite(dims.hauteur) && dims.hauteur > halfBase;
  const valid = validBase && validHyp;
  const perpHeight = valid ? Math.sqrt(dims.hauteur * dims.hauteur - halfBase * halfBase) : 0;

  const pad = 40;
  const scale = valid ? Math.min(220 / dims.largeur, 260 / perpHeight) : 1;
  const base = (dims.largeur || 0) * scale;
  const h = perpHeight * scale;
  const viewW = base + pad * 2 + 30;
  const viewH = h + pad * 2 + 10;
  const x0 = pad, y0 = pad;
  const apex = { x: x0 + base / 2, y: y0 };
  const bl = { x: x0, y: y0 + h };
  const br = { x: x0 + base, y: y0 + h };
  const baseMid = { x: apex.x, y: y0 + h };
  const points = `${apex.x},${apex.y} ${bl.x},${bl.y} ${br.x},${br.y}`;

  return (
    <PatternCard
      title="Triangle d'aisance"
      cutNote="couper 2 (un par fente)"
      viewW={viewW}
      viewH={viewH}
      invalid={!valid}
      invalidMessage={
        validBase && !validHyp
          ? "La « hauteur côté » doit être supérieure à la moitié de la largeur du triangle pour former un triangle valide."
          : undefined
      }
    >
      {(markerId) => (
        <>
          <polygon points={points} fill="var(--parchment)" stroke="var(--ink)" strokeWidth="1.5" />
          <SymmetryAxis x={apex.x} y1={apex.y} y2={bl.y} />
          <line x1={apex.x} y1={bl.y} x2={br.x} y2={bl.y} stroke="var(--slate)" strokeWidth="1" strokeDasharray="3,3" />
          <text
            x={apex.x - 6}
            y={(apex.y + bl.y) / 2}
            transform={`rotate(-90 ${apex.x - 6} ${(apex.y + bl.y) / 2})`}
            textAnchor="middle"
            fill="var(--slate)"
            fontFamily="var(--font-mono)"
            fontSize="9"
          >
            {perpHeight.toFixed(1)} cm
          </text>
          <text x={(apex.x + br.x) / 2 - 8} y={bl.y - 5} fill="var(--slate)" fontFamily="var(--font-mono)" fontSize="9">
            {halfBase.toFixed(1)} cm
          </text>
          <PointMark {...apex} label="A" dx={-6} dy={4} anchor="end" />
          <PointMark {...baseMid} label="B" dx={-6} dy={-6} anchor="end" />
          <PointMark {...bl} label="B1" dx={-7} dy={14} anchor="end" />
          <PointMark {...br} label="B2" dx={7} dy={14} />
          {/* dimensioned base */}
          <DimLine x1={bl.x} y1={bl.y + 26} x2={br.x} y2={bl.y + 26} label={`Base ${dims.largeur.toFixed(1)} cm`} markerId={markerId} />
          {/* dimensioned hypotenuse: bottom corner to apex */}
          <DimLine x1={apex.x + 12} y1={apex.y} x2={br.x + 12} y2={br.y} label={`${dims.hauteur.toFixed(1)} cm`} markerId={markerId} />
        </>
      )}
    </PatternCard>
  );
}

function PointLabel({ x, y, children, anchor = "middle" }) {
  return (
    <text
      x={x}
      y={y}
      fill="var(--wax)"
      stroke="var(--parchment)"
      strokeWidth="3"
      strokeLinejoin="round"
      paintOrder="stroke"
      fontFamily="var(--font-mono)"
      fontSize="11"
      fontWeight="600"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

function PointMark({ x, y, label, dx = 0, dy = 0, anchor = "start" }) {
  return (
    <g>
      <circle cx={x} cy={y} r="2.5" fill="var(--wax)" stroke="var(--parchment)" strokeWidth="1" />
      <PointLabel x={x + dx} y={y + dy} anchor={anchor}>{label}</PointLabel>
    </g>
  );
}

function SymmetryAxis({ x, y1, y2 }) {
  return (
    <line x1={x} y1={y1 - 8} x2={x} y2={y2 + 8} stroke="var(--slate)" strokeWidth="1" strokeDasharray="5,4" />
  );
}

function JambeSVG({ dims }) {
  const valid = isValidDims(dims) && dims.hauteurMiCuisse < dims.longueur;
  const pad = 44;
  const maxW = Math.max(dims.largeurHaut, dims.largeurCheville) || 1;
  const scale = valid ? Math.min(240 / maxW, 340 / dims.longueur) : 1;
  const top = (dims.largeurHaut || 0) * scale;
  const ankle = (dims.largeurCheville || 0) * scale;
  const hB = (dims.hauteurMiCuisse || 0) * scale;
  const len = (dims.longueur || 0) * scale;
  const w = Math.max(top, ankle);
  const viewW = w + pad * 2 + 30;
  const viewH = len + pad * 2;
  const cx = pad + w / 2;
  const y0 = pad;
  const A = { x: cx, y: y0 };
  const A1 = { x: cx - top / 2, y: y0 };
  const A2 = { x: cx + top / 2, y: y0 };
  const B = { x: cx, y: y0 + hB };
  const B1 = { x: cx - top / 2, y: y0 + hB };
  const B2 = { x: cx + top / 2, y: y0 + hB };
  const C = { x: cx, y: y0 + len };
  const C1 = { x: cx - ankle / 2, y: y0 + len };
  const C2 = { x: cx + ankle / 2, y: y0 + len };
  const points = [A1, A2, B2, C2, C1, B1].map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <PatternCard
      title="Jambe"
      cutNote="couper 2"
      viewW={viewW}
      viewH={viewH}
      invalid={!valid}
      invalidMessage={
        isValidDims(dims) && !valid
          ? "La hauteur taille-mi-cuisse doit être inférieure à la longueur totale de la jambe."
          : undefined
      }
    >
      {(markerId) => (
        <>
          <polygon points={points} fill="var(--parchment)" stroke="var(--ink)" strokeWidth="1.5" />
          <SymmetryAxis x={cx} y1={A.y} y2={C.y} />
          <line x1={B1.x} y1={B1.y} x2={B2.x} y2={B2.y} stroke="var(--slate)" strokeWidth="1" strokeDasharray="3,3" />
          <PointMark {...A} label="A" dx={6} dy={15} />
          <PointMark {...A1} label="A1" dx={7} dy={15} />
          <PointMark {...A2} label="A2" dx={-7} dy={15} anchor="end" />
          <PointMark {...B} label="B" dx={6} dy={-6} />
          <PointMark {...B1} label="B1" dx={7} dy={-6} />
          <PointMark {...B2} label="B2" dx={-7} dy={-6} anchor="end" />
          <PointMark {...C} label="C" dx={6} dy={-6} />
          <PointMark {...C1} label="C1" dx={7} dy={-6} />
          <PointMark {...C2} label="C2" dx={-7} dy={-6} anchor="end" />
          <DimLine x1={A1.x} y1={A.y - 14} x2={A2.x} y2={A2.y - 14} label={`${dims.largeurHaut.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={C1.x} y1={C.y + 26} x2={C2.x} y2={C2.y + 26} label={`${dims.largeurCheville.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={pad - 16} y1={A.y} x2={pad - 16} y2={B.y} label={`${dims.hauteurMiCuisse.toFixed(1)} cm`} markerId={markerId} vertical />
          <DimLine x1={pad + w + 22} y1={A.y} x2={pad + w + 22} y2={C.y} label={`${dims.longueur.toFixed(1)} cm`} markerId={markerId} vertical />
        </>
      )}
    </PatternCard>
  );
}

function EntrejambeSVG({ dims }) {
  const valid = isValidDims(dims);
  const pad = 44;
  const totalH = (dims.hauteurBande || 0) + (dims.hauteurTriangle || 0);
  const maxW = Math.max(dims.base, dims.largeurBande) || 1;
  const scale = valid ? Math.min(240 / maxW, 340 / totalH) : 1;
  const base = (dims.base || 0) * scale;
  const band = (dims.largeurBande || 0) * scale;
  const hb = (dims.hauteurBande || 0) * scale;
  const ht = (dims.hauteurTriangle || 0) * scale;
  const w = Math.max(base, band);
  const viewW = w + pad * 2 + 30;
  const viewH = hb + ht + pad * 2;
  const cx = pad + w / 2;
  const y0 = pad;
  const A = { x: cx, y: y0 };
  const A1 = { x: cx - band / 2, y: y0 };
  const A2 = { x: cx + band / 2, y: y0 };
  const B = { x: cx, y: y0 + hb };
  const B1 = { x: cx - band / 2, y: y0 + hb };
  const B2 = { x: cx + band / 2, y: y0 + hb };
  const C = { x: cx, y: y0 + hb + ht };
  const C1 = { x: cx - base / 2, y: y0 + hb + ht };
  const C2 = { x: cx + base / 2, y: y0 + hb + ht };
  const outline = [A1, A2, B2, C2, C1, B1].map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <PatternCard
      title="Pièce d'entrejambe"
      cutNote="couper 2"
      viewW={viewW}
      viewH={viewH}
      invalid={!valid}
      invalidMessage={
        !(dims.hauteurTriangle > 0)
          ? "La hauteur taille-mi-cuisse doit être supérieure à la hauteur taille-hanche."
          : undefined
      }
    >
      {(markerId) => (
        <>
          <polygon points={outline} fill="var(--parchment)" stroke="var(--ink)" strokeWidth="1.5" />
          <SymmetryAxis x={cx} y1={A.y} y2={C.y} />
          <line x1={B1.x} y1={B1.y} x2={B2.x} y2={B2.y} stroke="var(--slate)" strokeWidth="1" strokeDasharray="3,3" />
          <PointMark {...A} label="A" dx={5} dy={15} />
          <PointMark {...A1} label="A1" dx={-7} dy={15} anchor="end" />
          <PointMark {...A2} label="A2" dx={7} dy={15} />
          <PointMark {...B} label="B" dx={5} dy={-6} />
          <PointMark {...B1} label="B1" dx={-7} dy={4} anchor="end" />
          <PointMark {...B2} label="B2" dx={7} dy={4} />
          <PointMark {...C} label="C" dx={5} dy={-6} />
          <PointMark {...C1} label="C1" dx={9} dy={-6} />
          <PointMark {...C2} label="C2" dx={-9} dy={-6} anchor="end" />
          <DimLine x1={A1.x} y1={y0 - 14} x2={A2.x} y2={y0 - 14} label={`${dims.largeurBande.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={C1.x} y1={C.y + 26} x2={C2.x} y2={C2.y + 26} label={`Base ${dims.base.toFixed(1)} cm`} markerId={markerId} />
          <DimLine x1={A1.x - 30} y1={y0} x2={A1.x - 30} y2={B.y} label={`${dims.hauteurBande.toFixed(1)} cm`} markerId={markerId} vertical />
          <DimLine x1={pad + w + 22} y1={B.y} x2={pad + w + 22} y2={C.y} label={`${dims.hauteurTriangle.toFixed(1)} cm`} markerId={markerId} vertical />
        </>
      )}
    </PatternCard>
  );
}

function FormulaSection({ sections }) {
  return (
    <div className="formulas">
      <h2 className="steps-title">Explication et calcul des mesures</h2>
      <p className="steps-caption">Le détail du calcul de chaque pièce, terme par terme.</p>
      {sections.map((sec) => (
        <div className="formula-card" key={sec.title}>
          <div className="formula-card-header">
            <span className="formula-card-title">{sec.title}</span>
            <span className="formula-card-cut">{sec.cutNote}</span>
          </div>
          {sec.formulas.map((f) => (
            <div className="formula-block" key={f.name}>
              <div className="formula-name">{f.name}</div>
              <div className="formula-expr">
                {f.parts.map((p, i) => (
                  <span key={i}>
                    {i > 0 && <span className="term-plus"> + </span>}
                    <span className="term-expr">{p.expr}</span>
                    {p.note && <span className="term-note"> (={p.note})</span>}
                  </span>
                ))}
              </div>
              <div className="formula-sub">
                <span className="formula-sub-arrow">→</span> {f.substituted} = {" "}
                <strong className="formula-sub-result">{f.ready ? `${f.result.toFixed(1)} cm` : "…"}</strong>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function StepHeader({ step, title, children }) {
  return (
    <div className="step-header">
      <div className="step-header-eyebrow">Étape {step}</div>
      <h2 className="step-header-title">{title}</h2>
      <p className="step-header-desc">{children}</p>
    </div>
  );
}

function TriangleConstructionNote({ dims }) {
  const halfBase = dims.largeur / 2;
  const valid = Number.isFinite(dims.hauteur) && dims.hauteur > halfBase;
  const perp = valid ? Math.sqrt(dims.hauteur * dims.hauteur - halfBase * halfBase) : null;
  return (
    <div className="construction-note">
      <div className="construction-note-title">Triangle d'aisance — précision de tracé</div>
      <p>
        La mesure <strong>« Hauteur côté »</strong> calculée à l'étape 2 ne
        désigne pas la hauteur perpendiculaire du triangle, mais la longueur
        de l'hypoténuse : la ligne droite entre un coin inférieur et le
        sommet du triangle.
      </p>
      <p>
        Pour tracer le triangle sur votre papier quadrillé : tracez d'abord
        la base ({dims.largeur.toFixed(1)} cm), repérez son milieu, puis
        montez perpendiculairement jusqu'au sommet — c'est cette hauteur
        perpendiculaire, et non la « hauteur côté », qu'il faut reporter sur
        le papier. Elle se calcule avec le théorème de Pythagore, à partir
        d'un triangle rectangle dont l'hypoténuse vaut la « hauteur côté » et
        dont l'autre côté vaut la moitié de la base.
      </p>
      <div className="construction-note-calc">
        hauteur perpendiculaire = √(Hauteur côté² − (Base/2)²) = √({dims.hauteur.toFixed(1)}²
        − {halfBase.toFixed(1)}²) = <strong>{valid ? `${perp.toFixed(1)} cm` : "…"}</strong>
      </div>
    </div>
  );
}

// ---------- Measurement form ----------

// Metadata for every possible measurement, independent of which piece uses it.
const FIELD_META = {
  epauleGenou: { label: "Hauteur épaule-genou", hint: "de l'épaule au genou", group: "Hauteurs" },
  epauleTaille: { label: "Hauteur épaule-taille", hint: "de l'épaule à la taille", group: "Hauteurs" },
  tailleHanche: { label: "Hauteur taille-hanche", hint: "de la taille à la hanche", group: "Hauteurs" },
  tailleMiCuisse: { label: "Hauteur taille-mi-cuisse", hint: "de la taille à mi-cuisse", group: "Hauteurs" },
  tailleGenou: { label: "Hauteur taille-genou", hint: "de la taille au genou", group: "Hauteurs" },
  tailleCheville: { label: "Hauteur taille-cheville", hint: "de la taille à la cheville", group: "Hauteurs" },
  poitrine: { label: "Tour de poitrine", hint: "au niveau le plus fort de la poitrine", group: "Tours" },
  hanche: { label: "Tour de hanche", hint: "au niveau le plus fort des hanches", group: "Tours" },
  bras: { label: "Tour de bras", hint: "autour du biceps", group: "Tours" },
  main: { label: "Tour de main", hint: "autour de la main fermée, pour passer le poignet", group: "Tours" },
  cou: { label: "Tour de cou", hint: "à la base du cou", group: "Tours" },
  tete: { label: "Tour de tête", hint: "au niveau le plus large du crâne", group: "Tours" },
  cuisse: { label: "Tour de cuisse", hint: "au niveau le plus fort de la cuisse", group: "Tours" },
  pied: { label: "Tour de pied", hint: "autour de la partie la plus large du pied", group: "Tours" },
  longueurBras: { label: "Longueur de bras", hint: "de l'épaule au poignet", group: "Autres" },
  largeurFenteExtGenou: { label: "Largeur fente extérieur genou", hint: "ouverture extérieure au niveau du genou", group: "Autres" },
  largeurFenteIntMiCuisse: { label: "Largeur fente intérieur mi-cuisse", hint: "ouverture intérieure à mi-cuisse", group: "Autres" },
};

const GROUP_ORDER = ["Hauteurs", "Tours", "Autres"];

const BRAIES_CHAUSSES_KEYS = [
  "hanche",
  "cuisse",
  "pied",
  "tailleCheville",
  "tailleMiCuisse",
  "largeurFenteIntMiCuisse",
  "tailleHanche",
];

const PIECES = [
  {
    key: "tunique",
    label: "Tunique",
    requiredKeys: [
      "epauleGenou",
      "epauleTaille",
      "tailleGenou",
      "poitrine",
      "hanche",
      "bras",
      "main",
      "cou",
      "tete",
      "longueurBras",
      "largeurFenteExtGenou",
    ],
  },
  { key: "braies", label: "Braies", requiredKeys: BRAIES_CHAUSSES_KEYS },
  { key: "chausses", label: "Chausses", requiredKeys: BRAIES_CHAUSSES_KEYS },
];

function buildFieldGroups(requiredKeys) {
  return GROUP_ORDER.map((groupTitle) => ({
    title: groupTitle,
    fields: requiredKeys
      .filter((key) => FIELD_META[key].group === groupTitle)
      .map((key) => ({ key, ...FIELD_META[key] })),
  })).filter((g) => g.fields.length > 0);
}

function TuniquePieces({ pattern }) {
  return (
    <>
      <div className="pattern-row">
        <BusteSVG dims={pattern.buste} />
        <MancheSVG dims={pattern.manche} />
        <TriangleSVG dims={pattern.triangle} />
      </div>

      <TriangleConstructionNote dims={pattern.triangle} />

      <div className="subsection">
        <h2 className="steps-title">Découpe de l'encolure</h2>
        <p className="steps-caption">
          Le trou ci-dessous (en noir) est à découper directement
          dans le buste : il correspond au tour de cou. Le col
          lui-même est une pièce distincte, à découper dans un tissu
          contrastant, qui vient border ce trou.
        </p>
        <div className="pattern-row">
          <EncolureSVG dims={pattern.col} />
        </div>
        <div className="placeholder">WIP — à compléter</div>
      </div>
    </>
  );
}

function BraiesPieces({ pattern }) {
  return (
    <div className="pattern-row">
      <JambeSVG dims={pattern.jambe} />
      <EntrejambeSVG dims={pattern.entrejambe} />
    </div>
  );
}

const CALCULATORS = {
  tunique: { compute: computePattern, explain: buildExplanations, Pieces: TuniquePieces },
  braies: { compute: computeBraies, explain: buildBraiesExplanations, Pieces: BraiesPieces },
};

export default function TunicCalculator() {
  const [selectedPiece, setSelectedPiece] = useState("tunique");
  const piece = PIECES.find((p) => p.key === selectedPiece);
  const fieldGroups = useMemo(() => buildFieldGroups(piece.requiredKeys), [piece]);

  const initial = Object.fromEntries(Object.keys(FIELD_META).map((k) => [k, ""]));
  const [measurements, setMeasurements] = useState(initial);

  const missingRequired = piece.requiredKeys.filter((k) => !(Number(measurements[k]) > 0));
  const allRequiredFilled = missingRequired.length === 0;
  const calculator = CALCULATORS[selectedPiece];
  const hasFormulas = Boolean(calculator);
  const pattern = useMemo(
    () => (calculator && allRequiredFilled ? calculator.compute(measurements) : null),
    [measurements, allRequiredFilled, calculator]
  );

  const explanations = useMemo(
    () => (calculator ? calculator.explain(measurements) : null),
    [measurements, calculator]
  );
  const Pieces = calculator?.Pieces;

  const setField = (key, value) => setMeasurements((m) => ({ ...m, [key]: value }));

  return (
    <div className="tunic-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .tunic-app {
          --ink: #1F2421;
          --parchment: #F7F2E7;
          --parchment-dark: #EDE4D3;
          --brass: #B8894A;
          --wax: #8C3B2E;
          --slate: #5C6570;
          --grid-line: #2A3330;
          --font-display: 'Cormorant Garamond', serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
          background: var(--parchment);
          color: var(--ink);
          font-family: var(--font-body);
          min-height: 100%;
          padding: 32px 20px 60px;
        }
        .tunic-header { max-width: 1100px; margin: 0 auto 28px; }
        .tunic-eyebrow {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--wax); margin-bottom: 6px;
        }
        .tunic-title {
          font-family: var(--font-display); font-weight: 600; font-size: 40px;
          color: var(--ink); margin: 0 0 6px;
        }
        .tunic-sub { color: var(--slate); font-size: 15px; line-height: 1.5; }
        .tunic-sub-heading {
          font-family: var(--font-display); font-weight: 600; font-size: 20px;
          color: var(--ink); margin: 18px 0 6px;
        }

        .piece-selector {
          max-width: 1100px; margin: 0 auto 28px; display: flex; align-items: center; gap: 12px;
          background: var(--ink); border-radius: 4px; padding: 14px 20px; width: fit-content;
        }
        .piece-selector label {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--parchment);
        }
        .piece-selector select {
          background: #10130F; border: 1px solid var(--brass); color: var(--parchment);
          font-family: var(--font-display); font-weight: 600; font-size: 16px;
          padding: 6px 12px; border-radius: 3px; outline: none; cursor: pointer;
        }
        .piece-selector select:focus { border-color: #d4ab6c; }

        .tunic-steps { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 44px; }

        .ledger {
          background: var(--ink); color: var(--parchment); border-radius: 4px; padding: 24px;
        }
        .ledger-title {
          font-family: var(--font-display); font-size: 20px; font-weight: 600;
          color: var(--brass); margin: 0 0 16px; border-bottom: 1px solid #3a453f; padding-bottom: 10px;
        }
        .ledger-subtitle {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
          color: #8b9791; margin: 20px 0 10px;
        }
        .ledger-subtitle:first-of-type { margin-top: 0; }
        .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 12px; letter-spacing: 0.03em; color: var(--parchment); margin-bottom: 4px; }
        .field label .req { color: var(--brass); margin-left: 3px; }
        .field .hint { display: block; font-size: 11px; color: #8b9791; margin-bottom: 6px; font-style: italic; }
        .field .input-row { display: flex; align-items: baseline; gap: 6px; }
        .field input {
          width: 100%; background: #10130F; border: 1px solid #3a453f; color: var(--parchment);
          font-family: var(--font-mono); font-size: 14px; padding: 8px 10px; border-radius: 3px;
          outline: none;
        }
        .field input:focus { border-color: var(--brass); }
        .field .unit { font-family: var(--font-mono); font-size: 12px; color: #8b9791; }

        .status { margin-top: 6px; font-size: 12px; color: #8b9791; font-family: var(--font-mono); }

        .step-section { display: flex; flex-direction: column; gap: 20px; }
        .subsection {
          border-top: 1px solid #d8cdb4; padding-top: 20px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .placeholder {
          border: 1px dashed var(--slate); border-radius: 4px; padding: 60px 24px;
          text-align: center; color: var(--slate); font-size: 14px;
        }
        .pattern-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }

        .pattern-card {
          background: var(--ink); border-radius: 4px; padding: 14px; border: 1px solid #3a453f;
        }
        .pattern-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
        .pattern-card-title { font-family: var(--font-display); font-size: 17px; font-weight: 600; color: var(--parchment); }
        .pattern-card-cut { font-family: var(--font-mono); font-size: 10px; color: var(--brass); text-transform: uppercase; letter-spacing: 0.05em; }
        .pattern-svg { display: block; }
        .pattern-warning {
          color: var(--wax); font-size: 12.5px; padding: 20px 6px; text-align: center; line-height: 1.4;
        }

        .construction-note {
          background: var(--parchment-dark); border-left: 3px solid var(--brass);
          border-radius: 3px; padding: 16px 20px; font-size: 13px; color: var(--ink);
        }
        .construction-note-title {
          font-family: var(--font-display); font-weight: 600; font-size: 16px;
          color: var(--ink); margin-bottom: 8px;
        }
        .construction-note p { margin: 0 0 8px; line-height: 1.55; color: #3d4640; }
        .construction-note p:last-of-type { margin-bottom: 10px; }
        .construction-note-calc {
          font-family: var(--font-mono); font-size: 12.5px; color: var(--wax);
          background: #fff; border: 1px solid #d8cdb4; border-radius: 3px; padding: 8px 12px;
        }

        .step-header { margin-bottom: 18px; }
        .step-header-eyebrow {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--wax); margin-bottom: 4px;
        }
        .step-header-title {
          font-family: var(--font-display); font-weight: 600; font-size: 26px;
          color: var(--ink); margin: 0 0 8px;
        }
        .step-header-desc { color: var(--slate); font-size: 13.5px; line-height: 1.55; font-style: italic; }

        .formulas { margin-bottom: 6px; }
        .formula-card {
          background: var(--ink); border-radius: 4px; padding: 18px 20px; border: 1px solid #3a453f;
          margin-bottom: 14px;
        }
        .formula-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
        .formula-card-title { font-family: var(--font-display); font-size: 19px; font-weight: 600; color: var(--parchment); }
        .formula-card-cut { font-family: var(--font-mono); font-size: 10px; color: var(--brass); text-transform: uppercase; letter-spacing: 0.05em; }
        .formula-block { padding: 10px 0; border-top: 1px solid #3a453f; }
        .formula-block:first-of-type { border-top: none; padding-top: 0; }
        .formula-name { font-family: var(--font-body); font-weight: 600; font-size: 13px; color: var(--brass); margin-bottom: 4px; }
        .formula-expr { font-family: var(--font-mono); font-size: 12.5px; line-height: 1.7; color: var(--parchment); }
        .term-expr { color: var(--parchment); }
        .term-plus { color: #8b9791; }
        .term-note { font-family: var(--font-body); font-style: italic; color: #8b9791; font-size: 12px; }
        .formula-sub { font-family: var(--font-mono); font-size: 12.5px; color: #c9beA0; margin-top: 6px; }
        .formula-sub-arrow { color: var(--brass); }
        .formula-sub-result { color: var(--brass); font-size: 13.5px; }

        .steps { margin-top: 6px; }
        .steps-title {
          font-family: var(--font-display); font-size: 24px; font-weight: 600; margin: 0 0 4px;
        }
        .steps-caption { color: var(--slate); font-size: 13px; margin-bottom: 16px; }
        .step {
          display: grid; grid-template-columns: 40px 1fr; gap: 14px; padding: 14px 0;
          border-top: 1px solid #d8cdb4;
        }
        .step:last-child { border-bottom: 1px solid #d8cdb4; }
        .step-num {
          font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--wax);
        }
        .step-title { font-weight: 600; font-size: 14px; margin: 0 0 4px; color: var(--ink); }
        .step-body { font-size: 13.5px; color: #3d4640; line-height: 1.5; margin: 0; }

        .site-footer {
          max-width: 1100px; margin: 56px auto 0; padding-top: 14px;
          border-top: 1px solid #d8cdb4; text-align: center;
          font-size: 12px; color: var(--slate);
        }
        .site-footer a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
        .site-footer a:hover { color: var(--ink); }

        .print-bar { max-width: 1100px; margin: 0 auto 28px; display: flex; justify-content: center; }
        .print-button {
          background: var(--ink); border: 1px solid var(--brass); color: var(--parchment);
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 10px 20px; border-radius: 4px; cursor: pointer;
        }
        .print-button:hover { border-color: #d4ab6c; }

        @media print {
          @page { margin: 1.5cm; }
          .no-print { display: none !important; }
          .tunic-app { background: #fff; padding: 0; }
          .ledger, .formula-card, .pattern-card {
            background: #fff; border: 1px solid #999; color: #000;
          }
          .ledger-title, .formula-card-title, .pattern-card-title,
          .formula-expr, .term-expr, .formula-sub-result, .step-num {
            color: #000;
          }
          .ledger-subtitle, .formula-card-cut, .pattern-card-cut,
          .field .hint, .field .unit, .status, .term-note, .formula-sub {
            color: #444;
          }
          .field input {
            background: #fff; border: 1px solid #999; color: #000;
          }
          .step-section, .pattern-card, .formula-card, .construction-note {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="tunic-header">
        <h1 className="tunic-title">Tenue médiévale : Normand XIe siècle &mdash; {piece.label}</h1>
        <p className="tunic-sub">
          Cet outil sert d'aide à la fabrication du costume médiéval du XIe
          siècle tel qu'utilisé par la Compagnie Excalibur.
        </p>
        <div className="no-print">
          <h2 className="tunic-sub-heading">Comment utiliser ce site&nbsp;?</h2>
          <p className="tunic-sub">
            Choisissez la pièce à construire, entrez vos mesures, et l'outil
            vous indiquera le calcul des mesures du patron ainsi que comment
            mesurer et tracer les pièces du costume sur votre papier quadrillé.
          </p>
        </div>
      </div>

      <div className="piece-selector no-print">
        <label htmlFor="piece-select">Pièce à construire&nbsp;:</label>
        <select
          id="piece-select"
          value={selectedPiece}
          onChange={(e) => setSelectedPiece(e.target.value)}
        >
          {PIECES.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="print-bar no-print">
        <button type="button" className="print-button" onClick={() => window.print()}>
          Imprimer / Exporter en PDF
        </button>
      </div>

      <div className="tunic-steps">
        <section className="step-section">
          <StepHeader step="1" title="Prise de mesures">
            Pour prendre vos mensurations avec précision, munissez-vous d'un mètre ruban de couture,
            et, idéalement, faites-vous aider par une autre personne : certaines mesures sont difficiles
            à relever seul sans fausser la posture.

            Mesurez-vous en sous-vêtements ou en vêtements fins (Ex: T-shirt et pantalon). Tenez-vous debout,
             droit mais détendu, les pieds légèrement écartés et les bras le long du corps. Respirez normalement
            sans rentrer le ventre ni bomber le torse. Le ruban doit épouser le corps sans le comprimer: il doit rester
            bien à plat et parallèle au sol pour les tours (hanche, taille).

            Arrondissez les valeurs au centimètre supérieur (Ex: 65,4 cm --> 66 cm)
          </StepHeader>
          <div className="ledger">
          <div className="ledger-title">Mesures corporelles &mdash; {piece.label}</div>
          {fieldGroups.map((group) => (
            <React.Fragment key={group.title}>
              <div className="ledger-subtitle">{group.title}</div>
              <div className="field-grid">
                {group.fields.map((f) => (
                  <div className="field" key={f.key}>
                    <label htmlFor={f.key}>{f.label}</label>
                    <span className="hint">{f.hint}</span>
                    <div className="input-row">
                      <input
                        id={f.key}
                        type="number"
                        min="0"
                        inputMode="decimal"
                        value={measurements[f.key]}
                        onChange={(e) => setField(f.key, e.target.value)}
                        placeholder="0"
                      />
                      <span className="unit">cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
          <div className="status">
            {allRequiredFilled
              ? "Toutes les mesures nécessaires sont enregistrées."
              : `${missingRequired.length} mesure(s) manquante(s).`}
          </div>
          </div>
        </section>

        <section className="step-section">
          <StepHeader step="2" title="Calcul des mesures du patron">
            Cette section détaille le calcul des mesures du patron selon les mensurations que vous venez d'entrer.
            Notez que les valeurs calculées tiennent compte des marges d'aisance et de couture.
          </StepHeader>
          {hasFormulas ? (
            <FormulaSection sections={explanations} />
          ) : (
            <div className="placeholder">
              Les formules de calcul pour « {piece.label} » n'ont pas encore été définies.
            </div>
          )}
        </section>

        <section className="step-section">
          <StepHeader step="3" title="Construction du patron">
            Une fois les mesures définies, tracez sur un papier quadrillé puis
            coupez les pièces de votre patron selon les instructions
            ci-dessous. Il est conseillé de ne pas faire vos mesures
            directement sur le tissu: c'est moins précis, et en cas d'erreur,
            c'est plus difficile à rattraper. Placez les pièces de papier
            quadrillé préalablement découpées sur votre tissu, en les tenant
            à l'aide d'épingles si nécéssaires, et coupez vos pièces de tissu.
          </StepHeader>

          {!hasFormulas && (
            <div className="placeholder">
              Le patron pour « {piece.label} » n'a pas encore été défini.
            </div>
          )}
          {hasFormulas && !pattern && (
            <div className="placeholder">
              Renseignez toutes les mesures ci-dessus pour tracer les pièces du patron.
            </div>
          )}
          {pattern && <Pieces pattern={pattern} />}
        </section>

        <section className="step-section">
          <StepHeader step="4" title="Assemblage">
            Une fois que vous avez vos pièces en tissu, assemblez-les selon
            les instructions ci-dessous.
          </StepHeader>

          <div className="placeholder">WIP — se référer aux profs de couture</div>
        </section>
      </div>

      <footer className="site-footer">
        Site créé par Shyam S | <a href="mailto:shyam@sridar.net">shyam@sridar.net</a> | Patrons élaborés pour et par la Compagnie Excalibur | <a href="https://compagnie-excalibur.fr" target="_blank" rel="noopener noreferrer">compagnie-excalibur.fr</a>
      </footer>
    </div>
  );
}
