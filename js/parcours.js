// Plans d'entraînement par figure, parcours, coffres, estimation, carte rapide, quête.
"use strict";
// ---------- Accompagnement : un plan concret pour passer au niveau suivant de chaque jalon ----------
// Ces plans sont des repères généraux d'entraînement (les miens, pas ceux des programmes) : volume modéré, souvent, sans aller à l'échec.
const PLAN_PROG = {pl_lean:["planche-domination",0], pl_tuck:["planche-domination",1], pl_adv:["planche-domination",2], pl_frog:["planche-domination",3],
  pl_pike:["planche-domination",4], pl_straddle:["planche-domination",5], pl_full:["planche-domination",6],
  pr_straddle:["quest-for-the-press",0], pr_pike:["quest-for-the-press",0], pr_stalder:["quest-for-the-press",0]};
const SOUPLE = new Set(["in_7s","in_7d","in_toes7","pr_straddle","pr_pike","pr_stalder","pl_pike","pl_straddle","oa_flaghoriz","oa_flagfloor","st_split"]);
const adaptOf = id => Math.max(0.6, Math.min(1.35, ((S.adapt || {})[id]) || 1));
const painRecent = () => !!S.pain && Date.now() - S.pain < 2 * 864e5;
const FREE = m => m.type === "hold" && ["b1","b2","inter"].includes(m.sec);
const FORCE = id => /^(pl_|pr_)/.test(id) || id === "fd_push" || id === "fd_dips" || id === "in_hspu";
function planFor(m){
  const x = st(m.id), L = lvls(m), k = lvlOf(m), T = nextStep(m), out = {head:"", lines:[], short:"", n:null};
  if (x.done) { out.head = "Jalon maîtrisé"; out.short = "Entretien : une ou deux fois par semaine."; out.lines = ["Tu n'as plus rien à prouver ici. Refais la figure une ou deux fois par semaine pour l'entretenir, en échauffement des jalons suivants."]; return out; }
  const miss = (m.req||[]).filter(r=>!st(r).done);
  // Deux rythmes : l'équilibre est une habileté, elle se travaille presque tous les jours ; la force (planche, montées, un bras, équilibres bas) demande plus de récupération.
  const force = /^(pl_|pr_|oa_|lo_)/.test(m.id) || m.id === "in_hspu", days = force ? 4 : 5, sets = force ? 6 : 8, tries = 2;
  const freq = days + " séances par semaine" + (force ? ", jamais deux jours de suite sur la même figure." : " : c'est une habileté, la fréquence compte plus que la durée.");
  // équilibre libre : c'est une habileté, on la travaille en essais tenus jusqu'à la perte d'équilibre
  if (FREE(m)) { const n = 15;
    out.n = {sets:n, attempts:true, T, hold:true, work:T, tries:0};
    out.head = "Plan pour le niveau " + (k + 1) + " sur " + L.length + " : " + T + " s";
    out.short = n + " essais, chacun tenu jusqu'à perdre l'équilibre, 30 s de repos. " + days + " séances par semaine.";
    out.lines = [freq, "À chaque séance : " + n + " montées. Tiens chacune jusqu'à perdre l'équilibre, sors proprement (roue ou retour sur les pieds), 30 s de repos.",
      "Le chrono bipe à " + T + " s : le palier est acquis dès qu'un essai l'atteint.", x.best > 0 ? "Ton record : " + fmt(m, x.best) + "." : "Pas encore de record : chaque essai compte.",
      "La qualité avant la quantité : arrête la séance quand les montées deviennent brouillonnes."];
    if (miss.length) out.lines.unshift("D'abord : " + miss.map(r=>MS[r].name).join(" + ") + ".");
    return out; }
  if (m.type === "check"){
    out.n = {sets, check:true};
    out.head = "Plan pour réussir ce jalon"; out.short = sets + " essais par séance, " + days + " séances par semaine.";
    out.lines = [freq, "À chaque séance : " + sets + " essais, en prenant le temps de récupérer entre chacun.", "Les autres jours, 2 ou 3 essais à froid dans la journée entretiennent le geste.", "Arrête la série si la forme se dégrade : un essai propre vaut mieux que trois brouillons.", "C'est toi qui valides, honnêtement : quand tu le réussis proprement 3 fois sur 5, touche « Je l'ai réussi »."];
  } else {
    const hold = m.type === "hold", lo = hold ? 2 : 1;
    // charge de travail : les trois quarts du record quand il existe, sinon la moitié de la cible ; jamais plus de 80 % de la cible
    // charge adaptative : chaque séance règle un coefficient par figure (réussite, chutes, ressenti) ; une douleur récente allège
    const fct = adaptOf(m.id) * (painRecent() ? 0.75 : 1);
    const work = Math.max(lo, Math.min(T, Math.round(Math.min(Math.round(T * 0.8), x.best > 0 ? Math.round(x.best * 0.75) : Math.round(T * 0.5)) * fct))), u = v => hold ? v + " s" : v + " répétition" + (v > 1 ? "s" : "");
    out.head = "Plan pour le niveau " + (k + 1) + " sur " + L.length + " : " + u(T);
    const tries2 = work >= T ? 0 : tries; out.n = {sets, work, tries:tries2, T, hold};
    out.short = sets + " × " + (hold ? work + " s" : work + " rép.") + ", puis " + tries + " tentatives à " + (hold ? T + " s" : T + " rép.") + ". " + days + " séances par semaine.";
    out.lines = [freq,
      "À chaque séance : " + sets + " " + (hold ? "tenues de " + work + " s" : "séries de " + work + (work > 1 ? " répétitions" : " répétition")) + ", 60 à 90 s de repos entre chacune" + (hold ? " (" + num(sets * work / 60) + " min sous tension au total)." : "."),
      "Termine par " + tries + " tentatives à " + u(T) + ", avec 2 minutes de repos entre les deux. Si l'une passe, le niveau est acquis et la cible suivante s'affiche.",
      force ? "Les jours sans séance : mobilité et souplesse, pas de force." : "Les jours sans séance, 2 ou 3 tenues courtes dans la journée entretiennent l'équilibre sans fatiguer.",
      x.best > 0 ? "Ton record : " + fmt(m, x.best) + ". Il te manque " + (hold ? num(Math.max(0, T - x.best)) + " s" : Math.max(0, T - x.best) + " rép.") + "." : "Pas encore de record : commence par une tentative pour voir où tu en es.",
      "Chaque semaine, ajoute une série tant que les dernières restent propres ; à " + (sets + 4) + " séries, repars de " + sets + " avec des tenues plus longues.",
      "Si les poignets ou les épaules tirent, retire deux séries ce jour-là : la régularité prime. Si tu stagnes deux semaines, allège une semaine puis reprends."];
  }
  if (miss.length) out.lines.unshift("D'abord : " + miss.map(r=>MS[r].name).join(" + ") + ". Tu peux déjà t'essayer ici, mais le plan suppose ces bases.");
  if (SOUPLE.has(m.id)) out.lines.push("La souplesse compte pour cette figure : ajoute deux séances d'étirements par semaine (programme Étirements).");
  const pp = PLAN_PROG[m.id]; if (pp && PS[pp[0]] && !progLock(pp[0])) out.prog = pp;
  return out;
}
const TIER_TXT = {base:"Les bases avant de monter : gainage, force, roue, et 60 s au mur.", starter:"Apprendre à monter contre le mur et à sortir sans danger.", b1:"Tenir seul, quelques secondes, loin du mur.", b2:"Tenir longtemps, et commencer à changer de forme.",
  inter:"Contrôler le bassin et le regard : les « 7 », la tête rentrée, les drapeaux."};
function openProg(pid, step){ pg().cur = pid; if (step != null) { pickP(); pp().step = step; } save(); render(); showTab("today"); window.scrollTo(0, 0); }

// ---------- Le parcours : une seule carte, de haut en bas. Tronc commun, puis le niveau difficile et ses trois voies. ----------
const HARD = [["onearm","Un bras"],["planche","Planche"],["press","Montées en force"]];
// un coffre s'ouvre quand les figures du chemin de l'étage sont validées (les bonus hors chemin ne comptent pas)
function chestOpen(s){ return !!s && s.ms.filter(m=>!m.alt).every(m=>st(m.id).done); }
// Coffres : un par étage, ouvert quand l'étage est terminé ; chacun débloque une tenue.
const CHESTS = {base:["bottom","short_n","Short marine"], starter:["head","band_b","Bandeau bleu"], b1:["wrists","wraps_b","Bandes de poignets bleues"], b2:["top","tank_b","Débardeur bleu"], inter:["bottom","short_p","Short violet"],
  onearm:["top","ls_o","Manches longues orange"], planche:["bottom","pants_v","Pantalon vert"], press:["head","beanie_y","Bonnet jaune"], low:["extra","belt_y","Ceinture jaune"]};
// Estimation, à ton rythme : semaines pour atteindre la cible d'une figure (d'après tes progrès enregistrés, sinon une estimation prudente)
function eta(m){
  const x = st(m.id); if (x.done || !m.target || m.type === "check") return null; const T = m.target;
  const logs = S.log.filter(l=>(l.id === m.id || l.id === "pg:" + m.name) && typeof l.v === "number"); let wk = null;
  if (logs.length >= 2) { const days = (Date.now() - logs[0].t) / 864e5, gain = x.best - logs[0].v; if (days >= 3 && gain > 0) wk = (T - x.best) / (gain / (days / 7)); }
  if (wk == null) wk = 1 + 4 * (1 - Math.min(1, x.best / T));
  return Math.max(1, Math.min(26, Math.round(wk)));
}
const etaTxt = w => w == null ? "" : w <= 1 ? "≈ 1 semaine" : "≈ " + w + " semaines";
// ---------- Le parcours : un seul chemin qui serpente, figure après figure ; il se divise en trois voies au niveau difficile.
function journey(nextId){
  const RH = 156, SH = 84, X = [50, 70, 78, 70, 50, 30, 22, 30], pos = {}, items = [], wrap = el("div","jr jr2");
  let y = 10, k = 0, prev = null, edges = "", n = 0;
  const seg = (a, b, cls) => { const my = (a[1] + b[1]) / 2; edges += '<path class="' + cls + '" d="M' + a[0] + ' ' + a[1] + 'C' + a[0] + ' ' + my + ',' + b[0] + ' ' + my + ',' + b[0] + ' ' + b[1] + '"/>'; };
  const eCls = (doneA, idB, lkB) => doneA && (idB ? st(idB).done : false) ? "on" : doneA && !lkB ? "go" : "";
  const sign = (title, sid, sub) => { const ms = sid === "hard" ? HARD.flatMap(h=>SEC[h[0]].ms) : SEC[sid].ms, dn = ms.filter(m=>st(m.id).done).length,
      state = ms.filter(m=>!m.alt).every(m=>st(m.id).done) ? "done" : ms.some(m=>!st(m.id).done && !msLocked(m)) ? "cur" : "lk";
    items.push({k:"b", y, title, sid, sub, dn, tot:ms.length, state, n:++n}); y += SH; };
  const node = (id, x, small) => { pos[id] = [x, y + 40, small]; items.push({k:"n", id}); };
  const chest = (sid, x, lane) => { const done = sid === "hard" ? false : chestOpen(SEC[sid]); pos["chest_" + sid] = [x, y + 34]; items.push({k:"c", sid, x, y, done, lane}); };
  const step = (id, small) => { const x = X[k++ % X.length]; node(id, x, small); if (prev) seg(pos[prev], pos[id], eCls(prev.startsWith("chest_") ? chestDone(prev) : st(prev).done, id, msLocked(MS[id]) && !st(id).done)); prev = id; y += RH; };
  const chestDone = cid => chestOpen(SEC[cid.slice(6)]);
  // le tronc commun : une figure par ligne, dans l'ordre du parcours
  ["base","starter","b1","b2","inter"].forEach(sid=>{ const s = SEC[sid], ids = new Set(s.ms.map(m=>m.id)), dep = {};
    const d = m => dep[m.id] != null ? dep[m.id] : (dep[m.id] = 1 + Math.max(-1, ...(m.req||[]).filter(r=>ids.has(r)).map(r=>d(MS[r]))));
    sign(s.name, sid, TIER_TXT[sid]);
    s.ms.filter(m=>!m.alt).sort((a,b)=>d(a) - d(b)).forEach(m=>step(m.id));
    s.ms.filter(m=>m.alt).forEach(m=>{ const x = X[(k - 1) % X.length] >= 50 ? 22 : 78; pos[m.id] = [x, y - RH + 40, true]; items.push({k:"n", id:m.id, alt:true}); y += 0; });
    const x = X[k++ % X.length]; chest(sid, x); seg(pos[prev], pos["chest_" + sid], st(prev).done ? (chestOpen(s) ? "on" : "go") : ""); prev = "chest_" + sid; y += RH - 10; });
  // le niveau difficile : trois voies
  sign("Niveau difficile", "hard", "Trois voies : choisis la tienne, ou mène-les de front.");
  const laneY = y, LX = [17, 50, 83]; y += 104;
  HARD.forEach(([sid, name], i)=>{ const s = SEC[sid], first = s.ms[0], lo = !msLocked(first) || st(first.id).done;
    items.push({k:"l", y:laneY, x:LX[i], name, open:lo, sid, after:(first.req||[]).filter(r=>!st(r).done).map(r=>MS[r].name).join(" + ")}); });
  const y0 = y; let ymax = y;
  HARD.forEach(([sid], i)=>{ let py = y0, last = "chest_inter"; SEC[sid].ms.forEach(m=>{ pos[m.id] = [LX[i], py + 40, false]; items.push({k:"n", id:m.id, lane:true});
      seg(pos[last], pos[m.id], eCls(last.startsWith("chest_") ? chestDone(last) : st(last).done, m.id, msLocked(m) && !st(m.id).done)); last = m.id; py += RH; });
    items.push({k:"c", sid, x:LX[i], y:py, done:chestOpen(SEC[sid]), lane:true}); pos["chest_" + sid] = [LX[i], py + 34]; seg(pos[last], pos["chest_" + sid], st(last).done ? (chestOpen(SEC[sid]) ? "on" : "go") : ""); ymax = Math.max(ymax, py + RH); });
  y = ymax + 10;
  // hors parcours : les figures au sol
  sign("Figures au sol", "low", "Hors parcours, accessibles dès le départ : pour varier.");
  SEC.low.ms.forEach((m,j)=>{ pos[m.id] = [[20,50,80][j], y + 40, false]; items.push({k:"n", id:m.id}); if (j) seg(pos[SEC.low.ms[j-1].id], pos[m.id], eCls(st(SEC.low.ms[j-1].id).done, m.id, msLocked(m) && !st(m.id).done)); });
  y += RH; chest("low", 50); seg(pos[SEC.low.ms[2].id], pos.chest_low, secDone(SEC.low) ? "on" : ""); y += RH - 20;
  const H = y, cv = el("div","jr-c"); cv.style.height = H + "px";
  cv.innerHTML = '<svg class="jr-e" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + edges + '</svg>';
  items.forEach(it=>{
    if (it.k === "b"){ const b = el("div","sign " + it.state + (it.sid === "hard" ? " hard" : "")); b.style.top = it.y + "px";
      const md = el("span","md"); if (it.state === "done") md.innerHTML = ICON.check; else if (it.state === "lk") md.innerHTML = ICON.lock; else md.textContent = it.sid === "low" ? "+" : String(it.n);
      const g = el("div","grow"); g.append(el("div","sname", it.title), el("div","mut", it.sub));
      b.append(md, g, el("span","cnt", it.dn + "/" + it.tot)); if (SEC[it.sid] && SEC[it.sid].videos.length) { const vc = vidChip(it.sid); vc.firstChild.textContent = "Vidéos"; b.append(vc); } cv.append(b); }
    else if (it.k === "l"){ const l = el("div","jr-l" + (it.open ? " open" : "")); l.style.top = it.y + "px"; l.style.left = it.x + "%"; l.append(el("div","sname",it.name), el("div","mut", it.open ? "Voie ouverte" : "Après : " + it.after)); cv.append(l); }
    else if (it.k === "c"){ const C = CHESTS[it.sid], c = el("button","chest" + (it.done ? " open" : "")); c.style.left = it.x + "%"; c.style.top = it.y + "px";
      c.innerHTML = it.done ? '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M8 22h32v16H8z"/><path d="M8 22l4-12h24l4 12" fill="currentColor" fill-opacity=".25"/><path d="M24 26v6"/></svg>'
        : '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M8 20h32v18H8z"/><path d="M8 20c0-6 4-10 16-10s16 4 16 10"/><path d="M8 26h32"/><rect x="21" y="23" width="6" height="7" rx="1"/></svg>';
      c.setAttribute("aria-label", (it.done ? "Coffre ouvert : " : "Coffre fermé : ") + C[2]);
      c.onclick = () => { if (it.done) { toast("Coffre ouvert : " + C[2] + ". Enfile-le dans le vestiaire (Profil)."); } else toast("Termine l'étage pour ouvrir ce coffre : " + C[2] + "."); };
      c.append(el("span","cl", it.done ? C[2] : "Coffre")); cv.append(c); }
    else { const id = it.id, m = MS[id], x = st(id), lk = !x.done && msLocked(m), p = pos[id], L = lvls(m), kk = lvlOf(m), cur = id === nextId, small = it.alt;
      const b = el("button","jn" + (x.done ? " done" : lk ? " lk" : cur ? " cur" : " open") + (small ? " sm alt" : "")); b.dataset.id = id;
      b.style.left = p[0] + "%"; b.style.top = (p[1] - (small ? 30 : 36)) + "px";
      b.setAttribute("aria-label", m.name + (m.target ? ", " + goalTxt(m) : "") + ", niveau " + kk + " sur " + L.length + (lk ? ", verrouillé" : ""));
      const c = el("span","c"), R = 39, Cc = 2*Math.PI*R, sg = Cc / L.length, gap = L.length > 1 ? 5 : 0;
      let ring = '<svg class="rg" viewBox="0 0 84 84" width="84" height="84" fill="none" aria-hidden="true">';
      L.forEach((_,i)=>{ ring += '<circle cx="42" cy="42" r="' + R + '" class="' + (i < kk ? "f" : "") + '" stroke-dasharray="' + (sg - gap).toFixed(1) + ' ' + (Cc - sg + gap).toFixed(1) + '" stroke-dashoffset="' + (-(i*sg + gap/2)).toFixed(1) + '"/>'; });
      c.innerHTML = ring + '</svg>'; const sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = lk ? 1 : ""; sprPaint(sp, small ? 72 : 90); c.append(sp);
      if (x.done) c.append(icon("check","ck")); else if (lk) c.append(icon("lock","lkb"));
      b.append(c, el("span","n", m.name));
      const nx = nextStep(m);
      b.append(el("span","g", x.done ? "Maîtrisé" : lk ? (m.target ? goalTxt(m) : "Verrouillé") : L.length > 1 ? "Niv. " + kk + "/" + L.length + " · " + unitTxt(m, nx) : small ? "Bonus" : "À réussir"));
      b.onclick = () => quick(id); cv.append(b);
      // toi, sur le chemin : ton personnage se tient à côté de ta figure du moment
      if (cur) { const me = el("div","me" + (it.lane ? " lane" : "")), msp = el("span","sp"); msp.dataset.pose = "stand"; msp.dataset.anim = "me"; msp.dataset.lk = ""; sprPaint(msp, it.lane ? 56 : 76); me.append(msp, el("span","tag","Toi"));
        if (it.lane) { me.style.left = p[0] + "%"; me.style.top = (p[1] - 100) + "px"; } else { me.style.left = (p[0] >= 50 ? p[0] - 30 : p[0] + 30) + "%"; me.style.top = (p[1] - 46) + "px"; }
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
  const w = eta(m); g.append(el("div","mut", x.done ? "Maîtrisé" : lk ? "Après : " + missing(m) : w ? "À ton rythme : " + etaTxt(w) + " pour " + goalTxt(m) : "À réussir"));
  const top = el("div","qktop"); top.append(art, g); box.append(top);
  { // historique : meilleur temps de chaque jour d'entraînement sur cette figure
    const byDay = {}; S.log.filter(l=>(l.id === id || l.id === "pg:" + m.name) && typeof l.v === "number").forEach(l=>{ const d = dayKey(l.t); byDay[d] = Math.max(byDay[d] || 0, l.v); });
    const pts = Object.values(byDay).slice(-20);
    if (pts.length >= 2 && m.target) { const W = 300, H = 70, mx = Math.max(m.target, ...pts), X = i => 6 + i * (W - 12) / (pts.length - 1), Y = v => H - 8 - v / mx * (H - 16);
      const svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + Y(m.target) + '" y2="' + Y(m.target) + '" stroke="var(--acc)" stroke-dasharray="4 4" stroke-width="1.5"/>'
        + '<polyline fill="none" stroke="var(--txt)" stroke-width="2.5" stroke-linejoin="round" points="' + pts.map((v,i)=>X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ") + '"/>' + pts.map((v,i)=>'<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.5" fill="var(--txt)"/>').join("") + '</svg>';
      const h = el("div","hist"); h.append(el("div","lab","Ton historique · " + pts.length + " séances")); const gr = el("div"); gr.innerHTML = svg; h.append(gr, el("div","mut","Pointillés : la cible (" + goalTxt(m) + "). Meilleur : " + fmt(m, Math.max(...pts)) + ".")); box.append(h); }
  }
  const row = el("div","btns"), go = el("button","btn", lk ? "Essayer quand même" : x.done ? "Refaire" : m.type === "hold" ? "S'entraîner" : "Je l'ai réussi"), more = el("button","btn line","Chrono et journal");
  go.onclick = () => { $("qkDlg").close(); openMs(id); if (m.type === "hold") setTimeout(()=>{ const gb = $("go"); if (gb && $("dlg").open) { $("clock").scrollIntoView({block:"center"}); gb.click(); } }, 250); else if (!lk) setTimeout(()=>$("toggle").scrollIntoView({block:"center"}), 250); };
  more.onclick = () => { $("qkDlg").close(); openMs(id); };
  row.append(go, more); top.after(row);
  // toute l'info, directement : ce que c'est, comment faire, les repères, l'erreur à éviter, le plan, et les exercices qui y préparent
  const D = DETAILS[id] || {}, info = el("div","qkinfo"), part = (title, node) => { const s = el("section"); s.append(el("h3",null,title), node); info.append(s); };
  if (m.desc) part("La figure", el("p",null,m.desc));
  if (D.how && D.how.length) { const ol = el("ol"); D.how.forEach(t=>ol.append(el("li",null,t))); part("Comment faire", ol); }
  if (D.cue && D.cue.length) { const ul = el("ul"); D.cue.forEach(t=>ul.append(el("li",null,t))); part("Repères", ul); }
  if (D.err) part("Erreur fréquente", el("p",null,D.err));
  if (!x.done) { const pl = planFor(m); part(pl.head, el("p",null,pl.short)); }
  { const dl = el("div","drl"); drillsFor(m).forEach(k=>{ const d = DRILLS[k], r = el("div","dr"); r.append(el("b",null,d.name), el("span","dd", d.sets[0] + " × " + (d.kind === "hold" ? d.sets[1] + " s" : d.sets[1])), el("p",null,d.how)); dl.append(r); });
    if (dl.childElementCount) part("Pour y arriver · inclus dans ta séance", dl); }
  if (D.ok) part("Validé quand", el("p",null,D.ok));
  if (m.yt && m.yt.length) { const v = el("div"); m.yt.forEach(([vid,t])=>v.append(ytLink(vid, "Vidéo : " + t))); part("Vidéo", v); }
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
  box.append(el("p","intro-t", got + " sur " + S0.badges.length + ". L'anneau se remplit à mesure que tu avances ; touche un badge pour voir ce qu'il demande et ce qu'il débloque."));
  BFAM.forEach(([name, ids, pre])=>{ const list = S0.badges.filter(b=>ids ? ids.includes(b.id) : b.id.startsWith(pre)); if (!list.length) return;
    box.append(el("div","lab bfam",name)); const grid = el("div","badges");
    list.forEach(b=>{ const x = el("button","bdg" + (b.ok ? "" : " off")); x.setAttribute("aria-label", b.name + ", " + (b.ok ? "obtenu" : b.cur + " sur " + b.max));
      const m = el("span","m"); m.innerHTML = ringSvg(b.ok ? 0 : b.cur / b.max, 76, 35, 4, "rg"); m.append(el("span","gl", b.g)); if (b.ok) m.append(icon("check","ck"));
      x.append(m, el("span","bn", b.name), el("span","bc", b.ok ? "Obtenu" : b.t ? mins(b.cur) + " / " + mins(b.max) + " min" : b.cur + " / " + b.max));
      x.onclick = () => { $("bdG").textContent = b.g; $("bdT").textContent = b.name; $("bdD").textContent = b.desc; $("bdBar").style.width = (b.cur / b.max * 100) + "%";
        $("bdC").textContent = b.ok ? "Obtenu" : (b.t ? mins(b.cur) + " / " + mins(b.max) + " min" : b.cur + " / " + b.max);
        const rw = badgeReward(b.id); $("bdR").textContent = "Récompense : 50 points d'expérience" + (rw.length ? " · tenue : " + rw.join(", ") : ""); $("bdDlg").showModal(); };
      grid.append(x); });
    box.append(grid); });
}
