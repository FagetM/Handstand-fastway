// Les figures racontées : leur nom en yoga quand il existe (sanskrit translittéré, traduit), une petite histoire,
// et les figures maîtresses, celles qui couronnent un chemin. Ton doux, faits vérifiés, pas de légende présentée comme un fait.
"use strict";
const ARBRE = ["Adho Mukha Vṛkṣāsana", "l’arbre tourné vers le bas"];
// [nom en yoga, ce qu’il veut dire, nuance éventuelle]
const YOGA = {
  fd_plank:["Phalakāsana", "la planche (du yoga)"],
  fd_push:["Caturaṅga Daṇḍāsana", "le bâton sur quatre appuis", "la descente de la pompe"],
  fd_c2w:[ARBRE[0], ARBRE[1], "ici, face au mur"],
  st_split:[ARBRE[0], ARBRE[1], "jambes en ciseaux, au mur"],
  b1_free5:[ARBRE[0], ARBRE[1], "jambes en ciseaux"],
  b2_str15:ARBRE, in_str40:ARBRE, in_str60:ARBRE, in_tuck:[ARBRE[0], ARBRE[1], "groupé"],
  oa_strad30:[ARBRE[0], ARBRE[1], "jambes écartées"],
  in_mexican:["Vṛścikāsana", "le scorpion", "une cousine : en yoga, le scorpion se fait souvent sur les avant-bras"],
  oa_oahs:["Eka Hasta Vṛkṣāsana", "l’arbre sur une main", "un nom moderne, pas un texte ancien"],
  oa_oahsw:["Eka Hasta Vṛkṣāsana", "l’arbre sur une main", "un nom moderne"],
  oa_oahs10:["Eka Hasta Vṛkṣāsana", "l’arbre sur une main", "un nom moderne"],
  lo_frog:["Kākāsana et Bakāsana", "le corbeau (bras fléchis) et l’échassier (bras tendus)"],
  lo_elbow:["Mayūrāsana", "le paon", "le paon se tient sur les deux coudes, sous le ventre"],
  lo_croc:["Mayūrāsana", "le paon", "un proche cousin : la même idée, les coudes contre les hanches"],
  pr_lsit:["Daṇḍāsana", "le bâton", "mais soulevé du sol, sur les mains"],
  pr_stradL:["Upaviṣṭa Koṇāsana", "l’angle ouvert assis", "mais soulevé du sol, sur les mains"],
  pr_vsitC:["Nāvāsana", "le bateau", "une cousine : le bateau se tient sans les mains"],
  pr_extSup:["Pūrvottānāsana", "l’étirement intense de l’est", "l’est, c’est le devant du corps"],
  pl_tuck:["Lolāsana", "le pendentif", "une petite sœur : le pendentif se fait jambes croisées"],
  pl_full:[null, "pas de nom classique", "la posture la plus proche est Mayūrāsana, le paon, mais elle prend appui sur les coudes"],
  pr_straddle:["de Prasārita Pādottānāsana à Adho Mukha Vṛkṣāsana", "de la pince jambes écartées, debout, à l’arbre tourné vers le bas"],
  pr_pike:["de Paścimottānāsana à Adho Mukha Vṛkṣāsana", "de la pince à l’arbre tourné vers le bas"],
};
// figures maîtresses : le sommet de chaque chemin
const MAITRES = new Set(["in_str60", "oa_oahs10", "pl_full", "pr_stalder", "pr_manna", "ul_full"]);
const HIST = {
  in_str60:"En France, les gymnastes l’appellent l’ATR, l’appui tendu renversé. Une minute de calme tête en bas : c’est la base de tout ce qui suit, et un vrai sommet en soi.",
  b2_str15:"Au gymnase, on dit ATR : appui tendu renversé. Le corps entier en une seule ligne, comme un fil à plomb.",
  oa_oahs:"Longtemps, l’équilibre sur un bras a été le numéro des équilibristes de cirque. Il se construit lentement, souvent sur des années : la patience fait partie de la figure.",
  oa_oahs10:"Le sommet du chemin un bras : dix secondes de chaque côté, le côté faible compris. Les équilibristes de cirque en ont fait un art. Ici, on y vient pas à pas.",
  pl_full:"Le mot est français : la planche, en anglais comme ailleurs, a gardé son nom d’origine. Aux anneaux et au sol, c’est l’un des éléments de force les plus admirés de la gymnastique.",
  pr_stalder:"Elle emprunte son nom au « stalder » de la barre fixe, l’élément du gymnaste suisse Josef Stalder, champion olympique à la barre fixe en 1948. Ici, la même ouverture des jambes, mais au sol, vers l’équilibre.",
  pr_manna:"L’une des figures de force les plus rares : les mains au sol derrière le bassin, doigts vers l’arrière, le bassin poussé loin devant elles, les jambes qui montent vers le visage. Peu de gens la tiennent.",
  ul_full:"Ton propre enchaînement : l’équerre, l’équilibre, un bras de chaque côté, la planche. Tout ce que tu as construit, posé bout à bout, sans toucher le sol.",
  lo_elbow:"La Haṭha Yoga Pradīpikā, un texte du XVᵉ siècle, décrit déjà le paon, Mayūrāsana : le corps à l’horizontale, en appui sur les coudes.",
  lo_frog:"En sanskrit, kāka veut dire corbeau, et baka désigne un échassier. Le premier envol de beaucoup de pratiquants, sur les tapis de yoga comme au gymnase.",
  pr_lsit:"« Équerre », comme l’outil du menuisier : un angle droit net entre le buste et les jambes, porté par les bras.",
  pl_tuck:"La première planche, celle qui fait décoller les pieds. Tout le corps se ramasse au-dessus des mains, prêt à s’allonger.",
  in_mexican:"Le dos se cambre, les pieds descendent vers la tête : une figure qu’on retrouve chez les contorsionnistes et les équilibristes.",
  pr_vsitC:"Nāvāsana, le bateau du yoga, en version gymnaste : sur les mains, les jambes hautes.",
};
const yogaOf = id => YOGA[id] || null;
// couronne de laurier dorée autour des figures maîtresses : deux branches de feuilles qui montent de part et d’autre
function laurel(){ return laurel.v || (laurel.v = laurelCalc()); }
function laurelCalc(){
  let leaves = ""; const R = 74, C = 90, deg = Math.PI / 180, P = f => [(C + R * Math.sin(f * deg)).toFixed(1), (C + R * Math.cos(f * deg)).toFixed(1)];
  [-1, 1].forEach(sd => { for (let k = 0; k < 8; k++) { const f = (28 + k * 17) * deg;   // de bas en haut, de part et d’autre
    const x = C + sd * R * Math.sin(f), y = C + R * Math.cos(f), tan = Math.atan2(-Math.sin(f), sd * Math.cos(f)) / deg;
    [-1, 1].forEach(side => { const ox = x + side * 5 * Math.sin(f) * sd, oy = y + side * 5 * Math.cos(f), rot = tan + 90 + side * 35;
      leaves += '<ellipse cx="' + ox.toFixed(1) + '" cy="' + oy.toFixed(1) + '" rx="3.4" ry="8" transform="rotate(' + rot.toFixed(0) + ' ' + ox.toFixed(1) + ' ' + oy.toFixed(1) + ')" fill="var(--gold)" fill-opacity="' + (side > 0 ? .85 : .6) + '"/>'; }); } });
  const sparks = [[18, 52, 0], [164, 40, 1.1], [158, 132, 2.1]].map(([x, y, d]) => '<path class="spk" style="--d:' + d + 's" d="M' + x + ' ' + (y - 6) + 'L' + (x + 1.5) + ' ' + (y - 1.5) + 'L' + (x + 6) + ' ' + y + 'L' + (x + 1.5) + ' ' + (y + 1.5) + 'L' + x + ' ' + (y + 6) + 'L' + (x - 1.5) + ' ' + (y + 1.5) + 'L' + (x - 6) + ' ' + y + 'L' + (x - 1.5) + ' ' + (y - 1.5) + 'Z" fill="var(--gold)"/>').join("");
  const a = P(28), b = P(147);
  return '<svg viewBox="0 0 180 180" aria-hidden="true"><path d="M' + (2 * C - a[0]) + ' ' + a[1] + 'A' + R + ' ' + R + ' 0 0 1 ' + (2 * C - b[0]) + ' ' + b[1] + 'M' + a[0] + ' ' + a[1] + 'A' + R + ' ' + R + ' 0 0 0 ' + b[0] + ' ' + b[1] + '" fill="none" stroke="var(--gold)" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>' + leaves + sparks + '</svg>';
}
// Aujourd’hui : le prochain sommet, celui qui donne envie d’y aller
// ---------- La quête principale : l’objectif choisi, où on en est, quand on y sera, et la prochaine étape ----------
// étapes = les figures du chemin de l’objectif (hors variantes) ; « ouvertes » = celles qu’on peut travailler maintenant, la plus proche d’abord
function questState(){
  const G = goalOf(), P = plan(), ids = G.ms.filter(id => MS[id] && !MS[id].alt), ok = id => st(id).done || eqSkip(id), done = ids.filter(ok).length, tot = ids.length || 1;
  const top = goalTop(), left = ids.filter(id => !ok(id)), wk = planWk(P, MS[top] && !st(top).done ? [top] : left);
  const open = left.filter(id => !msLocked(MS[id])).map(id => [id, P.fin[id] || 0]).sort((a, b) => (a[1] || 999) - (b[1] || 999));
  return {G, P, ids, ok, done, tot, pct:Math.floor(done / tot * 100), wk, left, open, next:open[0] || null};
}
// « dans 12 jours », puis en semaines, mois ou années quand c’est loin
const inTxt = wk => { const d = Math.max(1, Math.round(wk * 7)); return d < 60 ? "dans " + d + " jour" + (d > 1 ? "s" : "") : "dans ≈ " + gainTxt(wk); };
const stepTxt = m => m.name + (m.target ? ", " + (m.type === "reps" ? m.target + " répétitions" : goalTxt(m)) : "");
const questBar = pct => { const bar = el("span","smbar"), i = el("span"); i.style.width = pct + "%"; bar.append(i); return bar; };
function renderSommet(){
  const box = $("sommet"); if (!box) return; box.textContent = ""; box.hidden = false;
  const Q = questState(), head = el("span","qhead"), num = el("span","qpct"); num.append(el("b",null, String(Q.pct)), el("i",null," %"));
  { const g = el("span","grow"); g.append(el("span","lab","Quête principale"), el("b","smn", Q.G.name)); head.append(g, num); }
  box.append(head, questBar(Q.pct));
  if (!Q.left.length) { box.append(el("span","mut","Quête accomplie : les " + Q.tot + " étapes sont validées. Choisis ta prochaine quête."));
    box.setAttribute("aria-label","Quête principale accomplie : " + Q.G.name); box.onclick = questOpen; return; }
  box.append(el("span","mut", Q.done + (Q.done > 1 ? " étapes sur " : " étape sur ") + Q.tot + (Q.wk ? " · arrivée estimée " + (t => /^(vers|entre)/.test(t) ? t : "en " + t)(rangeTxt(Q.wk)) : "")));
  if (Q.next) { const m = MS[Q.next[0]], row = el("span","qnext"), g = el("span","grow");
    g.append(el("span","lab","Prochaine étape"), el("b",null, stepTxt(m)), el("span","mut", Q.next[1] ? inTxt(Q.next[1]) + ", " + dateTxt(Q.next[1]) : "à valider en séance"));
    row.append(figSp(m.id, 64), g); box.append(row); }
  box.setAttribute("aria-label","Quête principale : " + Q.G.name + ", " + Q.pct + " pour cent. Ouvrir la quête."); box.onclick = questOpen;
}
