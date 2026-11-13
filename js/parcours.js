// Plans d'entraînement par figure, parcours, coffres, estimation, carte rapide, quête.
"use strict";
// ---------- Accompagnement : un plan concret pour passer au niveau suivant de chaque jalon ----------
// Ces plans sont des repères généraux d'entraînement (les miens, pas ceux des programmes) : volume modéré, souvent, sans aller à l'échec.
const PLAN_PROG = {pl_lean:["planche-domination",0], pl_tuck:["planche-domination",1], pl_adv:["planche-domination",2], pl_frog:["planche-domination",3],
  pl_lean2:["planche-domination",0], pl_tuckP:["planche-domination",1], pl_tuckPu:["planche-domination",1], pl_tuckO:["planche-domination",2], pl_strBand:["planche-domination",5], pl_strBandL:["planche-domination",5], pl_strNar:["planche-domination",6], pl_half:["planche-domination",6], pl_fullBand:["planche-domination",6], pl_fullNeg:["planche-domination",6], pl_1leg:["planche-domination",4], pl_pike:["planche-domination",4], pl_straddle:["planche-domination",5], pl_full:["planche-domination",6],
  pr_straddle:["quest-for-the-press",0], pr_pike:["quest-for-the-press",0], pr_stalder:["quest-for-the-press",0], pr_negS:["quest-for-the-press",0], pr_elev:["quest-for-the-press",0], pr_stradL:["quest-for-the-press",0], pr_lsit:["quest-for-the-press",0], pr_lsitHs:["quest-for-the-press",0]};
const SOUPLE = new Set(["in_7s","in_7d","in_toes7","pr_straddle","pr_pike","pr_stalder","pl_pike","pl_straddle","oa_flaghoriz","oa_flagfloor","st_split"]);
const adaptOf = id => Math.max(0.6, Math.min(1.35, ((S.adapt || {})[id]) || 1));
// Douleur : chaque signalement est daté par zone. Éviction de 3 jours (7 si la même zone revient en 3 semaines),
// puis reprise par paliers : une semaine à 60 % sans tentative à fond, une semaine à 80 %.
const painLog = () => S.painLog || (S.painLog = S.pain ? [{t:S.pain, zone:S.painZone || "autre"}] : []);
function painState(){ const L = painLog(); if (!L.length) return {phase:0, ease:1, zone:null};
  const last = L[L.length - 1], again = L.filter(p => p.zone === last.zone && last.t - p.t < 21 * 864e5).length >= 2, ev = (again ? 7 : 3) * 864e5, d = Date.now() - last.t;
  return d < ev ? {phase:1, ease:0.6, zone:last.zone, days:Math.ceil((ev - d) / 864e5), again} : d < ev + 7 * 864e5 ? {phase:2, ease:0.6, zone:last.zone} : d < ev + 14 * 864e5 ? {phase:3, ease:0.8, zone:last.zone} : {phase:0, ease:1, zone:null}; }
const painRecent = () => painState().phase === 1;
// habiletés d'équilibre (y compris sur un bras) : des essais tenus jusqu'à la chute, pas des séries de force
const FREE = m => m.type === "hold" && ["b1","b2","inter","onearm"].includes(m.sec) && m.id !== "oa_wall" && !/^oa_(sidehold|finger|strarm)/.test(m.id);   // tenues avec appui : séries par côté, pas des essais libres   // un bras au mur : séries de force par côté
const FORCE = id => (/^(pl_|pr_)/.test(id) && !["pr_lsit","pr_stradL","pr_pikeLift","pr_stradLift","pr_vsit","pr_vsitC","pr_extSup"].includes(id)) || /^ul_/.test(id) || id === "fd_push" || id === "fd_dips" || id === "in_hspu";
// plateau : 3 semaines sans progrès (au moins 4 séances, meilleur temps +5 % au plus, aucune séance validée)
function plateau(id){
  const m = MS[id]; if (!m || st(id).done || m.type === "check" || (m.target && st(id).best >= m.target)) return null;   // cible déjà tenue : il reste à valider, pas un plateau
  const since = Date.now() - 21 * 864e5, byDay = {};
  S.log.filter(l => l.t >= since && (l.id === id || l.id === "pg:" + m.name) && typeof l.v === "number").forEach(l => { const d = dayKey(l.t); byDay[d] = Math.max(byDay[d] || 0, l.v); });
  const days = Object.keys(byDay).sort((a, b) => dk(a) - dk(b)); if (days.length < 4 || hitInfo(id).days) return null;
  const half = Math.floor(days.length / 2), a = Math.max(...days.slice(0, half).map(d => byDay[d])), b = Math.max(...days.slice(half).map(d => byDay[d]));
  if (b > a * 1.05) return null;
  const fbs = (S.fb || []).filter(f => f.t >= since), hard = fbs.filter(f => f.k === "hard" || f.k === "pain").length;
  return adaptOf(id) <= 0.7 ? "beaucoup de séries ratées : la charge était trop haute" : hard >= 2 ? "des séances ressenties dures ou douloureuses" : days.length < 6 ? "des séances un peu espacées" : "le corps consolide : c'est normal, ça se débloque souvent après une semaine plus légère";
}
// semaine plus légère sur une figure en plateau (déclenchée une fois toutes les 3 semaines), puis on repart d'une charge neutre
function lightWeek(id){ if (deloadWeek()) return false; const d = (S.dl || {})[id]; return !!d && Date.now() - d < 7 * 864e5; }
function checkPlateau(id){ if (deloadWeek() || afterDeload()) return; const dl = S.dl || (S.dl = {}); if (dl[id] && Date.now() - dl[id] < 21 * 864e5) return; if (plateau(id)) { dl[id] = Date.now(); if (S.adapt) delete S.adapt[id]; } }
// la règle de validation, en clair (même règle que hitTarget)
function valTxt(m){ const V = valRule(m.id); return "Validation : la cible tenue sur " + V.n + " séances" + (V.gap > 1 ? ", espacées d'au moins " + V.gap + " jours" : ", jours différents") + (V.span ? ", sur " + V.span + " jours au moins" : "")
  + (SIDED.has(m.id) ? ", des deux côtés" : "") + (/^pl_/.test(m.id) && m.type === "hold" ? ", avec 3 séries à la cible à chaque fois" : "") + "."; }
function planFor(m){
  const x = st(m.id), L = lvls(m), k = lvlOf(m), out = {head:"", lines:[], short:"", n:null}; let T = nextStep(m);
  if (x.done) { out.head = "Figure maîtrisée"; out.short = "Entretien : une ou deux fois par semaine."; out.lines = ["Cette figure t'appartient. Reviens-y une ou deux fois par semaine, quand ça te fait plaisir, pour l'entretenir, en échauffement des jalons suivants."]; return out; }
  const miss = (m.req||[]).filter(r=>!st(r).done);
  // Deux rythmes : l'équilibre est une habileté, elle se travaille presque tous les jours ; la force (planche, montées, un bras, équilibres bas) demande plus de récupération.
  const force = /^(pl_|pr_|lo_|ul_)/.test(m.id) || m.id === "in_hspu", prReps = /^pr_/.test(m.id) && m.type === "reps" && !/Lift$/.test(m.id),   /* les élévations se dosent comme des répétitions normales */ oaReps = m.sec === "onearm" && m.type === "reps", days = /^(pl_|pr_)/.test(m.id) ? 3 : force ? 4 : 5,
    sets = /^ul_/.test(m.id) ? 4 : oaReps ? 6 : prReps ? 4 : m.id === "oa_wall" ? 8 : /^pl_/.test(m.id) ? 5 : force ? 6 : 8, tries = oaReps ? 0 : prReps ? 1 : /^pl_/.test(m.id) ? 3 : 2;   // descentes de montée : 4 × 1, une tentative
  const freq = days + " séances par semaine" + (force ? " : laisse un jour de douceur entre deux, ton corps construit pendant le repos." : " : c'est une habileté, la fréquence compte plus que la durée.");
  // équilibre libre : c'est une habileté, on la travaille en essais tenus jusqu'à la perte d'équilibre
  if (FREE(m) && lightWeek(m.id) && k > 0) T = L[k - 1];   // semaine plus légère : le palier précédent, pas de validation
  if (FREE(m)) { const one = m.sec === "onearm" || SIDED.has(m.id), T0 = nextStep(m) || 0, n = one ? 10 : T0 >= 40 ? 8 : 15, rest = one ? 45 : Math.max(30, Math.min(60, T0));   // tenues longues : moins d'essais, plus de repos
    out.n = {sets:n, attempts:true, T, hold:true, work:T, tries:0, rest, sides:one};
    out.head = "Plan pour le niveau " + (k + 1) + " sur " + L.length + " : " + T + " s";
    out.short = n + " essais" + (one ? " par côté, en alternant" : "") + ", chacun tenu tant que c'est calme, " + rest + " s de repos. " + days + " séances par semaine.";
    out.lines = [freq, "À chaque séance : " + n + " montées" + (one ? " par côté, en alternant gauche et droite (commence par ton côté faible)" : "") + ". Tiens chacune tant que c'est calme, sors proprement (roue ou retour sur les pieds), " + rest + " s de repos.",
      "Le chrono bipe à " + T + " s : le palier est acquis dès qu'un essai l'atteint.", x.best > 0 ? "Ton record : " + fmt(m, x.best) + "." : "Pas encore de record : chaque essai compte.",
      "La qualité avant la quantité : arrête la séance quand les montées deviennent brouillonnes.", valTxt(m)];
    if (miss.length) out.lines.unshift("D'abord : " + miss.map(r=>MS[r].name).join(" + ") + ".");
    return out; }
  if (m.type === "check"){
    out.n = {sets, check:true};
    out.head = "Plan pour réussir cette figure"; out.short = sets + " essais par séance, " + days + " séances par semaine.";
    out.lines = [freq, "À chaque séance : " + sets + " essais ; " + (/^ul_/.test(m.id) ? "une réussite par séance compte, il en faut sur 3 séances espacées de 2 jours." : "3 réussites dans une même séance comptent, il en faut sur 2 séances."), (FORCE(m.id) ? "Les autres jours : repos des épaules et des coudes, pas d'essai à froid." : "Les autres jours, 2 ou 3 essais à froid dans la journée entretiennent le geste."), "Quand le geste fatigue, c'est le signal pour souffler, pas un échec.", "C'est toi qui valides, honnêtement : quand tu le réussis proprement 3 fois sur 5, touche « Je l'ai réussi »."];
  } else {
    const hold = m.type === "hold", lo = hold ? Math.min(2, T) : 1;
    // charge de travail : les trois quarts du record quand il existe, sinon la moitié de la cible ; jamais plus de 80 % de la cible
    // charge adaptative : chaque séance règle un coefficient par figure (réussite, chutes, ressenti) ; une douleur récente allège
    const fct = adaptOf(m.id) * Math.min(painRecent() ? 0.75 : 1, lightWeek(m.id) ? 0.7 : 1);
    const work = oaReps ? (lightWeek(m.id) ? Math.max(1, T - 1) : T) : prReps ? 1 : Math.max(lo, Math.min(Math.round(T * 0.85), x.best > 0 ? Math.round(x.best * 0.6) : 0),   /* jamais sous 60 % du record */ Math.min(T, Math.min(Math.round(T * 0.85), Math.round(Math.min(Math.round(T * 0.8), x.best > 0 ? Math.round(x.best * 0.75) : Math.round(T * 0.5)) * fct)))),   /* le travail reste sous la cible */ u = v => hold ? v + " s" : v + " répétition" + (v > 1 ? "s" : "");
    out.head = "Plan pour le niveau " + (k + 1) + " sur " + L.length + " : " + u(T);
    const tries2 = work >= T ? 0 : tries; out.n = {sets, work, tries:tries2, T, hold, sides:SIDED.has(m.id)};
    out.short = sets + " × " + (hold ? work + " s" : work + " rép.") + (tries2 ? ", puis " + tries2 + (tries2 > 1 ? " tentatives" : " tentative") + " à " + (hold ? T + " s" : T + " rép.") : "") + ". " + days + " séances par semaine.";
    out.lines = [freq,
      "À chaque séance : " + sets + " " + (hold ? "tenues de " + work + " s" : "séries de " + work + (work > 1 ? " répétitions" : " répétition")) + ", " + (force ? "2 à 3 min" : "60 à 90 s") + " de repos entre chacune" + (hold ? " (" + num(sets * work / 60) + " min sous tension au total)." : "."),
      (/^pl_/.test(m.id) ? "Termine par 3 tentatives à " + u(T) + ", 3 min de repos entre chacune. Une tenue à la cible ouvre le niveau suivant ; la figure se valide quand les 3 tentatives passent dans une même séance, sur 2 séances : les tendons aussi doivent être prêts." : (tries > 1 ? "Termine par " + tries + " tentatives à " + u(T) + ", avec 2 minutes de repos entre chacune." : "Termine par une tentative à " + u(T) + ".") + " Réussie, elle fait passer le palier ; au dernier palier, la règle de validation s'applique."),
      force ? "Les jours sans séance : mobilité et souplesse, pas de force." : "Les jours sans séance, 2 ou 3 tenues courtes dans la journée entretiennent l'équilibre sans fatiguer.",
      x.best > 0 ? "Ton record : " + fmt(m, x.best) + ". Chaque petite tenue te rapproche de " + u(T) + "." : "Pas encore de record : commence par une tentative pour voir où tu en es.",
      "Chaque semaine, ajoute une série tant que les dernières restent propres ; à " + (sets + 4) + " séries, repars de " + sets + " avec des tenues plus longues.",
      "Douleur au pli du coude, au poignet ou à l'avant de l'épaule : arrête la figure et signale-la. Si tu stagnes trois semaines, l'app allège cette figure une semaine, automatiquement."];
  }
  if (miss.length) out.lines.unshift("D'abord : " + miss.map(r=>MS[r].name).join(" + ") + ". Tu peux déjà t'essayer ici, mais le plan suppose ces bases.");
  if (m.type !== "check") out.lines.push(valTxt(m));
  if (SOUPLE.has(m.id)) out.lines.push("La souplesse compte pour cette figure : ajoute deux séances d'étirements par semaine (programme Étirements).");
  const pp = PLAN_PROG[m.id]; if (pp && PS[pp[0]] && !progLock(pp[0])) out.prog = pp;
  return out;
}
function openProg(pid, step){ pg().cur = pid; if (step != null) { pickP(); pp().step = step; } save(); render(); showTab("today"); window.scrollTo(0, 0); }

// ---------- Le parcours : une seule carte, de haut en bas. Tronc commun, puis le niveau difficile et ses trois voies. ----------
const HARD = [["onearm","Un bras"],["planche","Planche"],["press","Montées en force"]];
// un coffre s'ouvre quand les figures du chemin de l'étage sont validées (les bonus hors chemin ne comptent pas)
function chestOpen(s){ return !!s && s.ms.filter(m=>!m.alt).every(m=>reqDone(m.id)); }
// Coffres : un par étage, ouvert quand l'étage est terminé ; chacun débloque une tenue.
const CHESTS = {base:["bottom","short_n","Short marine"], starter:["head","band_b","Bandeau bleu"], b1:["wrists","wraps_b","Bandes de poignets bleues"], b2:["top","tank_b","Débardeur bleu"], inter:["bottom","short_p","Short violet"],
  onearm:["top","ls_o","Manches longues orange"], planche:["bottom","pants_v","Pantalon vert"], press:["head","beanie_y","Bonnet jaune"], low:["extra","belt_y","Ceinture jaune"]};
// Estimation, à ton rythme : semaines pour atteindre la cible d'une figure (d'après tes progrès enregistrés, sinon une estimation prudente)
function eta(m){
  const x = st(m.id); if (x.done || !m.target || m.type === "check") return null; const T = m.target;
  const logs = S.log.filter(l=>(l.id === m.id || l.id === "pg:" + m.name) && typeof l.v === "number"); let wk = null;
  if (logs.length >= 2) { const days = (Date.now() - logs[0].t) / 864e5, gain = x.best - logs[0].v; if (days >= 3 && gain > 0) wk = (T - x.best) / (gain / (days / 7)); }
  if (wk == null) wk = 1 + 4 * (1 - Math.min(1, x.best / T));
  const V = valRule(m.id), left = Math.max(0, V.n - hitInfo(m.id).days), since = Date.now() - 28 * 864e5;
  const perWk = Math.max(1, new Set(S.log.filter(l => l.t >= since && (l.id === m.id || l.id === "pg:" + m.name)).map(l => dayKey(l.t))).size / 4);
  const hd = (S.hit && S.hit[m.id] && S.hit[m.id].days) || [], spanLeft = Math.max(0, V.span - (hd.length ? dayDiff(dayKey(Date.now()), hd[0]) : 0));
  wk = Math.max(wk, spanLeft / 7, left / perWk);   // on ne peut pas valider plus vite que la règle
  return Math.max(1, Math.min(52, Math.round(wk)));
}
const etaTxt = w => w == null ? "" : w <= 1 ? "≈ 1 semaine" : "≈ " + w + " semaines";
// ---------- Le parcours : un seul chemin qui serpente, figure après figure ; il se divise en trois voies au niveau difficile.
function journey(nextId){
  const RH = 196, SH = 84, X = [50, 70, 78, 70, 50, 30, 22, 30], pos = {}, items = [], wrap = el("div","jr jr2");
  let y = 10, k = 0, prev = null, edges = "", n = 0;
  const seg = (a, b, cls) => { const my = (a[1] + b[1]) / 2; edges += '<path class="' + cls + '" d="M' + a[0] + ' ' + a[1] + 'C' + a[0] + ' ' + my + ',' + b[0] + ' ' + my + ',' + b[0] + ' ' + b[1] + '"/>'; };
  const eCls = (doneA, idB, lkB) => doneA && (idB ? st(idB).done : false) ? "on" : doneA && !lkB ? "go" : "";
  const sign = (title, sid, sub) => { const ms = (sid === "hard" ? HARD.flatMap(h=>SEC[h[0]].ms) : SEC[sid].ms).filter(m=>!m.alt), dn = ms.filter(m=>reqDone(m.id)).length,
      state = ms.filter(m=>!m.alt).every(m=>reqDone(m.id)) ? "done" : ms.some(m=>!reqDone(m.id) && !msLocked(m)) ? "cur" : "lk";
    items.push({k:"b", y, title, sid, sub, dn, tot:ms.length, state, n:++n}); y += SH; };
  const node = (id, x, small) => { pos[id] = [x, y + 40, small]; items.push({k:"n", id}); };
  const chest = (sid, x, lane) => { const done = sid === "hard" ? false : chestOpen(SEC[sid]); pos["chest_" + sid] = [x, y + 34]; items.push({k:"c", sid, x, y, done, lane}); };
  const step = (id, small) => { const x = X[k++ % X.length]; node(id, x, small); if (prev) seg(pos[prev], pos[id], eCls(prev.startsWith("chest_") ? chestDone(prev) : st(prev).done, id, msLocked(MS[id]) && !st(id).done)); prev = id; y += RH; };
  const chestDone = cid => chestOpen(SEC[cid.slice(6)]);
  // le tronc commun : une figure par ligne, dans l'ordre du parcours
  // un seul chemin qui serpente, étage après étage ; les trois disciplines difficiles ont chacune le leur (plus de lignes droites)
  // disciplines difficiles : une seule affichée à la fois (sélecteur), celle de ta prochaine figure par défaut
  const jd = S.jdisc && SEC[S.jdisc] ? S.jdisc : (HARD.find(h => SEC[h[0]].ms.some(m => m.id === nextId)) || HARD.find(h => SEC[h[0]].ms.some(m => !st(m.id).done && !msLocked(m))) || HARD[0])[0];
  ["base","starter","b1","b2","inter",jd].forEach(sid=>{ const s = SEC[sid], ids = new Set(s.ms.map(m=>m.id)), dep = {};
    if (sid === jd) { const pv = prev;
      // les figures au sol, à part, avant les disciplines difficiles : le sommet (le combo) reste tout en bas
      sign("Figures au sol", "low", "Hors parcours, accessibles dès le départ : pour varier.");
      prev = null; SEC.low.ms.forEach(m=>step(m.id));
      { const x = X[k++ % X.length]; chest("low", x); seg(pos[prev], pos.chest_low, secDone(SEC.low) ? "on" : ""); y += RH - 20; }
      prev = pv; items.push({k:"d", y}); y += 92; prev = null; }
    const d = m => dep[m.id] != null ? dep[m.id] : (dep[m.id] = 1 + Math.max(-1, ...(m.req||[]).filter(r=>ids.has(r)).map(r=>d(MS[r]))));
    sign(s.name, sid, "");
    s.ms.filter(m=>!m.alt).sort((a,b)=>d(a) - d(b)).forEach(m=>step(m.id));
    s.ms.filter(m=>m.alt).forEach((m, i)=>{ const x = X[(k - 1 - i + 99 * X.length) % X.length] >= 50 ? 22 : 78; pos[m.id] = [x, y - RH + 40 - i * RH, true];   /* plusieurs bonus : un par rangée, jamais superposés */ items.push({k:"n", id:m.id, alt:true}); y += 0; });
    const x = X[k++ % X.length]; chest(sid, x); seg(pos[prev], pos["chest_" + sid], st(prev).done ? (chestOpen(s) ? "on" : "go") : ""); prev = "chest_" + sid; y += RH - 10; });
  // le sommet : le combo ultime, qui réunit les trois disciplines
  { const s = SEC.ultime; sign(s.name, "ultime", "Tout enchaîner, sans poser les pieds."); prev = null; s.ms.forEach(m=>step(m.id)); y += 30; }
  const H = y, cv = el("div","jr-c"); cv.style.height = H + "px";
  cv.innerHTML = '<svg class="jr-e" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + edges + '</svg>';
  items.forEach(it=>{
    if (it.k === "b"){ const b = el("div","sign " + it.state + (it.sid === "hard" ? " hard" : "")); b.style.top = it.y + "px";
      const md = el("span","md"); if (it.state === "done") md.innerHTML = ICON.check; else if (it.state === "lk") md.innerHTML = ICON.lock; else md.textContent = it.sid === "low" ? "+" : String(it.n);
      const g = el("div","grow"); g.append(el("div","sname", it.title), el("div","mut", it.sub));
      b.append(md, g, el("span","cnt", it.dn + "/" + it.tot)); if (SEC[it.sid] && SEC[it.sid].videos.length) { const vc = vidChip(it.sid); vc.firstChild.textContent = "Vidéos"; b.append(vc); } cv.append(b); }
    else if (it.k === "l"){ const l = el("div","jr-l" + (it.open ? " open" : "")); l.style.top = it.y + "px"; l.style.left = it.x + "%"; l.append(el("div","sname",it.name), el("div","mut", it.open ? "Voie ouverte" : "Après : " + it.after)); cv.append(l); }
    else if (it.k === "d"){ const d = el("div","dsel"); d.style.top = it.y + "px";
      HARD.forEach(([sid, name]) => { const ms = SEC[sid].ms.filter(m=>!m.alt), dn = ms.filter(m=>reqDone(m.id)).length, here = ms.some(m=>m.id === nextId);
        const b = el("button","dpill d-" + sid + (sid === jd ? " on" : "")); b.append(el("b",null,name), el("span",null, dn + "/" + ms.length + (here ? " · toi" : "")));
        b.setAttribute("aria-pressed", sid === jd); b.onclick = () => { S.jdisc = sid; save(); render(); const t = document.querySelector(".dsel"); if (t) t.scrollIntoView({block:"start"}); }; d.append(b); });
      cv.append(d); }
    else if (it.k === "c"){ const C = CHESTS[it.sid], c = el("button","chest" + (it.done ? " open" : "")); c.style.left = it.x + "%"; c.style.top = it.y + "px";
      c.innerHTML = it.done ? '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M8 22h32v16H8z"/><path d="M8 22l4-12h24l4 12" fill="currentColor" fill-opacity=".25"/><path d="M24 26v6"/></svg>'
        : '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M8 20h32v18H8z"/><path d="M8 20c0-6 4-10 16-10s16 4 16 10"/><path d="M8 26h32"/><rect x="21" y="23" width="6" height="7" rx="1"/></svg>';
      c.setAttribute("aria-label", (it.done ? "Coffre ouvert : " : "Coffre fermé : ") + C[2]);
      c.onclick = () => { if (it.done) { toast("Coffre ouvert : " + C[2] + ". Enfile-le dans le vestiaire (Profil)."); } else toast("Termine l'étage pour ouvrir ce coffre : " + C[2] + "."); };
      c.append(el("span","cl", it.done ? C[2] : "Coffre")); cv.append(c); }
    else { const id = it.id, m = MS[id], x = st(id), lk = !x.done && msLocked(m), p = pos[id], L = lvls(m), kk = lvlOf(m), cur = id === nextId, small = it.alt;
      const b = el("button","jn d-" + m.sec + (x.done ? " done" : lk ? " lk" : cur ? " cur" : " open") + (small ? " sm alt" : "")); b.dataset.id = id;
      b.style.left = p[0] + "%"; b.style.top = (p[1] - (small ? 48 : cur ? 64 : 58)) + "px";   // centre du rond sur le chemin
      b.setAttribute("aria-label", m.name + (m.target ? ", " + goalTxt(m) : "") + ", niveau " + kk + " sur " + L.length + (lk ? ", verrouillé" : ""));
      const c = el("span","c"), R = 39, Cc = 2*Math.PI*R, sg = Cc / L.length, gap = L.length > 1 ? 5 : 0;
      let ring = '<svg class="rg" viewBox="0 0 84 84" width="84" height="84" fill="none" aria-hidden="true">';
      L.forEach((_,i)=>{ ring += '<circle cx="42" cy="42" r="' + R + '" class="' + (i < kk ? "f" : "") + '" stroke-dasharray="' + (sg - gap).toFixed(1) + ' ' + (Cc - sg + gap).toFixed(1) + '" stroke-dashoffset="' + (-(i*sg + gap/2)).toFixed(1) + '"/>'; });
      c.innerHTML = ring + '</svg>'; const sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = lk ? 1 : ""; sprPaint(sp, small ? 72 : cur ? 104 : 92); c.append(sp);
      if (x.done) c.append(icon("check","ck")); else if (lk) c.append(icon("lock","lkb"));
      b.append(c, el("span","n", m.name));
      const nx = nextStep(m);
      b.append(el("span","g", x.done ? "" : lk ? (m.target ? goalTxt(m) : "") : L.length > 1 ? "Niveau " + kk + "/" + L.length + " · " + unitTxt(m, nx) : small ? "Bonus" : m.target ? goalTxt(m) : ""));
      b.onclick = () => quick(id); cv.append(b);
      // toi, sur le chemin : ton personnage se tient à côté de ta figure du moment
      if (cur) { const me = el("div","me" + (it.lane ? " lane" : "")), msp = el("span","sp"); msp.dataset.pose = "stand"; msp.dataset.anim = "me"; msp.dataset.lk = ""; sprPaint(msp, it.lane ? 56 : 76); me.append(msp, el("span","tag","Toi"));
        if (it.lane) { me.style.left = p[0] + "%"; me.style.top = (p[1] - 100) + "px"; } else { // à côté de la figure, du côté libre (pas sur une figure bonus voisine)
          let mx = p[0] >= 50 ? p[0] - 30 : p[0] + 30; const busy = x0 => items.some(o => o.k === "n" && o.alt && pos[o.id] && Math.abs(pos[o.id][1] - p[1]) < 70 && Math.abs(pos[o.id][0] - x0) < 25);
          if (busy(mx)) mx = p[0] >= 50 ? p[0] + 30 : p[0] - 30; me.style.left = Math.max(10, Math.min(90, mx)) + "%"; me.style.top = (p[1] - 46) + "px"; }
        cv.append(me); }
    }
  });
  wrap.append(cv);
  { const s = SEC.key; if (s && s.videos.length) { const kb = vidChip("key"); kb.classList.add("wide"); kb.firstChild.textContent = "Concepts clés, pour tous les niveaux"; wrap.append(kb); } }
  return wrap;
}
// Carte rapide d'une figure : animation, niveau, estimation, et deux boutons.
function quick(id){
  const m = MS[id], x = st(id), lk = !x.done && msLocked(m), L = lvls(m), kk = lvlOf(m), box = $("qkBody"); box.textContent = "";
  const art = el("div","qkart"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 120); art.append(sp);
  const g = el("div","grow"); g.append(el("div","lab", SEC[m.sec].name), el("h2",null, m.name));
  if (L.length > 1) { const pips = el("div","pips"); L.forEach((v,i)=>{ const p = el("span", i < kk ? "ok" : i === kk ? "now" : ""); p.textContent = unitTxt(m, v); pips.append(p); }); g.append(pips); }
  const w = eta(m); g.append(el("div","mut", x.done ? "" : lk ? "Verrouillée pour l'instant" : w ? "À ton rythme : " + etaTxt(w) + " pour " + goalTxt(m) : ""));
  // mini-arbre : en haut les figures requises (allumées si validées), reliées à la figure ; un toucher ouvre le parent
  const req = (m.req || []).filter(r=>MS[r]);
  if (req.length) { const tr = el("div","qktree"), par = el("div","qkpar"); par.style.gridTemplateColumns = "repeat(" + req.length + ",1fr)";
    let paths = ""; req.forEach((r,i)=>{ const on = st(r).done, b = el("button","qkn" + (on ? " on" : "")), ps = el("span","sp"); ps.dataset.pose = poseId(r); ps.dataset.anim = r; ps.dataset.lk = on ? "" : 1; sprPaint(ps, 56);
      b.append(ps, el("i",null, MS[r].name)); b.setAttribute("aria-label", MS[r].name + (on ? ", validée" : ", à valider")); b.onclick = () => quick(r); par.append(b);
      const x = (i + 0.5) / req.length * 100; paths += '<path class="' + (on ? "on" : "") + '" d="M' + x.toFixed(1) + ' 0 C' + x.toFixed(1) + ' 16 50 12 50 28"/>'; });
    const ln = el("div","qklink"); ln.innerHTML = '<svg viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">' + paths + '</svg>'; tr.append(par, ln); box.append(tr); }
  const top = el("div","qktop"); top.append(art, g); box.append(top);
  // ce qui bloque, en une ligne : prérequis manquant, critère pas encore atteint, ou rien
  { const D0 = DETAILS[id] || {}, hi = hitInfo(id), blk = el("div","qkblock"), bar = f => { const b = el("div","bar"), i = el("span"); i.style.width = Math.round(Math.min(1, f) * 100) + "%"; b.append(i); blk.append(b); };
    if (x.done) { blk.classList.add("ok"); const nx = SEC[m.sec].ms.map(q=>q.id).find(i=>!reqDone(i) && !msLocked(MS[i])) || GOALS[0].ms.find(i=>!reqDone(i) && !msLocked(MS[i]));   /* la suite dans la même discipline d abord */ blk.append(el("b",null,"Maîtrisé"), el("p",null, nx ? "Prochaine figure : " + MS[nx].name + "." : "Tout est validé.")); bar(1); }
    else if (lk) blk.append(el("b",null,"Il te manque : " + missing(m)), el("p",null,((m.req || []).filter(r=>!st(r).done).length > 1 ? "Valide-les d'abord." : "Valide-la d'abord.") + " Tu peux quand même essayer."));
    else if (plateau(id)) { blk.append(el("b",null,"Plateau depuis 3 semaines"), el("p",null,"Pourquoi : " + plateau(id) + ". " + (lightWeek(id) ? "Semaine plus légère en cours sur cette figure, puis on repart." : "Elle sera allégée une semaine à sa prochaine séance."))); bar(Math.min(1, x.best / (m.target || 1))); }
    else if (hi.days) { blk.append(el("b",null, hi.days + " séance validée sur " + valRule(id).n), el("p",null,"Refais la cible un autre jour pour valider la figure." + (D0.err ? " À surveiller : " + D0.err : ""))); bar(hi.days / valRule(id).n); }
    else if (x.best > 0 && m.target) { blk.append(el("b",null,"Record " + fmt(m, x.best) + " · cible " + goalTxt(m)), el("p",null,"Il reste " + (m.type === "hold" ? num(Math.max(0, m.target - x.best)) + " s" : Math.max(0, m.target - x.best) + " rép.") + "." + (D0.err ? " À surveiller : " + D0.err : ""))); bar(x.best / m.target); }
    else blk.append(el("b",null,"Pour valider"), el("p",null, D0.ok || (m.target ? goalTxt(m) + ", sur 2 séances." : "Réussie sur 2 séances.")));
    top.after(blk); }
  { // historique : meilleur temps de chaque jour d'entraînement sur cette figure
    const byDay = {}; S.log.filter(l=>(l.id === id || l.id === "pg:" + m.name) && typeof l.v === "number").forEach(l=>{ const d = dayKey(l.t); byDay[d] = Math.max(byDay[d] || 0, l.v); });
    const pts = Object.values(byDay).slice(-20);
    if (pts.length >= 2 && m.target) { const W = 300, H = 70, mx = Math.max(m.target, ...pts), X = i => 6 + i * (W - 12) / (pts.length - 1), Y = v => H - 8 - v / mx * (H - 16);
      const svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + Y(m.target) + '" y2="' + Y(m.target) + '" stroke="var(--acc)" stroke-dasharray="4 4" stroke-width="1.5"/>'
        + '<polyline fill="none" stroke="var(--txt)" stroke-width="2.5" stroke-linejoin="round" points="' + pts.map((v,i)=>X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ") + '"/>' + pts.map((v,i)=>'<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.5" fill="var(--txt)"/>').join("") + '</svg>';
      const h = el("div","hist"); h.append(el("div","lab","Ton historique · " + pts.length + " séances")); const gr = el("div"); gr.innerHTML = svg; h.append(gr, el("div","mut","Pointillés : la cible (" + goalTxt(m) + "). Meilleur : " + fmt(m, Math.max(...pts)) + ".")); box.append(h); }
  }
  const row = el("div","btns"), go = el("button","btn", lk ? "Essayer" : x.done ? "Refaire" : m.type === "hold" ? "S'entraîner" : "Je l'ai réussi"), more = el("button","btn line","Chrono et journal");
  go.onclick = () => { $("qkDlg").close(); openMs(id); if (m.type === "hold") setTimeout(()=>{ const gb = $("go"); if (gb && $("dlg").open) { $("clock").scrollIntoView({block:"center"}); gb.click(); } }, 250); else if (!lk) setTimeout(()=>$("toggle").scrollIntoView({block:"center"}), 250); };
  more.onclick = () => { $("qkDlg").close(); openMs(id); };
  row.append(go, more); box.querySelector(".qkblock").after(row);
  // le détail reste replié : la carte montre d'abord l'essentiel (prérequis, ce qui bloque, les deux boutons)
  const D = DETAILS[id] || {}, info = el("div","qkinfo"), fold = (title, node) => { const d = el("details","qkd"), sm = el("summary"); sm.textContent = title; d.append(sm, node); info.append(d); };
  { const t = el("div"); if (m.desc) t.append(el("p",null,m.desc)); if (D.how && D.how.length) { const ol = el("ol"); D.how.forEach(v=>ol.append(el("li",null,v))); t.append(ol); }
    if (D.cue && D.cue.length) t.append(el("p","mut", D.cue.join(" · "))); if (D.err) t.append(el("p",null,"À éviter : " + D.err)); if (t.childElementCount) fold("Technique", t); }
  { const t = el("div"); if (!x.done) t.append(el("p",null, planFor(m).short));
    const dl = el("ul","drc"); drillsFor(m).forEach(k=>{ const d = DRILLS[k]; dl.append(el("li",null, d.name + " · " + d.sets[0] + " × " + (d.kind === "hold" ? d.sets[1] + " s" : d.sets[1]))); });
    if (dl.childElementCount) t.append(dl); if (t.childElementCount) fold(x.done ? "Préparation" : "Plan et préparation", t); }
  if (m.yt && m.yt.length) { const v = el("div"); m.yt.forEach(([vid,t])=>v.append(ytLink(vid, "Vidéo : " + t))); fold("Vidéo", v); }
  box.append(info);
  $("qkDlg").showModal(); $("qkDlg").scrollTop = 0;
}

const vidKey = (s, v) => s.id + "|" + v[1];
function vidChip(sid){ const s = SEC[sid], b = el("button","vchip"); b.append(el("span",null,"Vidéos du programme"), el("b",null, s.videos.filter(v=>S.vid[vidKey(s,v)]).length + "/" + s.videos.length)); b.onclick = e => { e.stopPropagation(); openVids(sid); }; return b; }
function openVids(sid){ const s = SEC[sid], box = $("vdBody"); $("vdT").textContent = "Vidéos · " + s.name; box.textContent = "";
  s.videos.forEach(v=>{ const l = el("label","vid"), cb = el("input"); cb.type = "checkbox"; cb.checked = !!S.vid[vidKey(s,v)];
    cb.onchange = () => { S.vid[vidKey(s,v)] = cb.checked; save(); render(); };
    const tx = el("span"); tx.append(el("div",null,v[0]), el("div","orig","Titre d'origine : " + v[1])); l.append(cb, tx); box.append(l); });
  $("vdDlg").showModal(); }
const ringSvg = (frac, size, r, w, cls) => { const C = 2*Math.PI*r, c = size/2; return '<svg class="' + (cls || "") + '" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" fill="none" aria-hidden="true"><circle cx="' + c + '" cy="' + c + '" r="' + r + '" stroke="var(--line)" stroke-width="' + w + '"/>' + (frac > 0 ? '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" stroke="var(--acc)" stroke-width="' + w + '" stroke-linecap="round" transform="rotate(-90 ' + c + ' ' + c + ')" stroke-dasharray="' + (C*Math.min(1,frac)).toFixed(1) + ' ' + C.toFixed(1) + '"/>' : "") + '</svg>'; };
const BFAM = [["Régularité",["first","st3","st7","st30"]],["Séances et volume",["se10","se50","s100","s1000"]],["Temps en appui et souplesse",["h10","h60","e10"]],["Étages du parcours",null,"sec_"],["Quêtes accomplies",null,"goal_"]];
const badgeReward = id => { const out = []; WARD.forEach(w=>w.items.forEach(it=>{ if (it[2] === "b:" + id) out.push(it[1]); })); if (id.startsWith("goal_")) out.push("Médaille"); return out; };
function renderQuest(S0, nextId){
  const box = $("quest"); box.textContent = "";
  // badges : un médaillon par objectif, l'anneau montre l'avancement
  const head = el("h2","sect","Badges"); head.id = "sect-badges"; box.append(head);
  const got = S0.badges.filter(b=>b.ok).length;
  box.append(el("p","intro-t", got + " / " + S0.badges.length));
  const next3 = new Set(S0.badges.filter(b=>!b.ok).sort((a,b)=>b.cur / b.max - a.cur / a.max).slice(0, 3).map(b=>b.id)), shown = b => S.allB || b.ok || next3.has(b.id);
  BFAM.forEach(([name, ids, pre])=>{ const list = S0.badges.filter(b=>(ids ? ids.includes(b.id) : b.id.startsWith(pre)) && shown(b)); if (!list.length) return;
    box.append(el("div","lab bfam",name)); const grid = el("div","badges");
    list.forEach(b=>{ const x = el("button","bdg" + (b.ok ? "" : " off")); x.setAttribute("aria-label", b.name + ", " + (b.ok ? "obtenu" : b.cur + " sur " + b.max));
      const m = el("span","m"); m.innerHTML = ringSvg(b.ok ? 0 : b.cur / b.max, 76, 35, 4, "rg"); m.append(el("span","gl", b.g)); if (b.ok) m.append(icon("check","ck"));
      x.append(m, el("span","bn", b.name), el("span","bc", b.ok ? "Obtenu" : b.t ? mins(b.cur) + " / " + mins(b.max) + " min" : b.cur + " / " + b.max));
      x.onclick = () => { $("bdG").textContent = b.g; $("bdT").textContent = b.name; $("bdD").textContent = b.desc; $("bdBar").style.width = (b.cur / b.max * 100) + "%";
        $("bdC").textContent = b.ok ? "Obtenu" : (b.t ? mins(b.cur) + " / " + mins(b.max) + " min" : b.cur + " / " + b.max);
        const rw = badgeReward(b.id); $("bdR").textContent = "Récompense : 40 points d'expérience" + (rw.length ? " · tenue : " + rw.join(", ") : ""); $("bdDlg").showModal(); };
      grid.append(x); });
    box.append(grid); });
  { const more = el("button","golink", S.allB ? "Moins de badges" : "Tous les badges (" + S0.badges.length + ")"); more.onclick = () => { S.allB = !S.allB; save(); render(); }; box.append(more); }
}
