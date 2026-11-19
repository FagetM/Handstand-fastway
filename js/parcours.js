// Plans d’entraînement par figure, parcours, coffres, estimation, carte rapide, quête.
"use strict";
// ---------- Accompagnement : un plan concret pour passer au niveau suivant de chaque jalon ----------
// Ces plans sont des repères généraux d’entraînement (les miens, pas ceux des programmes) : volume modéré, souvent, sans aller à l’échec.
const PLAN_PROG = {pl_lean:["planche-domination",0], pl_tuck:["planche-domination",1], pl_adv:["planche-domination",2], pl_frog:["planche-domination",3],
  pl_lean2:["planche-domination",0], pl_tuckP:["planche-domination",1], pl_tuckPu:["planche-domination",1], pl_tuckO:["planche-domination",2], pl_strBand:["planche-domination",5], pl_strBandL:["planche-domination",5], pl_strNar:["planche-domination",6], pl_half:["planche-domination",6], pl_fullBand:["planche-domination",6], pl_fullNeg:["planche-domination",6], pl_1leg:["planche-domination",4], pl_pike:["planche-domination",4], pl_straddle:["planche-domination",5], pl_full:["planche-domination",6],
  pr_straddle:["quest-for-the-press",0], pr_pike:["quest-for-the-press",0], pr_stalder:["quest-for-the-press",0], pr_negS:["quest-for-the-press",0], pr_elev:["quest-for-the-press",0], pr_stradL:["quest-for-the-press",0], pr_lsit:["quest-for-the-press",0], pr_lsitHs:["quest-for-the-press",0]};
// ton matériel : un banc et des briques de yoga changent la consigne de certaines figures et de certains exercices
const EQ_NOTE = {
  bench:{pl_strElev:"Pieds sur ton banc.", pl_fullElev:"Pieds sur ton banc.", fd_pushInc:"Sur ton banc : la bonne hauteur pour commencer.", fd_dipsB:"Sur ton banc.", fd_pike:"Pieds sur ton banc.", pr_elev:"Pieds sur ton banc.", pr_extSup:"Mains sur le bord de ton banc pour commencer.",
    epaules:"Mains sur ton banc.", pikepu:"Pieds sur ton banc pour plus de difficulté.", elevpress:"Pieds sur ton banc."},
  rings:{fd_support:"Aux anneaux : mains tournées vers l’extérieur quand c’est stable.", fd_dips:"Aux anneaux quand les barres deviennent faciles.", pl_protr:"Possible aux anneaux bas, plus instable.", pl_lean:"Aux anneaux bas plus tard : la même ligne, plus instable."},
  blocks:{pr_lsit:"Mains sur deux briques : les talons passent plus facilement.", pr_stradL:"Mains sur deux briques.", pr_vsit:"Mains sur deux briques.", pr_vsitC:"Mains sur deux briques.", pr_halfSt:"Sur deux briques.",
    pr_mannaP:"Mains sur deux briques, dos au mur.", pr_walk:"Mains sur deux briques si le sol est loin.", pr_float:"Mains sur deux briques si le sol est loin.", pr_stalPart:"Sur deux briques debout.", pr_stalder:"Sur deux briques debout.",
    pliage:"Une brique sous les mains si le sol est loin.", ecartF:"Une brique sous le bassin.", ecartAP:"Une brique sous la cuisse avant.", demiEcart:"Une brique sous chaque main.", fente:"Une brique sous chaque main.",
    pancake:"Une brique sous les mains au début.", pont:"Mains sur deux briques calées contre le mur pour commencer.", pikeAct:"Mains sur deux briques : plus de place pour lever les talons."}};
const eqLine = k => { const E = S.equip || {}; return [E.bench && EQ_NOTE.bench[k], E.blocks && EQ_NOTE.blocks[k], E.rings && EQ_NOTE.rings[k]].filter(Boolean).join(" "); };
// étapes prévues sur parallettes : la variante sans matériel
const PARA_ALT = {pl_tuckP:"sur deux briques de yoga, ou au sol poings fermés.", fd_support:"sur deux chaises solides calées, deux briques, ou l’angle d’un plan de travail.", pr_elev:"mains sur deux piles de livres stables ou deux blocs de yoga, ou au sol doigts écartés.", pr_vsit:"au sol, mains à plat ou sur les poings, à côté des hanches.", pr_halfSt:"au sol, mains sur les poings ; descends moins bas.", pr_vsitC:"au sol, mains sur les poings ou sur deux blocs de yoga.", pr_extSup:"mains au sol derrière toi, doigts vers l’arrière, ou sur le bord d’un canapé.", pr_mannaP:"sur deux blocs de yoga ou deux piles de livres collées au mur.", pr_tuckUp:"deux chaises solides calées contre un mur, ou deux blocs de yoga hauts.", pr_stalPart:"sur deux blocs de yoga hauts.", pr_stalder:"sur deux blocs de yoga hauts ou deux chaises calées."};
// les repères de souplesse conseillés avant une figure (un conseil : ils ne bloquent rien)
const ROM_FOR = {pr_negP:[["pike",2]], pr_pike:[["pike",2]], pr_elev:[["pancake",1]], pr_straddle:[["pancake",1]], pr_stradL:[["pancake",1]], pr_stalder:[["pancake",2],["pike",2]],
  pr_vsitC:[["pike",3]], pr_mannaP:[["pike",3],["ext",2]], pr_vsitH:[["pike",4],["ext",2]], pr_manna:[["pike",4],["ext",3]], oa_strad30:[["pancake",1]], pl_straddle:[["pancake",1]], in_7s:[["pike",2]], in_7d:[["pike",2]], in_mexican:[["pont",2]]};
const SOUPLE = new Set(["in_7s","in_7d","in_toes7","pr_straddle","pr_pike","pr_stalder","pr_vsitC","pr_mannaP","pr_vsitH","pr_manna","pr_lsitHs","pr_lsitNeg","pl_pike","pl_straddle","oa_flaghoriz","oa_flagfloor","oa_strad30","oa_tuckflag"]);
const adaptOf = id => Math.max(0.6, Math.min(1.35, ((S.adapt || {})[id]) || 1));
// Douleur : chaque signalement est daté par zone. Éviction de 3 jours (7 si la même zone revient en 3 semaines),
// puis reprise par paliers : une semaine à 60 % sans tentative à fond, une semaine à 80 %.
const painLog = () => S.painLog || (S.painLog = S.pain ? [{t:S.pain, zone:S.painZone || "autre"}] : []);
// une douleur par zone : chaque zone suit ses propres phases, et c’est la plus restrictive qui compte
function painState(){ const L = painLog(); if (!L.length) return {phase:0, ease:1, zone:null};
  const one = last => { const again = L.filter(p => p.zone === last.zone && last.t - p.t < 21 * 864e5).length >= 2, ev = (again || last.zone === "coude" || last.zone === "epaule" ? 7 : 3) * 864e5, d = Date.now() - last.t;   /* coude, épaule : une semaine sans figures de force */
    return d < ev ? {phase:1, ease:0.6, zone:last.zone, days:Math.ceil((ev - d) / 864e5), again} : d < ev + 7 * 864e5 ? {phase:2, ease:0.6, zone:last.zone} : d < ev + 14 * 864e5 ? {phase:3, ease:0.8, zone:last.zone} : {phase:0, ease:1, zone:null}; };
  const lastBy = {}; L.forEach(p => { lastBy[p.zone] = p; });
  const rk = s => s.phase === 0 ? 9 : s.phase;   // phase 1 la plus stricte
  const all = Object.values(lastBy).map(one), top = Object.assign({}, all.sort((a, b) => rk(a) - rk(b) || (b.days || 0) - (a.days || 0))[0]);
  top.zones = all.filter(x => x.phase === 1).map(x => x.zone); return top; }   // zones : toutes celles encore au repos
const painRecent = () => painState().phase === 1;
// habiletés d’équilibre (y compris sur un bras) : des essais tenus jusqu’à la chute, pas des séries de force
const FREE = m => m.type === "hold" && ["b1","b2","inter","onearm"].includes(m.sec) && m.id !== "oa_wall" && !/^oa_(sidehold|finger|strarm)/.test(m.id);   // tenues avec appui : séries par côté, pas des essais libres   // un bras au mur : séries de force par côté
const FORCE = id => (/^(pl_|pr_)/.test(id) && !["pr_lift1","pr_walk","pr_float","pr_lsit","pr_stradL","pr_pikeLift","pr_stradLift","pr_vsit","pr_vsitC","pr_extSup"].includes(id)) || /^ul_/.test(id) || id === "fd_push" || id === "fd_dips" || id === "in_hspu";
// plateau : 3 semaines sans progrès (au moins 4 séances, meilleur temps +5 % au plus, aucune séance validée)
function plateau(id){
  const m = MS[id]; if (!m || st(id).done || m.type === "check" || (m.target && st(id).best >= m.target)) return null;   // cible déjà tenue : il reste à valider, pas un plateau
  const since = Date.now() - 60 * 864e5, byDay = {};   /* les 6 dernières séances de la figure (3 contre 3), sur 2 mois au plus */
  logsOf(id).filter(l => l.t >= since && !SFX_ALL.test(l.id)).forEach(l => { const d = dayKey(l.t); byDay[d] = Math.max(byDay[d] || 0, l.v); });
  const days = Object.keys(byDay).sort((a, b) => dk(a) - dk(b)).slice(-6); if (days.length < 6 || hitInfo(id).days) return null;
  const tr = trend(id); if (!tr || tr.span < 14 || tr.pct >= 1) return null;   /* la pente sur 8 séances : moins de 1 % par semaine sur 2 semaines, c’est un plateau */
  const fbs = (S.fb || []).filter(f => f.t >= since), hard = fbs.filter(f => f.k === "hard" || f.k === "pain").length;
  return adaptOf(id) <= 0.7 ? "beaucoup de séries ratées : la charge était trop haute" : hard >= 2 ? "des séances ressenties dures ou douloureuses" : days.length < 6 && new Set(S.log.filter(l => l.t >= since).map(l => dayKey(l.t))).size < 8 ? "des séances un peu espacées" : "le corps consolide : une semaine plus légère débloque souvent la suite";
}
// semaine plus légère sur une figure en plateau (déclenchée une fois toutes les 3 semaines), puis on repart d’une charge neutre
function lightWeek(id){ const ph = painState().phase; if ((ph === 2 || ph === 3) && (FORCE(id) || /^oa_/.test(id))) return true;   /* retour après une douleur : un cran plus léger pendant deux semaines, même en semaine légère */
  if (deloadWeek()) return false;
  const d = (S.dl || {})[id]; return !!d && Date.now() - d < 7 * 864e5; }
function checkPlateau(id){ if (deloadWeek() || afterDeload()) return; const dl = S.dl || (S.dl = {}); if (dl[id] && Date.now() - dl[id] < 21 * 864e5) return; if ((S.dv || {})[id] && Date.now() - S.dv[id] < 21 * 864e5) return;
  if (plateau(id)) { const pn = S.pn || (S.pn = {}); pn[id] = (pn[id] || 0) + 1; if (pn[id] % 2) dl[id] = Date.now(); else (S.dv || (S.dv = {}))[id] = Date.now(); if (S.adapt) delete S.adapt[id]; } }   /* une fois sur deux : semaine légère, sinon variante (plus de séries, moins dures) */
// la règle de validation, en clair (même règle que hitTarget)
function valTxt(m){ const V = valRule(m.id); return "Validation : la cible atteinte sur " + V.n + " séances" + (V.gap > 1 ? ", espacées d’au moins " + V.gap + " jours" : ", jours différents") + (V.span ? ", sur " + V.span + " jours au moins" : "")
  + (SIDED.has(m.id) && !/^pl_/.test(m.id) ? ", des deux côtés" : "") + (/^pl_/.test(m.id) && m.type === "hold" ? (SIDED.has(m.id) ? ", avec 3 tentatives à la cible de chaque jambe à chaque fois" : ", avec 2 tentatives sur 3 à la cible à chaque fois") : "") + "."; }
function planFor(m){
  const x = st(m.id), L = lvls(m), k = lvlOf(m), out = {head:"", lines:[], short:"", n:null}; let T = nextStep(m);
  if (x.done) { out.head = "Figure maîtrisée"; out.short = "Entretien : une ou deux fois par semaine."; out.lines = ["Figure acquise. Reviens-y une ou deux fois par semaine pour l’entretenir, en échauffement des jalons suivants."]; return out; }
  const miss = (m.req||[]).filter(r=>!st(r).done);
  // Deux rythmes : l’équilibre est une habileté, elle se travaille presque tous les jours ; la force (planche, montées, un bras, équilibres bas) demande plus de récupération.
  const force = /^(pl_|pr_|lo_|ul_)/.test(m.id) || m.id === "in_hspu", prReps = (/^pr_/.test(m.id) && m.type === "reps" && !/Lift$|^pr_(walk|float)$/.test(m.id)) || ["pl_fullNeg","pl_hsDown","pl_halfPress"].includes(m.id),   /* les excentriques en full planche chargent le tendon du biceps : 4 × 1, repos complet */   /* les élévations se dosent comme des répétitions normales */ oaReps = m.sec === "onearm" && m.type === "reps", prSkill = prReps && /^pr_/.test(m.id) && !/[Nn]eg|halfSt/.test(m.id),   /* les descentes restent en 4 × 1 */ days = /^pr_(walk|float)$/.test(m.id) ? 4 : /^pl_/.test(m.id) ? ((S.goal === "planche" || (S.ex && S.ex.on && S.ex.prio === "pl")) && !profHeavy() ? 3 : 2) : prSkill ? 3 : /^pr_/.test(m.id) ? 2 : force ? 3 : m.sec === "onearm" ? 4 : 5,   /* comme les plafonds de la séance : 3 jours de force par semaine au plus, 4 jours un bras */
    sets = /^ul_/.test(m.id) ? 4 : oaReps ? 6 : prSkill ? 5 : prReps ? 4 : m.id === "oa_wall" ? 8 : /^pl_/.test(m.id) ? 5 : force ? 6 : 8, tries = oaReps || ["pl_fullNeg","pl_hsDown","pl_halfPress"].includes(m.id) ? 0 : prReps ? 1 : /^pl_/.test(m.id) ? 3 : 2;   // descentes de montée : 4 × 1, une tentative
  out.days = days;
  const freq = (prSkill ? "Jusqu’à " : "") + days + " séances par semaine" + (prSkill ? " : la montée est un geste technique, des séries courtes et fréquentes, toujours fraîches." : force ? " : un jour de repos entre deux, la force se construit pendant la récupération." : " : c’est une habileté, la fréquence compte plus que la durée.");
  // équilibre libre : c’est une habileté, on la travaille en essais tenus jusqu’à la perte d’équilibre
  const cap = capEst(m.id), R = readyMemo(), variant = !!((S.dv || {})[m.id] && Date.now() - S.dv[m.id] < 7 * 864e5);
  // capacité déjà au-dessus du palier : on saute directement au palier qui la dépasse (plus de semaines « trop faciles »)
  if (cap && cap.v > 0 && T && cap.v >= T && !lightWeek(m.id)) T = L.find(v => v > cap.v) || L[L.length - 1];
  if (FREE(m) && lightWeek(m.id) && k > 0) T = L[k - 1];   // semaine plus légère : le palier précédent, pas de validation
  if (FREE(m)) { const one = m.sec === "onearm" || SIDED.has(m.id), T0 = nextStep(m) || 0, n = m.sec === "onearm" ? 10 : one ? 8 : T0 >= 40 ? 8 : 15, rest = one ? 45 : Math.max(30, Math.min(60, T0));   // tenues longues : moins d’essais, plus de repos
    out.n = {sets:n, attempts:true, T, hold:true, work:T, tries:0, rest, sides:one};
    out.head = "Plan pour le niveau " + (Math.max(k, L.indexOf(T)) + 1) + " sur " + L.length + " : " + T + " s";
    out.short = "Jusqu’à " + n + " essais" + (one ? " par côté, en alternant" : "") + ", chacun tenu tant que c’est calme, " + rest + " s de repos. " + days + " séances par semaine.";
    out.lines = [freq, "À chaque séance : jusqu’à " + n + " montées" + (one ? " par côté, en alternant gauche et droite (commence par ton côté faible)" : "") + ". Tiens chacune tant que c’est calme, sors proprement (roue ou retour sur les pieds), " + rest + " s de repos.",
      "Le chrono bipe à " + T + " s : le palier est acquis dès qu’un essai l’atteint.", x.best > 0 ? "Ton record : " + fmt(m, x.best) + "." : "Pas encore de record : chaque essai compte.",
      "Arrête la séance quand les montées deviennent brouillonnes.", valTxt(m)];
    if (miss.length) out.lines.unshift("D’abord : " + miss.map(r=>MS[r].name).join(" + ") + ".");
    return out; }
  if (m.type === "check"){
    out.n = {sets, check:true};
    out.head = "Plan pour réussir cette figure"; out.short = sets + " essais par séance, " + days + " séances par semaine.";
    out.lines = [freq, "À chaque séance : " + sets + " essais ; " + (/^ul_/.test(m.id) ? "une réussite par séance compte, il en faut sur 3 séances espacées d’au moins 2 jours, sur 10 jours au moins." : "3 réussites dans une même séance comptent, il en faut sur 2 séances."), (FORCE(m.id) ? "Les autres jours : repos des épaules et des coudes, pas d’essai à froid." : "Les autres jours, 2 ou 3 essais à froid dans la journée entretiennent le geste."), "Quand le geste se dégrade, fais une pause.", "À chaque réussite propre, touche « Réussi aujourd’hui »."];
  } else {
    const hold = m.type === "hold", lo = hold ? Math.min(2, T) : 1;
    // charge de travail : les trois quarts du record quand il existe, sinon la moitié de la cible ; jamais plus de 80 % de la cible
    // charge adaptative : chaque séance règle un coefficient par figure (réussite, chutes, ressenti) ; une douleur récente allège
    const rH = v => hold && T <= 10 ? Math.round(v * 2) / 2 : Math.round(v);   /* tenues courtes : à la demi-seconde, sinon l’arrondi pèse trop */
    const fct = adaptOf(m.id) * Math.min(painRecent() ? 0.75 : 1, lightWeek(m.id) ? 0.7 : 1, variant ? 0.85 : 1) * R.r, B = cap && cap.v > 0 ? cap.v : x.best;   /* B : ta capacité estimée, pas ton record de toujours */
    const work = oaReps ? (lightWeek(m.id) ? Math.max(1, T - 1) : T) : prSkill ? Math.min(2, T) : prReps ? 1 : Math.max(lo, Math.min(Math.round(T * 0.85), B > 0 ? Math.round(B * 0.6 * R.r) : 0),   /* jamais sous 60 % de la capacité */ Math.min(T, Math.min(Math.round(T * 0.85), rH(Math.min(rH(T * 0.8), B > 0 ? rH(B * 0.75) : rH(T * 0.5)) * fct)))),   /* le travail reste sous la cible */ u = v => hold ? v + " s" : v + " répétition" + (v > 1 ? "s" : "");
    out.head = "Plan pour le niveau " + (Math.max(k, L.indexOf(T)) + 1) + " sur " + L.length + " : " + u(T);
    const tries2 = work >= T ? 0 : tries, tryT = cap && cap.v > 0 && cap.v * 1.05 < T && !(T === m.target && cap.v >= 0.85 * T) ? Math.max(work + (hold ? 1 : 0), Math.round(cap.v * 1.05)) : T;   /* tentatives : un peu au-dessus de ta capacité, jusqu’au palier */
    out.n = {sets:variant ? sets + 2 : sets, work, tries:tries2, T, tryT:Math.min(T, tryT), hold, sides:SIDED.has(m.id)}; out.why = whyLoad(m, cap, work, R, lightWeek(m.id) && !painRecent(), variant);
    // tentatives réellement données en séance : une seule pour la planche en répétitions ; par jambe ou par côté pour les figures de côté
    const nt = /^pl_/.test(m.id) && !hold ? Math.min(1, tries2) : tries2, ntSide = !SIDED.has(m.id) ? "" : /^pl_/.test(m.id) ? " par jambe" : " par côté", ntTxt = (nt > 1 ? nt + " tentatives" : "une tentative") + ntSide;
    out.short = sets + " × " + (hold ? work + " s" + (!SIDED.has(m.id) ? "" : /^pl_/.test(m.id) ? " par jambe" : " en alternant les côtés") : work + " rép.") + (nt ? ", puis " + ntTxt + " à " + (hold ? T + " s" : T + " rép.") : ""); out.short += (out.short.endsWith(".") ? " " : ". ") + (prSkill ? "Jusqu’à " : "") + days + " séances par semaine.";   /* pas de « rép.. » */
    out.lines = [freq,
      "À chaque séance : " + sets + " " + (hold ? "tenues de " + work + " s" + (/^pl_/.test(m.id) && SIDED.has(m.id) ? " par jambe" : "") : "séries de " + work + (work > 1 ? " répétitions" : " répétition")) + ", " + (r => r < 60 ? r + " s" : Math.floor(r / 60) + " min" + (r % 60 ? " " + r % 60 + " s" : ""))(restOf(m)) + " de repos entre chacune" + (hold ? " (" + (sets * work < 90 ? sets * work + " s" : num(sets * work / 60) + " min") + " de tenue au total)." : "."),
      (/^pl_/.test(m.id) ? (nt ? "Termine par " + ntTxt + " à " + u(T) + (nt > 1 ? ", " + (SIDED.has(m.id) ? "90 s" : "3 min") + " de repos entre chacune. " : ". ") : "") + (hold ? "Une tenue à la cible" : "Une tentative réussie") + " ouvre le niveau suivant ; la validation suit la règle ci-dessous, car les tendons aussi doivent être prêts."
        : (nt ? "Termine par " + ntTxt + " à " + u(T) + (nt > 1 ? ", avec " + (SIDED.has(m.id) ? "90 s" : "2 minutes") + " de repos entre chacune." : ".") + " Réussie, elle fait passer le palier ; " : "Une série à la cible fait passer le palier ; ") + "au dernier palier, la règle de validation s’applique."),
      force ? "Les jours sans séance : mobilité et souplesse, pas de force." : "Les jours sans séance, 2 ou 3 tenues courtes dans la journée entretiennent l’équilibre sans fatiguer.",
      x.best > 0 ? "Ton record : " + fmt(m, x.best) + ". Cible : " + u(T) + "." : "Pas encore de record : commence par une tentative pour voir où tu en es.",
      ["pl_fullNeg","pl_hsDown","pl_halfPress"].includes(m.id) ? "Toujours 4 répétitions isolées, repos complet : la progression vient de la lenteur et de la propreté, pas du volume." : "Quand tes séries restent propres, l’app augmente la charge d’elle-même, un peu après chaque séance réussie ; quand elles se dégradent, elle la baisse.",
      "Douleur au pli du coude, au poignet ou à l’avant de l’épaule : arrête la figure et signale-la. Si tu stagnes trois semaines, l’app allège cette figure une semaine."];
  }
  if (miss.length) out.lines.unshift("D’abord : " + miss.map(r=>MS[r].name).join(" + ") + ". Tu peux t’y essayer, mais le plan suppose ces bases.");
  if (m.type !== "check") out.lines.push(valTxt(m));
  if (out.why) out.lines.unshift(out.why);
  { const E = S.equip || {}, pa = PARA_ALT[m.id], eq = eqLine(m.id); if (pa && !E.para && !E.blocks) out.lines.unshift("Sans parallettes : " + pa); if (eq) out.lines.unshift("Ton matériel : " + eq); }   /* avec des briques, la consigne du matériel suffit */
  if (/^pr_(mannaP|vsitH|manna)$/.test(m.id)) out.lines.push("La manna se compte en années : chaque étape est une victoire.");
  { const R = (ROM_FOR[m.id] || []).map(([r, k]) => { const x = ROMI[r]; return x.name + " : " + x.lv[k].toLowerCase() + (romLv(r) >= k ? " ✓" : ""); });
    if (R.length) out.lines.push("Souplesse conseillée : " + R.join(" · ")); }
  if (SOUPLE.has(m.id) && !ROM_FOR[m.id]) { const R = ROM.filter(r => r.for.includes(m.sec) || (/^pr_(manna|vsit|extSup|mannaP)/.test(m.id) && r.for.includes("manna"))).slice(0, 3);
    out.lines.push("La souplesse compte ici" + (R.length ? " : " + R.map(r => r.name.toLowerCase()).join(", ") : "") + ". Mesure-la dans Profil, Ma souplesse ; 5 minutes actives après la séance et les jours de récup la font avancer."); }
  const pp = PLAN_PROG[m.id]; if (pp && PS[pp[0]] && !progLock(pp[0])) out.prog = pp;
  return out;
}
function openProg(pid, step){ pg().cur = pid; if (step != null) { pickP(); pp().step = step; } save(); render(); showTab("today"); window.scrollTo(0, 0); }

// ---------- Le parcours : une seule carte, de haut en bas. Tronc commun, puis le niveau difficile et ses trois voies. ----------
// un coffre s’ouvre quand les figures du chemin de l’étage sont validées (les bonus hors chemin ne comptent pas)
function chestOpen(s){ return !!s && s.ms.filter(m=>!m.alt).every(m=>reqDone(m.id)); }
// Coffres : un par étage, ouvert quand l’étage est terminé ; chacun débloque une tenue.
const CHESTS = {base:["bottom","short_n","Short marine"], starter:["head","band_b","Bandeau bleu"], b1:["wrists","wraps_b","Bandes bleues"], b2:["top","tank_b","Débardeur bleu"], inter:["bottom","short_p","Short violet"],
  onearm:["top","ls_o","Manches longues orange"], planche:["bottom","pants_v","Pantalon vert"], press:["head","beanie_y","Bonnet jaune"], low:["extra","belt_y","Ceinture jaune"], ultime:["extra","wings","Ailes d’ange"]};
// quêtes annexes : petits défis pour le plaisir, posés dans les creux du chemin ; elles ne comptent ni dans les séances ni dans les dates
const SQ = [
  {id:"sq_tripod", name:"Trépied immobile", req:"fd_c2w", d:"Équilibre tête-mains en trépied sur un tapis plié, 20 s, le poids surtout dans les mains, le regard fixé entre elles.", h:"Dans Light on Yoga (1966), B.K.S. Iyengar appelle l’équilibre sur la tête, Sirsasana, le roi des postures, et la chandelle, Sarvangasana, la reine."},
  {id:"sq_roueG", name:"Roue du mauvais côté", req:"fd_roue", d:"5 roues du côté faible, les mains posées sur une ligne au sol.", h:"À Düsseldorf, des enfants font la roue dans la rue depuis des siècles. D’après la légende, ils fêtaient ainsi la victoire de Worringen, en 1288. La ville en a fait son emblème."},
  {id:"sq_pont", name:"Le pont tient bon", req:"st_bailc2w", d:"Pont, épaules au-dessus des mains, 20 s.", h:"En yoga, le pont complet s’appelle Urdhva Dhanurasana : l’arc tourné vers le ciel. On l’appelle aussi Chakrasana, la roue."},
  {id:"sq_corbeau", name:"Corbeau patient", req:"lo_frog", d:"Corbeau 30 s, puis tends une jambe derrière toi 3 s, de chaque côté.", h:"En sanskrit, kaka veut dire corbeau, et baka désigne un échassier, grue ou héron. Kakasana se fait bras fléchis, Bakasana bras tendus."},
  {id:"sq_pq", name:"Le rouleau sur les pieds", req:"in_str40", d:"Un rouleau de papier toilette posé sur la plante des pieds : 10 s d’équilibre libre sans le faire tomber.", h:"Jongler avec les pieds, couché sur le dos, porte un nom au cirque : l’antipodisme. Les antipodistes y font tourner des tapis, des tonneaux, et même, dans les jeux icariens, des partenaires."},
  {id:"sq_marche", name:"Dix mètres à l’envers", req:"b2_str15", d:"Marche 10 m sur les mains sans poser les pieds.", h:"En 1900, raconte-t-on, l’Autrichien Johann Hurlinger serait allé de Vienne à Paris sur les mains : 1 400 km en 55 jours, à raison de 10 heures par jour."},
  {id:"sq_demitour", name:"Demi-tour sur les mains", req:"in_7s", d:"Pivote d’un demi-tour en équilibre, puis tiens 3 s.", h:"Aux barres parallèles, le tour complet sur un bras en équilibre porte le nom du Soviétique Sergueï Diomidov, qui l’a présenté en 1966. Ton demi-tour sur deux mains en est la version douce."},
  {id:"sq_roulade", name:"Roulade arrière à l’équilibre", req:"in_str60", d:"Sur un tapis épais, avec quelqu’un pour parer la première fois : une roulade arrière qui finit en équilibre, tenu 2 s. La nuque ne porte jamais le poids.", h:"ATR, c’est l’appui tendu renversé : le nom de l’équilibre dans les gymnases français. La roulade arrière qui y monte est un classique des concours de gym."},
  {id:"sq_epaule", name:"Petites tapes", req:"oa_wall", d:"Équilibre dos au mur : 10 tapes sur l’épaule opposée, 5 par main.", h:"En yoga, l’équilibre sur les mains s’appelle Adho Mukha Vrksasana : l’arbre tourné vers le bas. Lâcher une main, c’est retirer une branche à l’arbre."},
  {id:"sq_pianiste", name:"Le pianiste", req:"oa_finger", d:"En équilibre libre, décolle un à un les doigts d’une main, puis repose-les.", h:"Sur les mains, l’équilibre se règle au bout des doigts : ils appuient quand tu bascules vers le dos, ils lâchent quand tu reviens. Les décoller un à un, c’est sentir lequel travaille."},
  {id:"sq_pistol", name:"Pistol des deux côtés", req:"pr_pikeLift", d:"3 pistol squats par jambe, le talon reste au sol.", h:"Le pistol squat doit son nom, dit-on, à la jambe tendue devant, comme un canon. Pavel Tsatsouline l’a rendu célèbre en 2003 dans The Naked Warrior, avec la pompe sur un bras."},
  {id:"sq_crepe", name:"La crêpe", req:"pr_stradLift", d:"Écart facial, coudes au sol, 30 s.", h:"Les gymnastes anglophones disent pancake, la crêpe. Le yoga l’appelle Upavistha Konasana, l’angle ouvert assis."},
  {id:"sq_crabe", name:"Crabe pressé", req:"pr_extSup", d:"10 m en marche du crabe, le bassin à la hauteur des genoux.", h:"Purvottanasana, la table inversée du yoga, veut dire étirement intense de l’est : le devant du corps, celui qui fait face au soleil levant. Le crabe, c’est la même table qui se met à marcher."},
  {id:"sq_croco", name:"Le crocodile marche", req:"lo_croc", d:"3 pas des mains en crocodile, sans poser les pieds.", h:"Le crocodile a un cousin en yoga : Mayurasana, le paon, en appui sur les coudes plantés dans le ventre. La Hatha Yoga Pradipika lui prête le pouvoir d’attiser le feu digestif, jusqu’à digérer le poison."},
  {id:"sq_poings", name:"Planche lean sur les poings", req:"pl_lean", d:"Planche lean sur les poings, 20 s.", h:"Bruce Lee faisait ses pompes sur les poings, et même sur deux doigts. Sur les poings, le poignet reste droit : en planche lean, il souffre moins."}];
const sqDone = () => S.sq || (S.sq = {});
function sqOpen(q){
  const box = $("qkBody"), on = reqDone(q.req), dn = sqDone()[q.id]; box.textContent = "";
  const hd = el("div","sqhd"); hd.innerHTML = ICON.flag || ""; hd.append(el("div","lab","Quête annexe"), el("h2",null,q.name)); box.append(hd);
  const blk = el("div","qkblock" + (dn ? " ok" : ""));
  if (!on) blk.append(el("b",null,"Après : " + MS[q.req].name), el("p",null,"Le défi se dévoile quand cette figure est validée."));
  else blk.append(el("b",null,"Le défi"), el("p",null,q.d));
  box.append(blk);
  if (q.h) { const st = el("div","qkinfo"), sc = el("section"); sc.append(el("h3",null,"La petite histoire"), el("p",null,q.h)); st.append(sc); box.append(st); }   /* visible même verrouillée : l’envie d’y aller */
  if (on) { const row = el("div","btns");
    if (dn) { row.append(el("p","mut","Réussie le " + new Date(dn).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}) + ".")); const u = el("button","btn line","Retirer le tampon"); u.onclick = () => { delete sqDone()[q.id]; save(); $("qkDlg").close(); render(); }; row.append(u); }
    else { const b = el("button","btn","C’est fait"); b.onclick = () => { const had = (S.bgot || []).includes("sq8"); sqDone()[q.id] = Date.now(); save(); $("qkDlg").close(); render(); const n = Object.keys(sqDone()).length; if (!(n >= 8 && !had)) toast("Tampon posé : " + n + " sur " + SQ.length + "."); };   /* le 8e : c’est l’annonce du badge qui parle */ row.append(b); }
    box.append(row); }
  box.append(el("p","mut sqnote","Pour le plaisir : les quêtes annexes ne changent ni tes séances ni tes dates."));
  $("qkT").textContent = q.name; const qd = $("qkDlg"); qd.classList.add("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.classList.remove("scrolled"); qd.onscroll = null;
}
// Estimation, à ton rythme : semaines pour atteindre la cible d’une figure (d’après tes progrès enregistrés, sinon une estimation prudente)
function eta(m){
  const x = st(m.id); if (x.done || !m.target || m.type === "check") return null; const T = m.target;
  const logs = logsOf(m.id).filter(l => !SFX_ALL.test(l.id)); let wk = null;
  if (logs.length >= 2) { const days = (Date.now() - logs[0].t) / 864e5, gain = x.best - logs[0].v; if (days >= 3 && gain > 0) wk = (T - x.best) / (gain / (days / 7)); }
  if (wk == null) wk = 1 + 4 * (1 - Math.min(1, x.best / T));
  const V = valRule(m.id), left = Math.max(0, V.n - hitInfo(m.id).days), since = Date.now() - 28 * 864e5;
  const perWk = Math.max(1, daysWhere((l, i) => i === m.id && !SFX_STRICT.test(l.id), since).size / 4);
  const hd = (S.hit && S.hit[m.id] && S.hit[m.id].days) || [], spanLeft = Math.max(0, V.span - (hd.length ? dayDiff(dayKey(Date.now()), hd[0]) : 0));
  wk = Math.max(wk, spanLeft / 7, left / perWk);   // on ne peut pas valider plus vite que la règle
  return Math.max(1, Math.min(52, Math.round(wk)));
}
// ---------- Dates estimées : un calendrier prudent de tout le chemin, recalculé à chaque séance ----------
// semaines habituelles par figure, pour quelqu’un de régulier (5 jours par semaine) ; tes propres mesures remplacent ces repères dès qu’elles existent
const DEFW = {fd_plank:2, fd_roue:2, fd_c2w:3, fd_push:4, fd_dips:4, fd_support:3, st_bail30:2, st_split:2, st_bailc2w:2, pl_protr:3, pl_strElev:6, pl_t2s:6, pl_fullElev:8, pr_lift1:2, pr_walk:2, pr_float:3, pr_wallPress:3, pr_1leg:4, fd_pushInc:3, fd_dipsB:3, fd_pike:2, b1_free5:4, b2_str15:6, in_holds:4, in_changes:4, in_tuck:3, in_str40:6, in_str60:8, in_7s:4, in_7d:4, in_toes:4, in_toes7:4,
  oa_strad30:4, oa_tuckflag:4, oa_flaghoriz:5, oa_flagfloor:5, oa_wall:6, oa_shrug:4, oa_shift:6, oa_sidehold:6, oa_finger:3, oa_finger3:3, oa_finger2:3, oa_finger1:4, oa_strarm:6, oa_lift:8, oa_oahs:20, oa_oahsw:12, oa_oahs10:16, oa_shTuck:8, oa_shStrad:8, oa_switch:10,
  pr_pikeLift:3, pr_stradLift:3, pr_wallNeg:3, pr_negS:4, pr_elev:4, pr_elevLow:4, pr_straddle:8, pr_negP:5, pr_pike:10, pr_lsit:3, pr_stradL:4, pr_vsit:8, pr_halfSt:6, pr_tuckUp:6, pr_stalPart:8, pr_stalder:14, pr_lsitNeg:6, pr_lsitHs:10, pr_vsitC:6, pr_extSup:4, pr_mannaP:16, pr_vsitH:26, pr_manna:80,
  lo_elbow:3, lo_croc:6, lo_qdr:6, pl_lean:3, pl_ppp:4, pl_lean2:4, pl_tuckP:5, pl_tuck:6, pl_tuckPu:6, pl_tuckO:8, pl_adv:12, pl_1leg:10, pl_strBand:8, pl_strBandL:8, pl_straddle:20, pl_strNar:12, pl_half:16, pl_fullBand:10, pl_fullNeg:10, pl_full:26, pl_strHs:10, pl_hsDown:10, pl_halfPress:20, pl_press:40,
  ul_c1:8, ul_c2:10, ul_c3:8, ul_c12:10, ul_full:12, pl_frog:6};
const laneOf = m => /^pl_/.test(m.id) || (laneOf.pp || (laneOf.pp = reqsOf("pl_lean"))).has(m.id) ? "pl" : m.sec === "press" || m.sec === "low" ? "pr" : m.sec === "ultime" ? "ul" : "ba";
// jours d’entraînement sur les 28 derniers jours (null tant que l’historique est trop court pour juger)
function trainDays(){ const now = Date.now(), first = S.log.length ? S.log[0].t : now; if (now - first < 14 * 864e5) return null; return new Set(S.log.filter(l => l.t >= now - 28 * 864e5).map(l => dayKey(l.t))).size; }
// calendrier : chaque famille (équilibre, planche, montées) avance une figure à la fois, les familles avancent en parallèle
// o.mins : durée de séance supposée, o.days : jours d’entraînement sur 28 supposés
// ton rythme réel : temps mis sur les figures que tu as validées, comparé aux repères (il en faut au moins trois pour juger)
function pace(){ let a = 0, d = 0, n = 0; Object.values(MS).forEach(m => { const x = st(m.id); if (x.done && x.dt && x.t0 && DEFW[m.id]) { a += Math.max(1, (x.dt - x.t0) / (7 * 864e5)); d += DEFW[m.id]; n++; } });
  return {n, k:n >= 3 ? Math.max(0.5, Math.min(2, 1 + (a / d - 1) * Math.min(1, n / 8))) : 1}; }   /* peu de figures : on ne s’emballe pas, l’effet grandit avec les preuves */
// le plan complet ne se recalcule que si quelque chose a été enregistré (ou le jour a changé)
const planKey = () => JSON.stringify(S.prof || {}) + (window._sv || 0) + "|" + S.log.length + "|" + dayKey(Date.now());
function plan(o){ if (!o) { const k = planKey(); if (plan.k !== k) { plan.k = k; plan.v = planCalc(); } return plan.v; } return planCalc(o); }
// profil : plus de 50 ans ou plus de 90 kg, la force avance moins vite (l’équilibre, à moitié moins)
const profHeavy = () => { const p = S.prof || {}; return p.age === ">50" || p.poids === ">90"; };   // plus de 50 ans ou plus de 90 kg : on monte plus doucement
const profK = lane => { const p = S.prof || {}, a = p.age === ">50" ? 1.35 : p.age === "35-50" ? 1.15 : 1, w = p.poids === ">90" ? 1.3 : p.poids === "70-90" ? 1.1 : 1; return lane === "ba" ? 1 + (a * w - 1) * 0.5 : a * w; };
function planCalc(o){ o = o || {}; const mins = o.mins || S.mins || 30, td = o.days != null ? o.days : trainDays();
  const fq = td == null ? 1 : Math.max(0.9, Math.min(2.5, 20 / Math.max(4, td)));
  // 30 min : une seule figure de force par séance, planche et montées se partagent la place ; 45 min et plus : les deux avancent
  const kf = {ba:mins <= 15 ? 1.5 : mins <= 30 ? 1 : mins <= 45 ? 0.9 : 0.85, pl:mins <= 15 ? 2.5 : mins <= 30 ? 1.6 : mins <= 45 ? 1 : 0.9}; kf.pr = kf.pl; kf.ul = kf.pl / (mins <= 30 ? 1.6 : 1);
  const pk = pace().k, fin = {}, start = {}, by = {}, free = {ba:0, pl:0, pr:0, ul:0}, last = {}, todo = [];
  Object.values(MS).forEach(m => { if (st(m.id).done || eqSkip(m.id)) fin[m.id] = 0; else if (m.alt) fin[m.id] = null; else todo.push(m); });
  const W = m => { const x = st(m.id), has = logsOf(m.id).length >= 2, e = has && !msLocked(m) ? eta(m) : null;
    if (e != null) return e; const d = DEFW[m.id] || 2, part = m.target && x.best ? Math.min(0.7, 0.7 * x.best / m.target) : 0; return Math.max(1, d * (1 - part) * kf[laneOf(m)] * fq * pk * profK(laneOf(m))); };
  while (todo.length) { let bi = -1, br = 0, bt = Infinity, bw = null;
    todo.forEach((m, i) => { let r = 0, w = null; for (const q of m.req || []) { if (!(q in fin)) return; if ((fin[q] || 0) > r) { r = fin[q]; w = q; } } const t = Math.max(r, free[laneOf(m)]); if (t < bt) { bt = t; br = r; bi = i; bw = w; } });   /* à départ égal, l’ordre du parcours */
    if (bi < 0) break; const m = todo.splice(bi, 1)[0], L = laneOf(m), t0 = Math.max(br, free[L]); by[m.id] = free[L] > br ? last[L] : bw; start[m.id] = t0; fin[m.id] = t0 + W(m); free[L] = fin[m.id]; last[L] = m.id; }
  return {fin, start, by}; }
// le sommet de l’objectif choisi
const goalTop = () => ({planche:"pl_full", press:"pr_manna", oahs:"oa_oahs10", min:"in_str60"})[S.goal] || "ul_full";
const goalShort = () => ({planche:"Full planche", press:"Équilibre en force", oahs:"Un bras", min:"Tenir sur les mains"})[S.goal] || "Combo ultime";
const planWk = (P, ids) => ids.reduce((n, id) => Math.max(n, P.fin[id] || 0), 0);
const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
// une date lisible : le jour quand c’est proche, le mois quand c’est loin (une estimation à un an n’a pas de jour)
function dateTxt(wk){ const d = new Date(Date.now() + wk * 7 * 864e5); return wk <= 10 ? "vers le " + d.getDate() + (d.getDate() === 1 ? "er " : " ") + MOIS[d.getMonth()] : MOIS[d.getMonth()] + " " + d.getFullYear(); }
const gainTxt = wk => wk < 9 ? Math.max(1, Math.round(wk)) + " semaine" + (Math.round(wk) > 1 ? "s" : "") : wk < 100 ? Math.round(wk / 4.35) + " mois" : (Math.round(wk / 52 * 2) / 2 + " ans").replace(".", ",");
// la figure qui fixe la date du but : on remonte le chemin le plus long jusqu’à une figure ouverte aujourd’hui
function keyFig(P, ids){ let id = ids.reduce((a, b) => (P.fin[b] || 0) > (P.fin[a] || 0) ? b : a, ids[0]), n = 0; while (id && P.start[id] > 0 && P.by[id] && n++ < 200) id = P.by[id]; return id && !st(id).done ? id : null; }
// fenêtre « Mes dates » : les grandes étapes, puis ce qui ferait gagner du temps
const STEPS = [["in_str60","Tenir sur les mains, 60 s"],["pr_straddle","Montée en force jambes écartées"],["pl_tuck","Tuck planche"],["pr_stalder","Stalder"],["oa_oahs","Équilibre sur un bras"],["pl_straddle","Straddle planche"],["pr_manna","Manna"],["pl_full","Full planche"],["ul_full","Le combo ultime"]];
// au-delà d’un an, une fourchette plutôt qu’une date précise : le chemin est long, il ne doit pas décourager
function rangeTxt(w){ if (!w) return ""; if (w <= 52) return dateTxt(w); const y = k => new Date(Date.now() + w * k * 7 * 864e5).getFullYear(), a = y(0.8), b = y(1.25); return a === b ? dateTxt(w) : "entre " + a + " et " + b; }
function openEta(){ const box = $("etaBody"), P = plan(), goal = goalTop(), w0 = P.fin[goal], mins = S.mins || 30, td = trainDays(); box.textContent = "";
  const tl = el("div","etl"); STEPS.filter(([id]) => MS[id]).sort((a, b) => (b[0] === goal) - (a[0] === goal) || (P.fin[a[0]] || 0) - (P.fin[b[0]] || 0)).forEach(([id, name]) => { const r = el("div","etr" + (st(id).done ? " ok" : id === goal ? " goal" : ""));   // ton but d’abord
    r.append(el("span","etn", name), el("span","etd", st(id).done ? "Validé" : rangeTxt(P.fin[id]))); tl.append(r); }); box.append(tl);
  if (!w0) return;
  { const pc = pace(); if (pc.n >= 3 && Math.abs(pc.k - 1) >= 0.05) box.append(el("p","mut etnote","Ton rythme mesuré sur " + pc.n + " figures validées : " + Math.round(Math.abs(1 - pc.k) * 100) + " % " + (pc.k < 1 ? "plus rapide" : "plus lent") + " que les repères. Toutes les dates en tiennent compte.")); }
  box.append(el("div","lab","Pour arriver plus vite")); const lv = el("div","etl");
  const lever = (t, d, fn) => { const r = el(fn ? "button" : "div","etr lev"); r.append(el("span","etn", t), el("span","etd", d)); if (fn) r.onclick = fn; lv.append(r); };
  const k = keyFig(P, [goal]); if (k) lever("Figure clé, sur le chemin le plus long", MS[k].name, () => { $("etaDlg").close(); goHere(k); });
  [45, 60].filter(v => v > mins).forEach(v => { const w = plan({mins:v}).fin[goal]; if (w0 - w >= 4) lever("Si tu as plus de temps : " + v + " min", gainTxt(w0 - w) + " plus tôt, " + dateTxt(w), () => { if (!confirm("Passer tes séances à " + v + " minutes ? Tu pourras revenir en arrière dans les Réglages.")) return; S.mins = v; if (S.bday && !Object.keys(wkGet(todayIdx())).length) S.bday = null; save(); render(); openEta(); toast("Séances réglées sur " + v + " min."); }); });
  if (mins > 30) lever("Tu es à " + mins + " min", "planche et montées avancent ensemble");
  if (td != null && td < 18) { const w = plan({days:20}).fin[goal]; if (w0 - w >= 4) lever("Si tu peux, 5 jours par semaine (tu es à " + td + " jours sur 28)", gainTxt(w0 - w) + " plus tôt, " + dateTxt(w)); }
  box.append(lv, el("p","mut etnote","Estimation prudente : elle part de repères habituels, puis de tes propres mesures dès que tu en as. Elle se recalcule à chaque séance. " + (S.goal === "planche" && !profHeavy() ? "Avec ton objectif, la planche passe à 3 jours par semaine." : "Pour les tendons, la planche reste à 2 jours par semaine.") + "")); }
const etaTxt = w => w == null ? "" : w <= 1 ? "≈ 1 semaine" : "≈ " + w + " semaines";
// ---------- Le parcours : un seul chemin qui serpente, figure après figure ; il se divise en trois voies au niveau difficile.
// Carte rapide d’une figure : animation, niveau, estimation, et deux boutons.
// erreur de technique à montrer en animation : la première erreur visible citée dans « À éviter »
const FAULTS = [["bras", /(plier|plie|pliés?) (les |le |du )?(bras|coudes?)(?! libre)|demi-pompes|coudes trop/i, "bras pliés"], ["banane", /creus|banane|cambr/i, "dos creusé"], ["rond", /dos rond/i, "dos rond"],
  ["hanches", /hanches?( qui)? (tomb|fl[ée]ch)|bassin (ou le monter )?.*tomb|tomber le bassin|plier le bassin|en pike|casser la ligne|jambes? (tomber|descendre)/i, "hanches qui tombent"],
  ["genoux", /plier (la jambe|les genoux)/i, "genoux pliés"], ["ecart", /(écarter|ouvrir) les jambes/i, "jambes écartées"]];
// cas où le texte trompe la détection (sens du mouvement, erreur d’un seul côté) : on choisit à la main, ou on ne montre rien
const FX_ID = {oa_shTuck:["banane","dos creusé"], oa_strad30:["banane","dos creusé"], pr_lsit:["jambes","jambes qui tombent"], oa_shStrad:null, lo_elbow:null,
  fd_plank:["banane","bassin qui tombe"], pl_tuck:["bas","hanches qui tombent"], pl_tuckO:["bas","hanches qui tombent"], pl_full:["bas","hanches sous la ligne"],
  pr_straddle:["bras","bras pliés"], pr_pike:["ecart","jambes écartées"], pr_stalder:["jambes","pieds qui frottent le sol"],   /* bras repliés contre le buste : un coude plié ne se lit pas, on montre l’autre erreur citée */ pr_manna:["bras","bras pliés"], oa_oahs:["bras","bras d’appui plié"], oa_oahs10:["bras","bras d’appui plié"], pr_vsitC:["buste","buste qui bascule"], pr_stradL:["buste","buste qui bascule"]};
function faultOf(id){ if (id in FX_ID) return FX_ID[id] && {t:FX_ID[id][0], label:FX_ID[id][1]}; const e = (DETAILS[id] || {}).err; if (!e) return null; let best = null;
  FAULTS.forEach(([t, re, label]) => { const m = re.exec(e); if (m && (!best || m.index < best.i)) best = {t, label, i:m.index}; }); return best; }
const faultKey = id => { const f = faultOf(id); return f ? "fx_" + f.t + "__" + id : null; };
const lc1 = t => t.charAt(0).toLowerCase() + t.slice(1);   // minuscule après les deux-points
function quick(id){
  const m = MS[id], x = st(id), lk = !x.done && msLocked(m), L = lvls(m), kk = lvlOf(m), box = $("qkBody"); box.textContent = "";
  const art = el("div","qkart"), sp = figSp(id, 200); art.append(sp);

  const g = el("div","grow"), mst = MAITRES.has(id); g.append(el("div","lab" + (mst ? " qmst" : ""), mst ? "Figure maîtresse, " + (/^[A-Z]{2}/.test(SEC[m.sec].name) ? SEC[m.sec].name : lc1(SEC[m.sec].name)) : SEC[m.sec].name), el("h2",null, m.name));
  { const y = yogaOf(id); if (y) { const yl = el("div","qyoga"); yl.append(el("span",null,"En yoga : "), y[0] ? el("b",null,y[0]) : "", y[1] ? el("span",null,(y[0] ? ", " : "") + y[1]) : "", y[2] ? el("span","mut"," (" + y[2] + ")") : ""); g.append(yl); } }
  if (mst) { art.classList.add("mst"); const wr = el("span","laurel"); wr.innerHTML = laurel(); art.prepend(wr); }   // la figure maîtresse garde sa couronne dans sa fiche
  if (L.length > 1) { const pips = el("div","pips"); L.forEach((v,i)=>{ const p = el("span", i < kk ? "ok" : i === kk ? "now" : ""); p.textContent = unitTxt(m, v); pips.append(p); }); g.append(pips); }
  const w = eta(m); g.append(el("div","mut", x.done ? "" : lk ? ((pw => pw > 52 ? "Un sommet lointain : chaque étape qui y mène compte." : "Verrouillée pour l’instant" + (pw > 0 ? ", ouverture estimée : " + dateTxt(pw) : ""))(plan().start[id] || 0)) : (w > 12 || plateau(id)) && m.type === "hold" && nextStep(m) > x.best && x.best > 0 ? "Niveau " + unitTxt(m, nextStep(m)) + " : il manque " + num(Math.round((nextStep(m) - x.best) * 10) / 10) + " s" : w ? "À ton rythme : " + etaTxt(w) + " pour " + goalTxt(m) + ", " + dateTxt(w) : ""));   /* loin du but : on montre l’écart au prochain niveau, pas une date qui recule */
  // mini-arbre : en haut les figures requises (allumées si validées), reliées à la figure ; un toucher ouvre le parent
  const req = (m.req || []).filter(r=>MS[r]);
  let qkTree = null;
  if (req.length) { const par = el("div","qkpar"); qkTree = par;
    req.forEach((r,i)=>{ const on = st(r).done, b = el("button","qkn" + (on ? " on" : "")), ps = el("span","sp"); ps.dataset.pose = poseId(r); ps.dataset.anim = r; ps.dataset.lk = on ? "" : 1; sprPaint(ps, 56);
      b.append(ps, el("i",null, MS[r].name)); b.setAttribute("aria-label", MS[r].name + (on ? ", validée" : ", à valider")); b.onclick = () => quick(r); par.append(b); }); }
  const top = el("div","qktop"); top.append(art, g); box.append(top);
  // la photo de la figure, si elle existe : en tête de fiche ; absente, elle disparaît sans laisser de trou
  { const f = el("figure","qkph qkhero"), im = el("img"); im.alt = m.name; im.onerror = () => f.remove(); im.src = photoUrl("but-" + id); f.append(im); box.append(f); }
  if (HIST[id]) { const h = el("div","qhist" + (mst ? " mst" : "")); h.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z"/><path d="M5 19l8-8"/></svg>'; const dh = el("details","qhd"); dh.append(el("summary","lab","Un peu d’histoire"), el("p",null,HIST[id])); h.append(dh); box.append(h); }
  // ce qui bloque, en une ligne : prérequis manquant, critère pas encore atteint, ou rien
  { const D0 = DETAILS[id] || {}, hi = hitInfo(id), blk = el("div","qkblock"), bar = f => { const b = el("div","bar"), i = el("span"); i.style.width = Math.round(Math.min(1, f) * 100) + "%"; b.append(i); blk.append(b); };
    if (x.done) { blk.classList.add("ok"); const nx = SEC[m.sec].ms.map(q=>q.id).find(i=>!reqDone(i) && !msLocked(MS[i])) || goalOf().ms.find(i=>!reqDone(i) && !msLocked(MS[i]));   /* la suite dans la même discipline d abord */ blk.append(el("b",null,"Maîtrisé"), el("p",null, nx ? "Prochaine figure : " + MS[nx].name + "." : "Tout est validé.")); bar(1); }
    else if (lk) blk.append(el("b",null,"Il te manque : " + missing(m)), el("p",null,((m.req || []).filter(r=>!st(r).done).length > 1 ? "Valide-les d’abord." : "Valide d’abord ce prérequis.") + " Tu peux quand même essayer."));
    else if (plateau(id)) { blk.append(el("b",null,"Plateau depuis 3 semaines"), el("p",null,"Pourquoi : " + plateau(id) + ". " + (lightWeek(id) ? ([2, 3].includes(painState().phase) ? "Reprise en douceur après une douleur : un cran plus léger, puis on repart." : "Semaine plus légère en cours sur cette figure, puis on repart.") : "Elle sera allégée une semaine à sa prochaine séance."))); bar(Math.min(1, x.best / (m.target || 1))); }
    else if (hi.days) { blk.append(el("b",null, hi.days + (hi.days > 1 ? " séances validées sur " : " séance validée sur ") + valRule(id).n), el("p",null,"Refais la cible un autre jour pour valider la figure." + (D0.err ? " À surveiller : " + lc1(D0.err) : ""))); bar(hi.days / valRule(id).n); }
    else if (x.best > 0 && m.target) { blk.append(el("b",null,"Record " + fmt(m, x.best) + ", cible " + goalTxt(m)), el("p",null,"Il reste " + (m.type === "hold" ? num(Math.max(0, m.target - x.best)) + " s" : Math.max(0, m.target - x.best) + " rép") + "." + (D0.err ? " À surveiller : " + lc1(D0.err) : ""))); bar(x.best / m.target); }
    else blk.append(el("b",null,"Pour valider"), el("p",null, D0.ok || (m.target ? goalTxt(m) + ", sur 2 séances." : "Réussie sur 2 séances.")));
    top.after(blk); }
  let qkHist = null;
  { // historique : meilleur temps de chaque jour d’entraînement sur cette figure
    const byDay = {}; S.log.filter(l=>(l.id === id || l.id === "pg:" + m.name) && typeof l.v === "number").forEach(l=>{ const d = dayKey(l.t); byDay[d] = Math.max(byDay[d] || 0, l.v); });
    const pts = Object.values(byDay).slice(-20);
    if (pts.length >= 2 && m.target) { const W = 300, H = 70, mx = Math.max(m.target, ...pts), X = i => 6 + i * (W - 12) / (pts.length - 1), Y = v => H - 8 - v / mx * (H - 16);
      const svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + Y(m.target) + '" y2="' + Y(m.target) + '" stroke="var(--acc)" stroke-dasharray="4 4" stroke-width="1.5"/>'
        + '<polyline fill="none" stroke="var(--txt)" stroke-width="2.5" stroke-linejoin="round" points="' + pts.map((v,i)=>X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ") + '"/>' + pts.map((v,i)=>'<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.5" fill="var(--txt)"/>').join("") + '</svg>';
      const h = el("div","hist"); const gr = el("div"); gr.innerHTML = svg; h.append(gr, el("div","mut","Pointillés : la cible (" + goalTxt(m) + "). Meilleur : " + fmt(m, Math.max(...pts)) + ".")); qkHist = [h, "Ton historique, " + pts.length + " séances"]; }
  }
  const row = el("div","btns"), go = el("button","btn", lk ? "Essayer" : x.done ? "Refaire" : m.type === "hold" ? "S’entraîner" : "Je l’ai réussi"), more = el("button","btn line","Chrono et journal");
  go.onclick = () => { $("qkDlg").close(); openMs(id); if (m.type === "hold") setTimeout(()=>{ const gb = $("go"); if (gb && $("dlg").open) { $("clock").scrollIntoView({block:"center"}); gb.click(); } }, 250); else if (!lk) setTimeout(()=>$("toggle").scrollIntoView({block:"center"}), 250); };
  more.onclick = () => { $("qkDlg").close(); openMs(id); };
  row.append(go, more); box.querySelector(".qkblock").after(row);
  // carte en plein écran : tout est affiché, rien à déplier
  const D = DETAILS[id] || {}, info = el("div","qkinfo"), fold = (title, node) => { const s = el("section"); s.append(el("h3",null,title), node); info.append(s); };
  { const t = el("div"), steps = el("details","qsteps"), sb = el("div"); steps.append(el("summary",null,"Les étapes, pas à pas"), sb);   /* l’animation montre le geste ; les mots, pour qui les veut */
    if (m.desc && !(D.how && D.how.length)) sb.append(el("p",null,m.desc)); if (D.how && D.how.length) { const ol = el("ol"); D.how.forEach(v=>ol.append(el("li",null,v))); sb.append(ol); }
    if (D.cue && D.cue.length) { const ul = el("ul","cues"); D.cue.forEach(c => ul.append(el("li",null,c))); t.append(ul); } if (sb.childElementCount) t.append(steps); if (D.err && !faultOf(id)) t.append(el("p",null,"À éviter : " + lc1(D.err)));   /* l’animation « à éviter » le montre déjà */   /* toujours avec son libellé : seule, la phrase se lirait comme une consigne */   /* la carte animée porte déjà « À éviter » */
    // l’erreur la plus visible, montrée : à gauche la bonne posture, à droite la même qui se dégrade
    { const f = faultOf(id); if (f) { const cmp = el("div","fxcmp"), card = (cls, lab, anim, still) => { const c = el("div","fx " + cls), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = anim; sp.dataset.lk = ""; if (still) sp.dataset.still = 1; sprPaint(sp, 108); c.append(sp, el("b",null, lab)); if (!still && !SPR[anim]) c.classList.add("wait"); return c; };   /* l’erreur pas encore calculée : estompée, pour ne pas montrer deux fois la même pose */
      cmp.append(card("ok", "À faire", id, true), card("ko", "À éviter : " + f.label, faultKey(id), false)); t.prepend(cmp);
      if (!SPR[faultKey(id)]) setTimeout(() => buildSprites(true), 60); } }   /* pas encore calculée : on la fait passer en tête de file */
    if (t.childElementCount) fold("Technique", t); }
  { const t = el("div"); planVis(m, planFor(m), t);
    // la préparation en images : chaque exercice avec son personnage animé
    const dl = el("div","drv"); drillsFor(m).forEach(k=>{ const d = DRILLS[k], c = el("div","drc2"); const nm = drillBlock(k, false).name; c.append(drSp({dk:k, name:nm}, 64), el("b",null,nm), el("span","mut", nbsp(d.sets[0] + " × " + (d.kind === "hold" ? d.sets[1] + " s" : d.sets[1])))); dl.append(c); });
    if (dl.childElementCount) t.append(el("div","lab","Préparation"), dl); if (t.childElementCount) fold(x.done ? "Préparation" : "Plan et préparation", t); }
  if (qkHist) fold(qkHist[1], qkHist[0]);
  if (qkTree) fold(req.length > 1 ? "Avant cette figure : les prérequis" : "Avant cette figure : le prérequis", qkTree);
  if (m.yt && m.yt.length) { const v = el("div"); m.yt.forEach(([vid,t])=>v.append(ytLink(vid, "Vidéo : " + t))); fold("Vidéo", v); }
  box.append(info);
  $("qkT").textContent = m.name; const qd = $("qkDlg"); qd.classList.remove("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.classList.remove("scrolled");
  qd.onscroll = () => qd.classList.toggle("scrolled", qd.scrollTop > 300);   /* le nom revient dans la barre du haut quand le grand titre est passé */
}

// le plan en un coup d’œil : séries, repos, jours, validation en tuiles ; les consignes importantes en clair ; le reste replié
function planVis(m, pl, box){ const x = st(m.id);
  if (pl.n && !x.done) { const n = pl.n, V = valRule(m.id), rest = n.rest || (typeof restOf === "function" ? restOf(m) : 0), mm = r => r < 60 ? r + " s" : Math.floor(r / 60) + " min" + (r % 60 ? " " + r % 60 : ""),
      tiles = [[n.attempts ? n.sets + " essais" : n.check ? n.sets + " essais" : n.sets + " × " + (n.hold ? n.work + " s" : n.work), n.attempts ? "jusqu’à " + n.T + " s" : n.check ? "par séance" : n.hold ? "tenues" : "répétitions"],
        rest ? [mm(rest), "de repos"] : null, pl.days ? [pl.days + " ×", "par semaine"] : null, m.type !== "check" ? [V.n + " jours", "pour valider"] : null].filter(Boolean), tr = el("div","ptiles");
    tiles.forEach(([a, b]) => { const t = el("div","ptile"); t.append(el("b",null,nbsp(a)), el("span",null,b)); tr.append(t); }); box.append(tr); }
  const key = pl.lines.filter(t => /^(Ton matériel|Sans parallettes|Souplesse conseillée|La manna se compte|Figure acquise)/.test(t)), rest2 = pl.lines.filter(t => !key.includes(t));
  if (key.length) { const ul = el("ul","plan pkey"); key.forEach(t=>ul.append(el("li",null,t))); box.append(ul); }
  if (pl.prog && PS[pl.prog[0]]) { const pid = pl.prog[0], st0 = pid === "planche-domination" ? pl.prog[1] : null, stp = st0 != null && PS[pid].steps[st0];
    const pb = el("button","btn line","Programme associé : " + PS[pid].name + (stp ? ", " + stp.name : "")); pb.onclick = () => { $("qkDlg").close(); openProg(pid, st0); }; box.append(pb); }
  if (rest2.length) { const det = el("details","pdet"), sm = el("summary",null,"Le détail du plan"), ul = el("ul","plan"); rest2.forEach(t=>ul.append(el("li",null,t))); det.append(sm, ul); box.append(det); } }
const ringSvg = (frac, size, r, w, cls) => { const C = 2*Math.PI*r, c = size/2; return '<svg class="' + (cls || "") + '" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" fill="none" aria-hidden="true"><circle cx="' + c + '" cy="' + c + '" r="' + r + '" stroke="var(--line)" stroke-width="' + w + '"/>' + (frac > 0 ? '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" stroke="var(--acc)" stroke-width="' + w + '" stroke-linecap="round" transform="rotate(-90 ' + c + ' ' + c + ')" stroke-dasharray="' + (C*Math.min(1,frac)).toFixed(1) + ' ' + C.toFixed(1) + '"/>' : "") + '</svg>'; };
const BFAM = [["Régularité",["first","st3","st7","st30"]],["Séances et volume",["se10","se50","s100","s1000"]],["Temps en appui et souplesse",["h10","h60","e10"]],["Étages du parcours",null,"sec_"],["Quêtes en cours",null,"goal_"]];
const badgeReward = id => { const out = []; WARD.forEach(w=>w.items.forEach(it=>{ if (it[2] === "b:" + id) out.push(it[1]); })); if (id.startsWith("goal_")) out.push("Médaille"); return out; };
function renderQuest(S0, nextId){
  const box = $("quest"); box.textContent = "";
  // badges : un médaillon par objectif, l’anneau montre l’avancement
  const head = el("h2","sect","Badges"); head.id = "sect-badges"; box.append(head);
  const got = S0.badges.filter(b=>b.ok).length;
  box.append(el("p","intro-t", got + " / " + S0.badges.length));
  // ce qui suit ton but : ta quête toujours visible, les étages et quêtes des autres buts seulement dans « Tous les badges »
  const myGoal = "goal_" + (S.goal || "both"), mySecs = new Set(goalOf().ms.map(id => MS[id] && MS[id].sec)),
    mine = b => b.id.startsWith("goal_") ? b.id === myGoal : b.id.startsWith("sec_") ? mySecs.has(b.id.slice(4)) : true;
  const next3 = new Set(S0.badges.filter(b=>!b.ok && mine(b)).sort((a,b)=>(b.id === myGoal) - (a.id === myGoal) || b.cur / b.max - a.cur / a.max).slice(0, 3).map(b=>b.id)), shown = b => S.allB || b.ok || next3.has(b.id) || b.id === myGoal;
  BFAM.forEach(([name, ids, pre])=>{ const list = S0.badges.filter(b=>(ids ? ids.includes(b.id) : b.id.startsWith(pre)) && shown(b)); if (!list.length) return;
    box.append(el("div","lab bfam",name)); const grid = el("div","badges");
    list.forEach(b=>{ const x = el("button","bdg" + (b.ok ? "" : " off")); x.setAttribute("aria-label", b.name + ", " + (b.ok ? "obtenu" : b.cur + " sur " + b.max));
      const m = el("span","m"); m.innerHTML = ringSvg(b.ok ? 0 : b.cur / b.max, 76, 35, 4, "rg"); m.append(el("span","gl", b.id.startsWith("goal_") && !b.ok ? b.cur + "/" + b.max : b.g));   /* une quête montre son avancement, pas son étiquette */ if (b.ok) m.append(icon("check","ck"));
      x.append(m, el("span","bn", b.name), el("span","bc", b.ok ? "Obtenu" : b.id.startsWith("goal_") ? "" : b.t ? mins(b.cur) + " / " + mins(b.max) + " min" : b.cur + "/" + b.max));
      x.onclick = () => { $("bdG").textContent = b.g; $("bdT").textContent = b.name; $("bdD").textContent = b.desc; $("bdBar").style.width = (b.cur / b.max * 100) + "%";
        $("bdC").textContent = b.ok ? "Obtenu" : (b.t ? mins(b.cur) + " / " + mins(b.max) + " min" : b.cur + " / " + b.max);
        const rw = badgeReward(b.id); $("bdR").textContent = "Récompense : 40 points d’expérience" + (rw.length ? ", tenue : " + rw.join(", ") : ""); $("bdDlg").showModal(); };
      grid.append(x); });
    box.append(grid); });
  { const more = el("button","golink", S.allB ? "Moins de badges" : "Tous les badges (" + S0.badges.length + ")"); more.onclick = () => { S.allB = !S.allB; save(); render(); }; box.append(more); }
}
