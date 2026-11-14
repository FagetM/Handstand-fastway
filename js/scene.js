// Le décor de l’en-tête grandit avec le rang : une graine, une pousse, un arbre, une forêt, puis la montagne, le ciel et les étoiles.
// Un seul SVG par affichage, des aplats aux couleurs du thème, quelques animations douces (balancement, scintillement).
"use strict";
const SC_STARS = [[28,18],[64,40],[96,14],[132,30],[150,10],[214,20],[238,42],[262,12],[300,34],[332,16],[348,44],[110,52]];
const SC_TIER = [0,0,0,1,1,1,2,2,2,3,3,3];
const SC_NEW = ["Une graine dans la terre : tout commence.", "Une pousse sort de terre.", "Les racines s’installent sous la surface.", "La tige monte vers la lumière.",
  "Les premières feuilles s’ouvrent.", "Une fleur éclot en haut de la tige.", "La plante est devenue un arbre, des oiseaux s’y posent.", "D’autres arbres poussent autour : une forêt.",
  "Une montagne se dessine derrière la forêt.", "Des nuages passent dans le ciel.", "Les premières étoiles s’allument.", "La Voie lactée traverse le ciel."];
function scTree(x, s, cls){   // un arbre simple : tronc et couronne de trois ronds
  return '<g class="' + (cls || "") + '" transform="translate(' + x + ' 94) scale(' + s + ')"><path d="M-4 0V-38h8V0Z" fill="var(--wood)"/>'
    + '<g class="sway"><circle cx="0" cy="-50" r="22" fill="var(--leaf)"/><circle cx="-16" cy="-40" r="14" fill="var(--leaf)"/><circle cx="16" cy="-40" r="14" fill="var(--leaf)"/></g></g>';
}
function scene(i, fresh){
  const L = (n, svg) => i >= n ? '<g' + (fresh && n === i ? ' class="grow"' : "") + '>' + svg + '</g>' : "";
  let s = '<svg class="scene" viewBox="0 0 360 120" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Ton décor au rang ' + RANKS[i] + '">';
  s += '<rect width="360" height="120" fill="var(--sky)"/>';
  // le soleil suit l’heure : bas le matin, haut le jour, couchant le soir ; la nuit, un croissant (la Galaxie a déjà sa lune)
  const tod = document.documentElement.dataset.tod || "jour";
  if (i < 11) s += tod === "nuit" ? '<circle cx="300" cy="26" r="8" fill="var(--raise)"/><circle cx="304" cy="23" r="7" fill="var(--sky)"/>'
    : '<circle cx="' + (tod === "matin" ? 60 : tod === "soir" ? 304 : 290) + '" cy="' + (tod === "jour" ? 26 : 62) + '" r="13" fill="var(--sun)"/>';
  s += L(11, '<g opacity=".45">' + Array.from({length:30}, (_, k) => { const a = k / 30 * Math.PI * 2, x = 180 + Math.cos(a) * 170, y = 34 + Math.sin(a) * 10 - (x - 180) * 0.08; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (0.6 + (k % 3) * 0.3) + '" fill="var(--goldtxt)"/>'; }).join("") + '</g>'
    + '<circle cx="322" cy="24" r="9" fill="var(--raise)"/><circle cx="326" cy="21" r="8" fill="var(--sky)"/>');
  s += L(10, SC_STARS.map(([x, y], k) => '<circle class="tw" style="--d:' + (k * 0.37).toFixed(2) + 's" cx="' + x + '" cy="' + y + '" r="' + (0.8 + (k % 3) * 0.3) + '" fill="var(--goldtxt)"/>').join(""));
  s += L(9, '<path class="cl" d="M48 34h44a9 9 0 0 0-9-11 13 13 0 0 0-24 2 8 8 0 0 0-11 9Z" fill="var(--raise)"/><path class="cl" style="--d:-9s" d="M250 26h40a8 8 0 0 0-8-10 12 12 0 0 0-22 2 7 7 0 0 0-10 8Z" fill="var(--raise)"/>');
  s += L(8, '<path d="M0 92 60 58l42 24 66-44 70 46 46-26 76 34V100H0Z" fill="var(--hill)"/>');
  s += L(7, scTree(84, 0.55, "bk") + scTree(262, 0.6, "bk") + scTree(306, 0.45, "bk"));
  s += '<path d="M0 96Q90 88 180 94T360 92V120H0Z" fill="var(--soil)"/>';
  s += '<path d="M40 93l2-6 2 6M47 92l1-4 2 4M118 92l2-5 2 5M244 93l2-6 2 6M251 93l1-4 2 4M330 91l2-5 2 5" fill="none" stroke="var(--leaf)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>';   /* touffes d’herbe */
  if (i < 6) {
    s += L(2, '<path d="M180 98q-6 8-14 12M180 98q2 9 0 16M180 98q7 7 15 10" fill="none" stroke="var(--wood)" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>');
    s += i === 0 ? '<ellipse cx="180" cy="99" rx="5" ry="3.5" fill="var(--wood)"/>' : "";
    s += L(1, '<path d="' + (i >= 3 ? "M180 96C182 80 178 66 180 52" : "M180 96Q181 88 180 82") + '" fill="none" stroke="var(--leaf)" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M180 86q-8-7-15-2 7 6 15 2ZM180 86q8-7 15-2-7 6-15 2Z" fill="var(--leaf)"/>');
    s += L(4, '<g class="sway">' + [[74, -1], [66, 1], [60, -1], [56, 1]].map(([y, d]) => '<path d="M180 ' + y + 'q' + (d * 9) + '-7 ' + (d * 16) + '-3 ' + (-d * 7) + ' 6 ' + (-d * 16) + ' 3Z" fill="var(--leaf)"/>').join("") + '</g>');
    s += L(5, '<g class="sway">' + [0, 72, 144, 216, 288].map(a => { const r = a * Math.PI / 180; return '<circle cx="' + (180 + Math.cos(r) * 5).toFixed(1) + '" cy="' + (48 + Math.sin(r) * 5).toFixed(1) + '" r="4.2" fill="var(--bloom)"/>'; }).join("") + '<circle cx="180" cy="48" r="2.6" fill="var(--goldtxt)"/></g>');
  } else {
    s += L(6, scTree(180, 1, "") + '<path class="bird" d="M120 30q4-4 8 0q4-4 8 0M146 22q3-3 6 0q3-3 6 0" fill="none" stroke="var(--mut)" stroke-width="1.4" stroke-linecap="round"/>');
    s += L(7, [[150, 70], [214, 60], [236, 78], [128, 54], [200, 40]].map(([x, y], k) => '<circle class="ff" style="--d:' + (-k * 1.3).toFixed(1) + 's" cx="' + x + '" cy="' + y + '" r="1.5" fill="var(--goldtxt)"/>').join(""));
  }
  return s + '</svg>';
}
// Aujourd’hui : le décor, et le passage de rang raconté une seule fois
function renderScene(Z){
  const i = Math.max(0, RANKS.indexOf(Z.rank)), host = $("scene"); if (!host) return;
  document.documentElement.dataset.tier = SC_TIER[i];
  const prev = S.seenRank == null ? i : RANKS.indexOf(S.seenRank), up = prev >= 0 && i > prev;
  host.innerHTML = scene(i, up); const cap = $("sceneCap"); cap.textContent = "";
  if (up) cap.append(el("b", null, "Nouveau rang : " + Z.rank), el("span", "mut", SC_NEW[i]));
  else cap.append(el("span", "mut", Z.rank + ", niveau " + Z.lvl + (i < RANKS.length - 1 ? ". Prochain rang : " + RANKS[i + 1] + "." : ".")));
  if (S.seenRank !== Z.rank) { S.seenRank = Z.rank; save(); }
  const mini = $("sceneMini"); if (mini) mini.innerHTML = scene(i, false);
}
// moment de la journée : seule la couleur du ciel du décor change, jamais le fond de la page
{ const h = new Date().getHours(); document.documentElement.dataset.tod = h >= 5 && h < 11 ? "matin" : h < 18 ? "jour" : h < 22 ? "soir" : "nuit"; }
document.addEventListener("visibilitychange", () => document.documentElement.classList.toggle("paused", document.hidden));
