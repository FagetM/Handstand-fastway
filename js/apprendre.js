// Apprendre : les formations, façon Duolingo. Des voies par catégorie ; dans chaque voie, un chemin de leçons
// qui s’ouvrent l’une après l’autre ; une leçon = des cartes courtes, un petit quiz, une pratique guidée.
// Les questions ratées reviennent plus tard (révision espacée : 1, 3, 7, 21 jours).
// État : S.learn = {done:{idLeçon:horodatage}, xp, days:[clés de jour], open:idVoie, rev:{clé:{q, o, a, w, due, box}}}
"use strict";
const LN_IC = {
  tree:'<path d="M12 21v-6"/><path d="M12 15c-4 0-7-2.5-7-6 0-3 3-6 7-6s7 3 7 6c0 3.5-3 6-7 6Z"/>',
  body:'<circle cx="12" cy="5" r="2"/><path d="M12 7v7M6 10l6 1 6-1M9 21l3-7 3 7"/>',
  wind:'<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/>',
  drop:'<path d="M12 3c3.5 4.5 6 7.7 6 11a6 6 0 0 1-12 0c0-3.3 2.5-6.5 6-11Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7s-5-2-6.5-5L3 13a1.5 1.5 0 0 1 2.5-1.5L8 14"/>',
  book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1Z"/><path d="M12 6v14"/>',
  hs:'<circle cx="12" cy="19" r="2"/><path d="M12 17V8M8 21l4-4 4 4M12 8l-3-5M12 8l3-5"/>',
  lock:'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  loop:'<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
  ear:'<path d="M11 5l-5 4H3v6h3l5 4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12"/>'};
const lnIcon = (k, s) => '<svg viewBox="0 0 24 24" width="' + (s || 26) + '" height="' + (s || 26) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (LN_IC[k] || LN_IC.book) + '</svg>';
const LS = () => { const L = S.learn || (S.learn = {done:{}, xp:0, days:[]}); L.rev = L.rev || {}; return L; };
const lessonsOf = v => v.units.flatMap(u => u.lessons);
const voieById = id => LEARN.flatMap(c => c.voies).find(v => v.id === id);
// durée d’une leçon : 15 s par carte ou question, plus la pratique
const pracOf = s => typeof s[1] === "string" ? PRATIQUES.find(x => x.id === s[1]) : s[1];
const lnMin = l => Math.max(1, Math.round(l.steps.reduce((a, s) => a + (s[0] === "p" ? (((p => p && (p.steps || (p.alt && p.alt[0][1])))(pracOf(s))) || []).reduce((b, x) => b + x[1], 0) : 15), 0) / 60));
// série : jours d’affilée avec au moins une leçon (aujourd’hui ou hier compte encore)
function lnStreak(){ const D = new Set(LS().days); let n = 0, k = D.has(ago(0)) ? 0 : 1; while (D.has(ago(k))) { n++; k++; } return n; }
const revDue = () => Object.entries(LS().rev).filter(([, r]) => r.due <= Date.now());
const REV_GAP = [1, 3, 7, 21];   // jours avant de revoir une question, boîte après boîte

// à revoir : les questions ratées dont le jour est venu (en tête de la vue d’ensemble et de chaque voie)
function revCard(box){ const due = revDue(); if (!due.length) return; const b = el("button","lnrev"), ic = el("span","lnic"); ic.innerHTML = lnIcon("loop");
  const t = el("span","grow"); t.append(el("b",null,"Révision"), el("span","mut", Math.min(5, due.length) + " question" + (due.length > 1 ? "s" : "") + " à revoir · 1 min")); b.append(ic, t);
  b.onclick = () => revOpen(); box.append(b); }
function renderLearn(){
  const box = $("learn"); if (!box) return; box.textContent = ""; const L = LS();
  if (L.open && voieById(L.open)) { $("v-learn").classList.remove("cstmode"); return renderVoiePath(box, voieById(L.open)); }
  const flip = () => { const L = LS(); L.list = !L.list; save(); renderLearn(); window.scrollTo(0, 0); };
  $("v-learn").classList.toggle("cstmode", !L.list);
  // vue d’ensemble en constellation (par défaut), sur tout l’écran : le titre, la série et la révision flottent sur le ciel
  if (!L.list) { const w = skyFull(constellation(), "Apprendre", lnStreak() + " j de série", "Vue liste", flip), rb = el("div","cstrev");
    revCard(rb); if (rb.firstChild) w.append(rb); box.append(w); return; }
  const hd = el("div","lnstats"); hd.append(el("div","lnst", lnStreak() + " j"), el("span","mut","de série"), el("div","lnst", String(L.xp || 0)), el("span","mut","points de savoir"));
  box.append(hd);
  revCard(box);
  { const tg = el("button","lnview","Vue constellation"); tg.onclick = flip; box.append(tg); }
  LEARN.forEach(c => { box.append(el("h2","lncat", c.cat)); const g = el("div","lngrid");
    c.voies.forEach(v => { const ls = lessonsOf(v), dn = ls.filter(l => L.done[l.id]).length, b = el("button","lnv" + (dn === ls.length ? " done" : ""));
      const ic = el("span","lnic"); ic.innerHTML = lnIcon(v.ic); const bar = el("span","bar"), i = el("i"); i.style.width = Math.round(dn / ls.length * 100) + "%"; bar.append(i);
      b.append(ic, el("b",null,v.name), el("span","mut", v.sub), bar, el("span","lncnt", dn + " / " + ls.length));
      b.setAttribute("aria-label", v.name + ", " + dn + " leçons sur " + ls.length);
      b.onclick = () => { L.open = v.id; save(); renderLearn(); window.scrollTo(0, 0); }; g.append(b); });
    box.append(g); });
}
// ---------- La constellation : toutes les voies d’un coup d’œil ----------
// Les catégories occupent des secteurs ; chaque voie est une branche qui part du cercle central ; chaque leçon, une étoile
// (allumée quand elle est faite, qui pulse quand c’est la prochaine). On se déplace au doigt, on zoome à deux doigts.
const CST_COL = {"Le yoga":"#e2b04a", "Énergie":"#a98be6", "Formations":"#5cc2b3"};
// liens entre voies : la même idée vue de deux côtés (une étoile faite des deux côtés allume le lien)
const CST_LINK = [["m4","a1"],["m4","r1"],["m5","d2"],["m6","d1"],["m2","p5"],["a2","c3"],["a5","p2"],["r4","p4"],["k1","e3"],["p3","c2"]];
function constellation(){
  const L = LS(), W = 1440, C = W / 2, branches = LEARN.flatMap(c => c.voies.map(v => ({c, v}))), n = branches.length, slice = 2 * Math.PI / n;
  const nodes = [], byId = {}, sectors = {}, paths = [], dots = [], labels = [];
  branches.forEach(({c, v}, b) => { const ang = -Math.PI / 2 + b * slice, col = CST_COL[c.cat] || "#ddd", ls = lessonsOf(v), next = ls.find(l => !L.done[l.id]);
    (sectors[c.cat] || (sectors[c.cat] = [])).push(ang);
    // la branche s’enroule doucement, comme un bras de galaxie
    const pts = [[C + Math.cos(ang) * 92, C + Math.sin(ang) * 92]], mine = [];
    ls.forEach((l, k) => { const a = ang + (k + 1) * 0.045, r = 250 + k * 74, wob = (k % 2 ? 1 : -1) * 16, x = C + Math.cos(a) * r - Math.sin(a) * wob, y = C + Math.sin(a) * r + Math.cos(a) * wob;
      const done = !!L.done[l.id], cur = !!(next && next.id === l.id), lock = !done && !cur, maj = k === 0 || k === ls.length - 1;
      const o = {x, y, col, l, done, cls:(done ? "done" : cur ? "cur" : "lk") + (maj ? " maj" : ""), name:l.name, side:[-Math.sin(a) * Math.sign(wob), Math.cos(a) * Math.sign(wob)],
        // les grandes étoiles (première et dernière de la voie) portent l’emblème de la voie
        html:maj ? lnIcon(v.ic, 26) : done ? lnIcon("check", 18) : lock ? lnIcon("lock", 16) : "<span>" + (k + 1) + "</span>",
        aria:v.name + ", " + l.name + (done ? ", faite" : lock ? ", verrouillée" : ", à faire"),
        tap:() => { if (lock) { toast("Termine d’abord : " + lessonsOf(v).find(z => !L.done[z.id]).name); return; } lnOpen(v, l); }};
      pts.push([x, y]); nodes.push(o); mine.push(o); byId[l.id] = o; });
    // chaque segment est une courbe douce (Catmull-Rom), allumé quand l’étoile d’arrivée est faite ou à faire
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], o = mine[i];
      paths.push({col, lit:(i === 0 || mine[i - 1].done) && (o.done || /cur/.test(o.cls)),
        d:"M" + f0(p1[0]) + " " + f0(p1[1]) + "C" + f0(p1[0] + (p2[0] - p0[0]) / 6) + " " + f0(p1[1] + (p2[1] - p0[1]) / 6) + " " + f0(p2[0] - (p3[0] - p1[0]) / 6) + " " + f0(p2[1] - (p3[1] - p1[1]) / 6) + " " + f0(p2[0]) + " " + f0(p2[1])}); }
    dots.push({x:pts[0][0], y:pts[0][1], r:5, col});
    // le nom de la voie, au départ de sa branche
    labels.push({x:C + Math.cos(ang) * 162, y:C + Math.sin(ang) * 162, col, text:v.name, tap:() => { L.open = v.id; save(); renderLearn(); window.scrollTo(0, 0); }}); });
  // les liens entre voies : un fil pâle qui se courbe vers le centre
  const links = CST_LINK.map(([a, b]) => { const A = byId[a], B = byId[b]; if (!A || !B) return null; const cx = C + ((A.x + B.x) / 2 - C) * 0.72, cy = C + ((A.y + B.y) / 2 - C) * 0.72;
    return {d:"M" + f0(A.x) + " " + f0(A.y) + "Q" + f0(cx) + " " + f0(cy) + " " + f0(B.x) + " " + f0(B.y), col:A.col, lit:A.done && B.done}; }).filter(Boolean);
  // les secteurs : une nébuleuse de la couleur de la catégorie, un arc, des séparations, et le nom courbé le long du bord
  const secs = Object.entries(sectors).map(([cat, as]) => { const a0 = as[0] - slice / 2 + 0.03, a1 = as[as.length - 1] + slice / 2 - 0.03, am = (a0 + a1) / 2;
    return {name:cat, col:CST_COL[cat], a0, a1, arcR:640, nameR:662, neb:[C + Math.cos(am) * 430, C + Math.sin(am) * 430, 200 + as.length * 45]}; });
  const all = nodes, dn = all.filter(o => o.done).length;
  return skyMap({key:"ln", W, sectors:secs, seps:secs.map(s => ({a:s.a0 - 0.03, r0:120, r1:690})), rings:[{r:92, col:"#e8a0b0", op:.45, w:2, dash:"3 7"}, {r:640, op:.12, w:1}],
    paths, links, dots, nodes, labels, center:{big:String(L.xp || 0), small:"points de savoir"}, legendFirst:() => !L.help && !revDue().length,
    legend:skyLegend("Lire le ciel", "Du centre vers le bord : chaque branche est une voie, ses leçons s’enchaînent.", [["maj","Première et dernière leçon d’une voie"],["ok","Leçon faite"],["cur","Ta prochaine leçon"],["far","Pas encore : termine la précédente"],["th","Fil lumineux : ton chemin"]],
      "Touche une étoile pour ouvrir sa leçon, ou le nom d’une voie pour voir tout son chemin.", () => { L.help = 1; save(); }),
    panel:{head:dn + "/" + all.length, sub:"leçons faites", rows:Object.keys(CST_COL).map(cat => { const vs = LEARN.find(c => c.cat === cat).voies, xs = all.filter(o => vs.some(v => lessonsOf(v).includes(o.l))), d = xs.filter(o => o.done).length;
      return {name:cat.replace(/^Le y/,"Y"), col:CST_COL[cat], p:xs.length ? d / xs.length : 0, title:cat + " : " + d + "/" + xs.length}; })},
    view:{get:() => L.view, set:v => { L.view = v; }}, k0:0.62,
    // à l’ouverture : entre le cœur et la prochaine étoile
    focus:(c => [(c.x + C) / 2, (c.y + C) / 2])(nodes.find(o => /cur/.test(o.cls)) || {x:C, y:C})});
}
// le chemin d’une voie : une leçon par rond, la suivante s’ouvre quand la précédente est faite
function renderVoiePath(box, v){ const L = LS(), ls = lessonsOf(v), next = ls.find(l => !L.done[l.id]);
  const back = el("button","lnback","‹ Toutes les voies"); back.onclick = () => { L.open = null; save(); renderLearn(); window.scrollTo(0, 0); };
  const hd = el("div","lnvh"), ic = el("span","lnic"); ic.innerHTML = lnIcon(v.ic); const t = el("div"); t.append(el("h2",null,v.name), el("span","mut", v.sub)); hd.append(ic, t);
  box.append(back); revCard(box); box.append(hd); let k = 0;
  v.units.forEach(u => { box.append(el("div","lnunit", u.name)); const p = el("div","lnpath");
    u.lessons.forEach(l => { const done = !!L.done[l.id], cur = next && next.id === l.id, lock = !done && !cur, b = el("button","lnn" + (done ? " done" : cur ? " cur" : " lk"));
      b.style.marginLeft = [0, 22, 34, 22, 0, -22, -34, -22][k++ % 8] + "%";
      const r = el("span","lnr"); r.innerHTML = lnIcon(done ? "check" : lock ? "lock" : v.ic, 28); b.append(r, el("span","lnl", l.name), el("span","lnmin", lnMin(l) + " min"));
      b.setAttribute("aria-label", l.name + ", " + lnMin(l) + (lnMin(l) > 1 ? " minutes" : " minute") + (done ? ", faite" : lock ? ", verrouillée" : ", à faire"));
      b.onclick = () => { if (lock) { toast("Termine d’abord : " + next.name); return; } lnOpen(v, l); }; p.append(b); });
    box.append(p); });
  if (!next) box.append(el("p","lnfin","Voie terminée. Tu peux refaire chaque leçon quand tu veux."));
}

// ---------- Une leçon ----------
let ln = null;
const shuffleQ = s => { const o = s[2].map((t, i) => [t, i]).sort(() => Math.random() - 0.5); return ["q", s[1], o.map(x => x[0]), o.findIndex(x => x[1] === s[3]), s[4]]; };
function lnOpen(v, l){ ln = {v, l, steps:l.steps.map(s => s[0] === "q" ? shuffleQ(s) : s), i:0, miss:0, wrong:new Set(), ended:false};
  const d = $("lnDlg"); $("lnT").textContent = l.name; lnStep(); if (!d.open) d.showModal(); }
// révision : jusqu’à 5 questions ratées dont le jour est venu
function revOpen(){ const due = revDue().sort((a, b) => a[1].due - b[1].due).slice(0, 5);
  ln = {rev:true, steps:due.map(([k, r]) => Object.assign(shuffleQ(["q", r.q, r.o, r.a, r.w]), {key:k})), i:0, miss:0, wrong:new Set(), ended:false};
  const d = $("lnDlg"); $("lnT").textContent = "Révision"; lnStep(); if (!d.open) d.showModal(); }
// une question ratée part en révision demain ; réussie en révision, elle revient de plus en plus tard, puis sort
function revNote(s, ok){ const R = LS().rev, k = s.key || s[1];
  if (!ok) { R[k] = {q:s[1], o:s[2], a:s[3], w:s[4], box:0, due:Date.now() + 864e5}; return; }
  if (!ln.rev || !R[k] || ln.wrong.has(s[1])) return; const b = R[k].box + 1; if (b >= REV_GAP.length) delete R[k]; else Object.assign(R[k], {box:b, due:Date.now() + REV_GAP[b] * 864e5}); }
function lnStep(){ if (typeof hush === "function") hush(); const box = $("lnBody"), go = $("lnGo"); box.textContent = ""; $("lnLive").textContent = ""; go.disabled = false; $("lnMore").hidden = true;
  $("lnBar").style.transform = "scaleX(" + (ln.i / ln.steps.length).toFixed(3) + ")";
  const s = ln.steps[ln.i]; if (!s) return lnEnd();
  if (s[0] === "c") { const h = el("h3",null,s[1]), lb = el("button","lnear"); lb.innerHTML = lnIcon("ear", 22); lb.setAttribute("aria-label","Écouter"); lb.onclick = () => say(s[1] + ". " + s[2]); h.append(lb);
    if (!ln.rev && ln.steps.findIndex(x => x[0] === "c") === ln.i) { const f = el("figure","lnph"), im = el("img"); im.alt = ""; im.onerror = () => f.remove(); im.src = photoUrl("ln-" + ln.l.id); f.append(im); box.append(f); }   // photo de la leçon, si elle existe
    box.append(h, el("p","lncard", s[2])); go.textContent = "Continuer"; go.onclick = () => { ln.i++; lnStep(); }; }
  else if (s[0] === "q") { box.append(el("h3",null,s[1])); const opts = el("div","lnq"); go.textContent = "Vérifier"; go.disabled = true; let pick = null, checked = false;
    s[2].forEach((t, k) => { const b = el("button","lnopt", t); b.onclick = () => { if (checked) return; pick = k; opts.querySelectorAll(".lnopt").forEach((x, j) => x.classList.toggle("on", j === k)); go.disabled = false; }; opts.append(b); });
    box.append(opts);
    go.onclick = () => { if (!checked) { if (pick == null) return; checked = true; const ok = pick === s[3];
        opts.querySelectorAll(".lnopt").forEach((x, j) => { x.classList.toggle("ok", j === s[3]); x.classList.toggle("ko", j === pick && !ok); x.classList.remove("on"); });
        const w = el("p","lnwhy" + (ok ? " ok" : " ko"), (ok ? "Juste. " : "Pas tout à fait. ") + s[4]); box.append(w); $("lnLive").textContent = w.textContent;
        revNote(s, ok);
        if (!ok) { ln.miss++; if (!ln.wrong.has(s[1])) { ln.wrong.add(s[1]); ln.steps.push(Object.assign(shuffleQ(s), {key:s.key})); } }   // elle revient à la fin, mélangée
        go.textContent = "Continuer"; return; }
      ln.i++; lnStep(); }; }
  else if (s[0] === "p") { const p = pracOf(s);
    if (!p) { ln.i++; return lnStep(); }
    box.append(el("div","lab","Pratique"), el("h3",null,p.name), el("p","mut", p.dur));
    const pb = el("button","btn line","Commencer la pratique"); pb.onclick = () => { $("lnDlg").close(); vpOpen(p); vp.fromLesson = true; $("vpDlg").addEventListener("close", () => { $("lnDlg").showModal(); ln.i++; lnStep(); }, {once:true}); }; box.append(pb);
    go.textContent = "Passer"; go.onclick = () => { ln.i++; lnStep(); }; }
}
function lnEnd(){ const L = LS(); ln.ended = true; const first = !ln.rev && !L.done[ln.l.id], pts = ln.rev ? 5 : first ? 10 + (ln.miss ? 0 : 5) : 2;   // revoir une leçon rapporte peu : on ne gagne qu’en avançant
  if (!ln.rev) L.done[ln.l.id] = L.done[ln.l.id] || Date.now(); L.xp = (L.xp || 0) + pts; const d = dayKey(Date.now()); if (!L.days.includes(d)) { L.days.push(d); if (L.days.length > 400) L.days = L.days.slice(-400); } save();
  const box = $("lnBody"), go = $("lnGo"); box.textContent = ""; $("lnBar").style.transform = "scaleX(1)";
  box.append(el("div","lnend", "+" + pts), el("h3",null, ln.rev ? "Révision faite" : ln.miss ? "Leçon terminée" : "Sans faute"), el("p","mut", lnStreak() + " j de série" + (first || ln.rev ? "" : " · leçon revue")));
  const nx = !ln.rev && lessonsOf(ln.v).find(l => !L.done[l.id]), more = $("lnMore");
  if (nx) { go.textContent = "Leçon suivante"; go.onclick = () => lnOpen(ln.v, nx); more.hidden = false; more.onclick = () => { $("lnDlg").close(); renderLearn(); }; }
  else { go.textContent = "Continuer"; go.onclick = () => { $("lnDlg").close(); renderLearn(); }; }
}
// quitter en cours de leçon : on demande, pour ne pas perdre la progression par erreur
$("lnX").onclick = () => { if (ln && !ln.ended && ln.i > 0 && !confirm("Quitter la leçon ?")) return; $("lnDlg").close(); };
$("lnDlg").addEventListener("close", () => { if (typeof hush === "function") hush(); if (!$("vpDlg").open) renderLearn(); });   // Échap ou croix : le chemin reflète ce qui vient d’être fait
$("lnDlg").addEventListener("cancel", e => { if (ln && !ln.ended && ln.i > 0 && !confirm("Quitter la leçon ?")) e.preventDefault(); });
