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
  pl_full:["Mayūrāsana", "le paon, mais sans l’appui des coudes", "pas de nom classique : c’est la posture la plus proche"],
  pr_straddle:["d’Upaviṣṭa Koṇāsana à Adho Mukha Vṛkṣāsana", "de l’angle ouvert à l’arbre tourné vers le bas"],
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
  pr_manna:"L’une des figures de force les plus rares : les mains devant, le bassin loin derrière, les jambes qui montent vers le visage. Peu de gens la tiennent, et c’est ce qui la rend précieuse.",
  ul_full:"Ton propre enchaînement : l’équerre, l’équilibre, un bras de chaque côté, la planche. Tout ce que tu as construit, posé bout à bout, sans toucher le sol.",
  lo_elbow:"La Haṭha Yoga Pradīpikā, un texte du XVᵉ siècle, décrit déjà le paon, Mayūrāsana : le corps à l’horizontale, en appui sur les coudes.",
  lo_frog:"En sanskrit, kāka veut dire corbeau, et baka désigne un échassier. Le premier envol de beaucoup de pratiquants, sur les tapis de yoga comme au gymnase.",
  pr_lsit:"« Équerre », comme l’outil du menuisier : un angle droit net entre le buste et les jambes, porté par les bras.",
  pl_tuck:"La première planche, celle qui fait décoller les pieds. Tout le corps se ramasse au-dessus des mains, prêt à s’allonger.",
  in_mexican:"Le dos se cambre, les pieds descendent vers la tête : une figure qu’on retrouve chez les contorsionnistes et les équilibristes.",
  pr_vsitC:"Nāvāsana, le bateau du yoga, en version gymnaste : sur les mains, les jambes hautes, comme une coque qui fend l’eau.",
};
const yogaOf = id => YOGA[id] || null;
// couronne de laurier dorée autour des figures maîtresses : deux branches de feuilles qui montent de part et d’autre
function laurel(){
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
function renderSommet(){
  const box = $("sommet"); if (!box) return; box.textContent = "";
  const P = plan(), todo = [...MAITRES].filter(id => MS[id] && !st(id).done); if (!todo.length) { box.hidden = true; return; }
  const id = todo.reduce((a, b) => (P.fin[b] || 999) < (P.fin[a] || 999) ? b : a), m = MS[id];
  const anc = new Set(), walk = i => (MS[i].req || []).forEach(r => { if (MS[r] && !anc.has(r)) { anc.add(r); walk(r); } }); walk(id);
  const done = [...anc].filter(r => reqDone(r)).length, tot = anc.size || 1, pct = Math.round(done / tot * 100), y = yogaOf(id);
  box.hidden = false;
  const near0 = Object.values(MS).filter(f => !f.alt && !st(f.id).done && !msLocked(f) && f.target && P.fin[f.id] > 0).map(f => [f, P.fin[f.id]]).sort((a, b) => a[1] - b[1])[0], aid = near0 ? near0[0].id : id;
  const art = el("span","smart"), sp = el("span","sp"); sp.dataset.pose = poseId(aid); sp.dataset.anim = aid; sp.dataset.lk = ""; sprPaint(sp, 88); art.append(sp);   // la figure de la prochaine victoire
  if (!near0) { const wr = el("span","laurel"); wr.innerHTML = laurel(); art.prepend(wr); }
  // d’abord la victoire proche (une figure ouverte, datée en semaines), puis le sommet, avec une fourchette plutôt qu’une date lointaine
  const g = el("span","grow");
  if (near0) g.append(el("span","lab","Prochaine victoire"), el("b","smn", near0[0].name + ", " + (near0[0].type === "reps" ? near0[0].target + " répétitions" : goalTxt(near0[0]))), el("span","mut", (t => /^vers/.test(t) ? "V" + t.slice(1) : "Vers " + t)(dateTxt(near0[1])) + "."));
  const fw = P.fin[id], rng = fw ? (t => /^(vers|entre)/.test(t) ? t : "vers " + t)(rangeTxt(fw)) : "";
  const bar = el("span","smbar"), i = el("span"); i.style.width = pct + "%"; bar.append(i);
  const sl = el("span","lab smlab"); sl.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z" fill="currentColor"/></svg>'; sl.append(" Ton prochain sommet : " + m.name);
  g.append(sl, bar, el("span","mut", done + (done > 1 ? " étapes franchies sur " : " étape franchie sur ") + tot + (rng ? ", " + rng : "") + "."));
  box.append(art, g); box.onclick = () => { showTab("path"); goHere(aid); setTimeout(() => quick(aid), 500); };
  box.setAttribute("aria-label", "Ton prochain sommet : " + m.name + ", " + pct + " % du chemin");
}
// les trois grandes disciplines : leur figure maîtresse, leur nom en yoga, une ligne d’histoire
const DISC = {
  onearm:{fig:"oa_oahs10", yoga:["Eka Hasta Vṛkṣāsana", "l’arbre sur une main"], h:"Le numéro roi des équilibristes de cirque : tout le corps posé sur une seule main, qui corrige au bout des doigts."},
  planche:{fig:"pl_full", yoga:["Mayūrāsana", "le paon, sa plus proche cousine"], h:"Le mot est français et a fait le tour du monde : le corps à l’horizontale, porté par des bras tendus, l’un des grands éléments de force de la gymnastique."},
  press:{fig:"pr_stalder", yoga:["d’Upaviṣṭa Koṇāsana à Adho Mukha Vṛkṣāsana", "de l’angle ouvert à l’arbre tourné vers le bas"], h:"Monter en équilibre sans élan, par la seule force et la souplesse. Le stalder doit son nom au gymnaste suisse Josef Stalder, champion olympique en 1948."},
};
