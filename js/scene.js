// Le décor de l’en-tête grandit avec le rang : une graine, une pousse, un arbre, une forêt, puis la montagne, le ciel et les étoiles.
// Un seul SVG par affichage, des aplats aux couleurs du thème, quelques animations douces (balancement, scintillement).
"use strict";
const SC_STARS = [[28,18],[64,40],[96,14],[132,30],[150,10],[214,20],[238,42],[262,12],[300,34],[332,16],[348,44],[110,52]];
const SC_TIER = [0,0,0,1,1,1,2,2,2,3,3,3];
const SC_NEW = ["Une graine dans la terre : tout commence.", "Une pousse sort de terre.", "Les racines s’installent sous la surface.", "La tige monte vers la lumière.",
  "Les premières feuilles s’ouvrent.", "Une fleur éclot en haut de la tige.", "La plante est devenue un arbre, des oiseaux s’y posent.", "D’autres arbres poussent autour : une forêt.",
  "Une montagne se dessine derrière la forêt.", "Des nuages passent dans le ciel.", "Les premières étoiles s’allument.", "La Voie lactée traverse le ciel."];
// rendu aquarelle : formes aux bords irréguliers (filtre de déplacement), lavis transparents superposés, grain du papier ; seule la pousse d’un nouveau rang s’anime sous le filtre, une fois
let scSeed = 1; const scRnd = () => (scSeed = (scSeed * 16807) % 2147483647) / 2147483647;
function blob(cx, cy, rx, ry, n, j){   // tache ronde irrégulière, comme une goutte de lavis
  const k = n || 9, pts = Array.from({length:k}, (_, a) => { const t = a / k * Math.PI * 2, r = 1 - (j == null ? .3 : j) / 2 + scRnd() * (j == null ? .3 : j); return [cx + Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r]; });
  let d = "M" + ((pts[0][0] + pts[k - 1][0]) / 2).toFixed(1) + " " + ((pts[0][1] + pts[k - 1][1]) / 2).toFixed(1);
  pts.forEach((p, a) => { const q = pts[(a + 1) % k]; d += "Q" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " " + ((p[0] + q[0]) / 2).toFixed(1) + " " + ((p[1] + q[1]) / 2).toFixed(1); });
  return d + "Z";
}
const wash = (d, c, o) => '<path d="' + d + '" fill="' + c + '" fill-opacity="' + (o || .55) + '"/>';
const wash2 = (cx, cy, rx, ry, c, o) => wash(blob(cx, cy, rx, ry), c, o) + wash(blob(cx + rx * .12, cy - ry * .1, rx * .78, ry * .72), c, (o || .55) * .8);   // deux couches : le centre plus chargé
function scTree(x, s, far){   // arbre : tronc effilé, couronne de lavis verts superposés (plus pâle et bleuté au loin)
  const g = far ? "var(--wc-far)" : "var(--wc-leaf)", g2 = far ? "var(--wc-far)" : "var(--wc-leaf2)";
  return '<g transform="translate(' + x + ' 95) scale(' + s + ')">' + wash("M-3 0C-2-14-3-26-1-36L1-36C3-26 2-14 4 0Z", "var(--wc-wood)", .8)
    + '<path d="M0-24Q-7-30-12-38M1-28Q7-33 12-40" fill="none" stroke="var(--wc-wood)" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>'
    + wash2(0, -52, 24, 20, g, .5) + wash2(-15, -42, 15, 13, g2, .45) + wash2(15, -42, 16, 13, g, .45) + wash2(2, -62, 13, 11, g2, .35) + '</g>';
}
function scene(i, fresh, sfx){
  const u = sfx || "t";   // identifiants de filtre propres à chaque décor (Aujourd’hui et Profil coexistent)
  scSeed = 7;   // mêmes taches à chaque affichage
  const L = (n, svg) => i >= n ? '<g' + (fresh && n === i ? ' class="grow"' : "") + '>' + svg + '</g>' : "";
  let s = '<svg class="scene" viewBox="0 0 360 120" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Ton décor au rang ' + RANKS[i] + '">'
    + '<defs><filter id="wc-' + u + '" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="4" result="n"/>'
    + '<feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".5"/></filter>'
    + '<filter id="wcs-' + u + '" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>'
    + '<filter id="paper-' + u + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .4 0 0 0 0 .33 0 0 0 .14 0"/></filter></defs>';
  s += '<rect width="360" height="120" fill="var(--scsky)"/><rect y="104" width="360" height="16" fill="var(--wc-soil)" fill-opacity=".9"/><g filter="url(#wc-' + u + ')">';
  // ciel : quelques lavis très dilués
  s += '<g filter="url(#wcs-' + u + ')">' + wash(blob(90, 26, 120, 30, 11), "var(--wc-sky)", .45) + wash(blob(280, 44, 130, 26, 11), "var(--wc-sky2)", .4) + (i >= 10 ? wash(blob(180, 30, 220, 40, 11), "var(--wc-night)", .5) : "") + '</g>';
  const tod = document.documentElement.dataset.tod || "jour";
  if (i < 11) s += tod === "nuit" || i >= 10 ? wash(blob(300, 26, 9, 9, 8), "var(--raise)", .9) + '<circle cx="304" cy="23" r="7.5" fill="var(--scsky)"/>'
    : wash(blob(tod === "matin" ? 60 : tod === "soir" ? 304 : 290, tod === "jour" ? 28 : 60, 14, 14, 12, .06), "var(--sun)", .55) + wash(blob(tod === "matin" ? 61 : tod === "soir" ? 305 : 291, tod === "jour" ? 27 : 59, 10, 10, 12, .06), "var(--sun)", .45);
  s += L(11, wash(blob(180, 36, 190, 12, 13), "var(--wc-sky2)", .45) + wash(blob(322, 24, 9, 9, 8), "var(--raise)", .9));
  s += L(9, wash(blob(70, 30, 30, 8), "var(--wc-cloud)", .8) + wash(blob(84, 25, 16, 7), "var(--wc-cloud)", .7) + wash(blob(270, 22, 28, 7), "var(--wc-cloud)", .75));
  s += L(8, wash("M-10 94L48 62Q60 54 72 64L104 82L160 44Q170 38 180 46L236 86L280 62Q292 56 304 64L370 88V110H-10Z", "var(--wc-hill)", .55) + wash("M0 96L70 76L130 90L200 70L270 92L360 80V100H0Z", "var(--wc-hill)", .35));
  s += L(7, scTree(80, .55, 1) + scTree(258, .62, 1) + scTree(304, .46, 1));
  // la terre : deux lavis ocre, un vert d’herbe
  s += wash("M-10 96Q90 86 180 93T370 90V140H-10Z", "var(--wc-soil)", .65) + wash("M-10 102Q120 94 220 100T370 98V140H-10Z", "var(--wc-soil)", .5) + wash("M0 95Q60 90 120 94Q80 98 0 99Z", "var(--wc-leaf)", .35) + wash("M250 92Q310 88 360 90V96Q300 95 250 92Z", "var(--wc-leaf)", .35);
  if (i < 6) {
    s += '<g transform="translate(180 97) scale(1.45) translate(-180 -97)">';
    s += L(2, '<path d="M180 98q-5 7-13 11q-4 2-7 6M180 98q2 8 0 15M180 98q6 6 14 9q3 2 6 6" fill="none" stroke="var(--wc-wood)" stroke-width="1.3" stroke-linecap="round" opacity=".55"/>');
    s += i === 0 ? wash2(180, 98, 6, 4, "var(--wc-wood)", .8) : "";
    s += L(1, '<path d="' + (i >= 3 ? "M180 97C183 82 177 68 180 50" : "M180 97Q182 89 180 82") + '" fill="none" stroke="var(--wc-leaf2)" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>'
      + wash("M180 85C174 78 166 79 163 83C168 88 175 88 180 85Z", "var(--wc-leaf)", .7) + wash("M180 85C186 78 194 79 197 83C192 88 185 88 180 85Z", "var(--wc-leaf)", .7));
    s += L(4, [[74, -1], [67, 1], [61, -1], [56, 1]].map(([y, d]) => wash("M180 " + y + "C" + (180 + d * 6) + " " + (y - 9) + " " + (180 + d * 16) + " " + (y - 8) + " " + (180 + d * 20) + " " + (y - 5) + "C" + (180 + d * 14) + " " + (y + 1) + " " + (180 + d * 6) + " " + (y + 2) + " 180 " + y + "Z", d > 0 ? "var(--wc-leaf)" : "var(--wc-leaf2)", .6)).join(""));
    s += L(5, [0, 72, 144, 216, 288].map(a => { const r = (a - 90) * Math.PI / 180; return wash(blob(180 + Math.cos(r) * 5.5, 47 + Math.sin(r) * 5.5, 5, 5, 7), "var(--bloom)", .6); }).join("") + wash2(180, 47, 2.6, 2.6, "var(--sun)", .9));
    s += '</g>';
  } else {
    s += L(6, scTree(180, 1, 0));
  }
  s += '</g>';
  // détails nets, hors filtre : étoiles qui scintillent, oiseaux, lucioles
  s += L(10, SC_STARS.map(([x, y], k) => '<circle class="tw" style="--d:' + (k * 0.37).toFixed(2) + 's" cx="' + x + '" cy="' + y + '" r="' + (0.7 + (k % 3) * 0.3) + '" fill="var(--goldtxt)" opacity=".8"/>').join(""));
  if (i >= 6) s += L(6, '<path class="bird" d="M120 30q4-4 8 0q4-4 8 0M146 22q3-3 6 0q3-3 6 0" fill="none" stroke="var(--mut)" stroke-width="1.2" stroke-linecap="round"/>')
    + L(7, [[150, 70], [214, 60], [236, 78], [128, 54], [200, 40]].map(([x, y], k) => '<circle class="ff" style="--d:' + (-k * 1.3).toFixed(1) + 's" cx="' + x + '" cy="' + y + '" r="1.5" fill="var(--goldtxt)"/>').join(""));
  return s + '<rect width="360" height="120" filter="url(#paper-' + u + ')"/></svg>';
}
// Aujourd’hui : le décor, et le passage de rang raconté une seule fois
function renderScene(Z){
  const i = Math.max(0, RANKS.indexOf(Z.rank)), host = $("scene"); if (!host) return;
  document.documentElement.dataset.tier = SC_TIER[i];
  // un nouveau rang se raconte quand Aujourd’hui est à l’écran ; la légende reste jusqu’au lendemain
  const prev = S.seenRank == null ? i : RANKS.indexOf(S.seenRank), seen = $("v-today").classList.contains("on") && !document.querySelector("dialog[open]"), up = prev >= 0 && i > prev && seen;
  if (up) { S.seenRank = Z.rank; S.rankUpT = Date.now(); save(); } else if (S.seenRank == null) { S.seenRank = Z.rank; save(); }
  host.innerHTML = scene(i, up); const cap = $("sceneCap"); cap.textContent = "";
  if (S.rankUpT && Date.now() - S.rankUpT < 864e5 && S.seenRank === Z.rank) cap.append(el("b", null, "Nouveau rang : " + Z.rank), el("span", "mut", SC_NEW[i]));
  else cap.append(el("span", "mut", Z.rank + ", niveau " + Z.lvl + (i < RANKS.length - 1 ? ". Prochain rang : " + RANKS[i + 1] + "." : ".")));
  const mini = $("sceneMini"); if (mini) mini.innerHTML = scene(i, false, "m");
}
// moment de la journée : seule la couleur du ciel du décor change, jamais le fond de la page
const scTod = () => { const h = new Date().getHours(), t = h >= 5 && h < 11 ? "matin" : h < 18 ? "jour" : h < 22 ? "soir" : "nuit", ch = document.documentElement.dataset.tod !== t; document.documentElement.dataset.tod = t; return ch; };
scTod();
document.addEventListener("visibilitychange", () => { document.documentElement.classList.toggle("paused", document.hidden); if (!document.hidden && scTod() && typeof render === "function") render(); });
