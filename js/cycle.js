// Cycles de 4 semaines : trois semaines de travail, une semaine plus légère qui finit par un test,
// puis un bilan (records, intention, carnet) avant d’ouvrir le cycle suivant. L’intention du cycle tient en une phrase.
"use strict";
const monday = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
// le cycle part du lundi de la première séance si elle est récente, sinon de cette semaine ; sans bilan, il se clôt seul au bout de 5 semaines
function cyc(){
  if (!Array.isArray(S.cycles)) delete S.cycles;   // données abîmées : on repart proprement plutôt que de bloquer l’écran
  if (!S.cyc || typeof S.cyc.start !== "number" || !isFinite(S.cyc.start)) { const t0 = S.log.length ? S.log[0].t : Date.now(); S.cyc = {start:monday(Date.now() - t0 < 21 * 864e5 ? t0 : Date.now()), intent:""}; save(); }   // un historique ancien commence son premier cycle cette semaine : ni cycles fantômes, ni bilan d’emblée
  while (Date.now() - S.cyc.start >= 35 * 864e5) { const C = S.cyc, end = C.start + 28 * 864e5, best = {}; cycFigs(C.start, end).forEach(id => { best[id] = cycBest(id, C.start, end); });
    (S.cycles || (S.cycles = [])).push({start:C.start, end, intent:C.intent, best, refl:""}); S.cyc = {start:monday(Math.max(end, Date.now() - 6 * 864e5)), intent:C.intent}; S._cs = 1; }
  if (S._cs) { delete S._cs; save(); }
  return S.cyc; }
const cycDay = () => Math.floor((Date.now() - cyc().start) / 864e5);
const cycN = () => (S.cycles || []).length + 1;
const cycDays = () => new Set(S.log.filter(l => l.t >= cyc().start).map(l => dayKey(l.t))).size;   // jours d’entraînement dans ce cycle
const cycTest = () => cycDay() >= 25;                                                              // fin de cycle : jour de test, puis bilan
const cycLight = () => { const d = cycDay(); return d >= 21 && d < 25 && cycDays() >= 8; };        // 4e semaine plus légère, avant le test, si le cycle a été travaillé
// les figures suivies : les plus travaillées du cycle (tenues ou répétitions chiffrées)
function cycFigs(since, until){ const n = {}; S.log.filter(l => l.t >= since && l.t < (until || Infinity) && MS[l.id] && typeof l.v === "number").forEach(l => { n[l.id] = (n[l.id] || 0) + 1; });
  return Object.keys(n).sort((a, b) => n[b] - n[a]).slice(0, 4); }
function cycBest(id, a, b){ let m = 0; S.log.forEach(l => { if (l.id === id && typeof l.v === "number" && l.t >= a && l.t < b) m = Math.max(m, l.v); }); return m; }
// Aujourd’hui : une ligne de cycle, et la carte du test ou du bilan au bon moment
function renderCycle(){
  const box = $("cycle"); if (!box) return; box.textContent = ""; const C = cyc(), d = cycDay(), w = Math.min(4, Math.floor(d / 7) + 1);
  const line = el("button","cyline"); line.append(el("span",null,"Cycle " + cycN() + ", semaine " + w + " sur 4" + (cycLight() ? ", semaine légère" : "")), el("span","cyint", C.intent ? "Intention : " + C.intent : "Choisir une intention pour ce cycle"));
  line.onclick = () => cycIntent(); box.append(line);
  if (d >= 28) { const c = el("div","cycard"); c.append(el("b",null,"Ton cycle est terminé"), el("p","mut","Le moment de regarder le chemin : tes records, ton intention, ce que tu as écrit.")); const b = el("button","btn","Faire le bilan"); b.onclick = cycBilan; c.append(b); box.append(c); }
  else if (cycTest()) { const figs = cycFigs(C.start); if (figs.length) { const c = el("div","cycard"); c.append(el("b",null,"Jour de test"), el("p","mut","Après l’échauffement, une tentative au maximum sur chaque figure, bien reposé. C’est ce qui recale tes dates."));
      figs.forEach(id => { const m = MS[id], x = el("button","cytest"), b = cycBest(id, C.start, Date.now()); x.append(el("span",null,m.name), el("span","mut","record du cycle : " + (b ? fmt(m, b) : "aucun"))); x.onclick = () => openMs(id); c.append(x); });
      box.append(c); } }
}
function cycIntent(){
  const box = $("qkBody"), C = cyc(); box.textContent = "";
  const hd = el("div","sqhd"); hd.innerHTML = ICON.flag || ""; hd.append(el("div","lab","Cycle " + cycN()), el("h2",null,"Ton intention")); box.append(hd);
  box.append(el("p","mut","Une phrase pour les quatre semaines, qui te revient au début de chaque séance. Par exemple : moins forcer, plus sentir."));
  const inp = el("input","cyin"); inp.value = C.intent || ""; inp.placeholder = "Ton intention"; inp.setAttribute("aria-label","Intention du cycle"); inp.maxLength = 80; box.append(inp);
  const sug = el("div","cysug"); ["Moins forcer, plus sentir", "La patience avant le chrono", "Écouter mes poignets", "Respirer dans l’effort", "Le plaisir d’abord"].forEach(t => { const b = el("button","chip",t); b.onclick = () => { inp.value = t; }; sug.append(b); }); box.append(sug);
  const ok = el("button","btn","Garder cette intention"); ok.onclick = () => { C.intent = inp.value.trim(); save(); $("qkDlg").close(); renderCycle(); }; box.append(ok);
  $("qkT").textContent = "Intention du cycle"; const qd = $("qkDlg"); qd.classList.add("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.onscroll = null;
}
function cycBilan(){
  const box = $("qkBody"), C = cyc(), end = Date.now(), prev = (S.cycles || []).slice(-1)[0]; box.textContent = "";
  const hd = el("div","sqhd"); hd.innerHTML = ICON.flag || ""; hd.append(el("div","lab","Cycle " + cycN()), el("h2",null,"Le bilan")); box.append(hd);
  const figs = cycFigs(C.start), best = {}; figs.forEach(id => { best[id] = cycBest(id, C.start, end); });
  { const s = el("div","qkinfo"), sc = el("section"); sc.append(el("h3",null,"Tes records du cycle"));
    if (!figs.length) sc.append(el("p","mut","Rien de chiffré ce cycle-ci."));
    figs.forEach(id => { const m = MS[id], p = prev && prev.best && prev.best[id], r = el("div","cyrec"); r.append(el("span",null,m.name), el("b",null,fmt(m, best[id]) + (p ? (best[id] > p ? ", + " + fmt(m, Math.round((best[id] - p) * 10) / 10) : best[id] === p ? ", stable" : ", un peu moins") : ""))); sc.append(r); });
    s.append(sc); box.append(s); }
  if (C.intent) box.append(el("p","vq","Ton intention : « " + C.intent + " »"));
  const notes = (S.jr || []).filter(e => e.t >= C.start); if (notes.length) { const s = el("div","qkinfo"), sc = el("section"); sc.append(el("h3",null,"Ce que tu as écrit")); notes.slice(-4).forEach(e => { const r = el("div","vjr"); r.append(el("div","mut", new Date(e.t).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}) + ", " + lc1(e.q)), el("p",null,e.a)); sc.append(r); }); s.append(sc); box.append(s); }
  box.append(el("p","vq","Qu’est-ce qui a changé ?")); const ta = el("textarea","vta"); ta.rows = 3; ta.setAttribute("aria-label","Qu’est-ce qui a changé ?"); box.append(ta);
  box.append(el("p","vq","Ton intention pour le cycle suivant")); const ni = el("input","cyin"); ni.placeholder = "Une phrase"; ni.value = C.intent || ""; ni.maxLength = 80; ni.setAttribute("aria-label","Intention du cycle suivant"); box.append(ni);
  const ok = el("button","btn cyok","Ouvrir le cycle suivant"); ok.onclick = () => {
    const refl = ta.value.trim(), n = cycN(); (S.cycles || (S.cycles = [])).push({start:C.start, end, intent:C.intent, best, refl});
    if (refl) (S.jr || (S.jr = [])).push({t:end, q:"Bilan du cycle " + n + " : qu’est-ce qui a changé ?", a:refl});
    S.cyc = {start:monday(Date.now()), intent:ni.value.trim()}; save(); $("qkDlg").close(); render(); toast("Cycle " + cycN() + " ouvert. Bonne route."); };
  box.append(ok);
  $("qkT").textContent = "Bilan du cycle"; const qd = $("qkDlg"); qd.classList.remove("sqd"); if (!qd.open) qd.showModal(); qd.scrollTop = 0; qd.onscroll = null;
}
// Profil : la courbe de chaque record, cycle après cycle
function renderRecords(){
  const box = $("records"); if (!box) return; box.textContent = ""; const L = S.cycles || [], C = cyc();
  const ids = [...new Set(L.flatMap(c => Object.keys(c.best || {})).concat(cycFigs(C.start)))].filter(id => MS[id]).slice(0, 6);
  box.append(el("h2",null,"Mes records"), el("p","mut","Le meilleur de chaque cycle de 4 semaines."));
  if (!ids.length) { box.append(el("p","mut","Ils apparaîtront après tes premiers essais chiffrés.")); return; }
  ids.forEach(id => { const m = MS[id], pts = L.map(c => (c.best || {})[id] || 0).concat([cycBest(id, C.start, Date.now())]).filter(v => v > 0); if (!pts.length) return;
    const r = el("div","recrow"), mx = Math.max(1, ...pts), W = 120, H = 32, X = k => pts.length > 1 ? 4 + k * (W - 8) / (pts.length - 1) : W / 2, Y = v => H - 4 - v / mx * (H - 8);
    const g = el("span","recsvg"); g.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' + (pts.length > 1 ? '<polyline fill="none" stroke="var(--gold)" stroke-width="2" stroke-linejoin="round" points="' + pts.map((v, k) => X(k).toFixed(1) + "," + Y(v).toFixed(1)).join(" ") + '"/>' : "") + pts.map((v, k) => '<circle cx="' + X(k).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="2.6" fill="var(--gold)"/>').join("") + '</svg>';
    const last = pts[pts.length - 1]; r.append(el("span","recn", m.name), g, el("b",null, last ? fmt(m, last) : "à venir")); r.setAttribute("aria-label", m.name + " : " + pts.map(v => fmt(m, v)).join(", ")); box.append(r); });
}
