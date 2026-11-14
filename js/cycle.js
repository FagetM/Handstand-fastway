// Cycles de 4 semaines : trois semaines de travail, une semaine plus légère qui finit par un test,
// puis un bilan (records, intention, carnet) avant d’ouvrir le cycle suivant. L’intention du cycle tient en une phrase.
"use strict";
const monday = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
// le cycle part du lundi de la première séance si elle est récente, sinon de cette semaine ; sans bilan, il se clôt seul au bout de 5 semaines
function cyc(){
  if (!Array.isArray(S.cycles)) delete S.cycles;   // données abîmées : on repart proprement plutôt que de bloquer l’écran
  if (!S.cyc || typeof S.cyc.start !== "number" || !isFinite(S.cyc.start)) { const t0 = S.log.reduce((a, l) => typeof l.t === "number" && isFinite(l.t) ? Math.min(a, l.t) : a, Date.now()); S.cyc = {start:monday(Date.now() - t0 < 21 * 864e5 ? t0 : Date.now()), intent:""}; save(); }   // un historique ancien commence son premier cycle cette semaine : ni cycles fantômes, ni bilan d’emblée
  while (Date.now() - S.cyc.start >= 35 * 864e5) { const C = S.cyc, end = C.start + 28 * 864e5, best = {}; cycFigs(C.start, end).forEach(id => { best[id] = cycBest(id, C.start, end); });
    const worked = S.log.some(l => l.t >= C.start && l.t < end);
    if (worked) (S.cycles || (S.cycles = [])).push({start:C.start, end, intent:C.intent, best, refl:"", vids:C.vids});   // un cycle sans séance ne compte pas
    S.cyc = {start:worked && Date.now() - end < 21 * 864e5 ? end : monday(Date.now()), intent:C.intent};   /* après une longue absence : un cycle neuf cette semaine */ S._cs = 1; }   // le suivant commence là où l’autre finit
  if (S._cs) { delete S._cs; save(); }
  return S.cyc; }
// un thème par cycle : en un an, le tour des principes du yoga (yamas, niyamas) et de quelques sagesses voisines
// p : débuts de pensées (voie.js) qui lui répondent ; q : la question de la semaine ; b : la question du bilan
const THEMES = [
  {n:"ahiṃsā", s:"ne pas nuire", p:["Ne pas nuire", "La souffrance à venir"], q:"Où as-tu été doux avec ton corps cette semaine ?", b:"Qu’as-tu compris d’ahiṃsā, ne pas nuire, ce mois-ci ?"},
  {n:"satya", s:"être vrai", p:["Être vrai", "Le corps ne ment pas"], q:"Qu’as-tu osé reconnaître de ton niveau réel ?", b:"Qu’as-tu compris de satya, être vrai, ce mois-ci ?"},
  {n:"santoṣa", s:"le contentement", p:["Du contentement", "L’égalité d’âme"], q:"Quelle séance t’a contenté, même imparfaite ?", b:"Qu’as-tu compris de santoṣa, le contentement, ce mois-ci ?"},
  {n:"tapas", s:"l’effort ardent", p:["Effort ardent", "Le karaté est comme l’eau"], q:"Où ton effort a-t-il été juste, ni trop ni trop peu ?", b:"Qu’as-tu compris de tapas, l’effort ardent, ce mois-ci ?"},
  {n:"svādhyāya", s:"l’étude de soi", p:["Prêter attention", "Si tu sais ce que tu fais"], q:"Qu’as-tu appris de ta façon de chuter ?", b:"Qu’as-tu appris sur toi ce mois-ci ?"},
  {n:"abhyāsa et vairāgya", s:"la pratique et le détachement", p:["Par la pratique", "La pratique s’ancre"], q:"Quel verdict as-tu su laisser tomber ?", b:"Qu’est-ce que la pratique, sans s’accrocher au résultat, t’a apporté ce mois-ci ?"},
  {n:"ce qui dépend de moi", s:"Épictète", p:["Certaines choses dépendent", "Ce qui fait obstacle"], q:"Qu’est-ce qui ne dépendait pas de toi cette semaine ?", b:"Qu’as-tu lâché ce mois-ci, parce que ça ne dépendait pas de toi ?"},
  {n:"l’esprit du débutant", s:"Shunryu Suzuki", p:["Dans l’esprit du débutant", "Mon pouvoir merveilleux"], q:"Qu’as-tu réappris comme la première fois ?", b:"Qu’as-tu redécouvert ce mois-ci ?"},
  {n:"sthira sukha", s:"stable et agréable", p:["La posture est stable", "Elle naît du relâchement"], q:"Où as-tu trouvé de l’aisance dans l’effort ?", b:"Où l’effort est-il devenu plus léger ce mois-ci ?"},
  {n:"le geste juste", s:"la Bhagavad Gītā", p:["Tu as droit à l’action", "Le yoga est l’habileté"], q:"Quel geste as-tu soigné sans regarder le chrono ?", b:"Qu’as-tu soigné ce mois-ci, sans attendre le résultat ?"},
  {n:"le repos", s:"récupérer aussi", p:["Pas de yoga pour qui mange", "Le jour sans entraînement"], q:"Comment as-tu récupéré cette semaine ?", b:"Comment ton repos a-t-il nourri ta pratique ce mois-ci ?"},
  {n:"la gratitude", s:"le salut au tapis", p:["Le karaté commence et finit", "J’inspire, je calme"], q:"À qui dois-tu ce que tu sais faire ?", b:"Envers qui, ou quoi, as-tu ressenti de la gratitude ce mois-ci ?"},
];
// le test attend un jour plus frais : poignet au repos, fatigue, gêne récente ou jour de récupération (même règle que la séance)
function cycTestHeld(){ const PS = painState(); return (PS.phase === 1 && (PS.zones || [PS.zone]).includes("poignet")) || moodToday() === "fatigue" || !!(S.caution && Date.now() - S.caution < 36 * 3600e3) || needRest(); }
const cycTheme = () => THEMES[(cycN() - 1) % THEMES.length];
const cycDay = () => Math.floor((Date.now() - cyc().start) / 864e5);
const cycN = () => (S.cycles || []).length + 1;
const cycDays = () => { const s0 = cyc().start; return new Set(S.log.filter(l => l.t >= s0).map(l => dayKey(l.t))).size; };   // jours d’entraînement dans ce cycle
const cycTest = () => cycDay() >= 25;                                                              // fin de cycle : jour de test, puis bilan
const cycLight = () => { const d = cycDay(); return d >= 21 && d < 25 && cycDays() >= 8; };        // 4e semaine plus légère, avant le test, si le cycle a été travaillé
// les figures suivies : les plus travaillées du cycle (tenues ou répétitions chiffrées)
function cycFigs(since, until){ const n = {}; S.log.filter(l => l.t >= since && l.t < (until || Infinity) && MS[l.id] && typeof l.v === "number").forEach(l => { n[l.id] = (n[l.id] || 0) + 1; });
  return Object.keys(n).sort((a, b) => n[b] - n[a]).slice(0, 4); }
function cycBest(id, a, b){ let m = 0; S.log.forEach(l => { if (l.id === id && typeof l.v === "number" && l.t >= a && l.t < b) m = Math.max(m, l.v); }); return m; }
// Aujourd’hui : une ligne de cycle, et la carte du test ou du bilan au bon moment
function renderCycle(){
  const box = $("cycle"); if (!box) return; box.textContent = ""; const C = cyc(), d = cycDay(), w = Math.min(4, Math.floor(d / 7) + 1);
  const line = el("button","cyline"); const T = cycTheme(); line.append(el("span",null,"Cycle " + cycN() + ", semaine " + w + " sur 4" + (cycLight() ? ", semaine légère" : "")), el("span","cyth","Thème : " + T.n + (T.s ? ", " + T.s : "")), el("span","cyint", C.intent ? "Intention : " + C.intent : "Choisir une intention pour ce cycle"));
  line.onclick = () => cycIntent(); box.append(line);
  if (d >= 28) { const c = el("div","cycard"); c.append(el("b",null,"Ton cycle est terminé"), el("p","mut","Le moment de regarder le chemin : tes records, ton intention, ce que tu as écrit.")); const b = el("button","btn","Faire le bilan"); b.onclick = cycBilan; c.append(b); box.append(c); }
  else if (cycTest() && C.tested) { const c = el("div","cycard"); c.append(el("b",null,"Test fait"), el("p","mut","Mobilité jusqu’à la fin du cycle, puis le bilan. Tu peux encore ajouter la vidéo d’une tentative."));
    cycFigs(C.start).forEach(id => { const fm = el("button","chip cyfilm", ((C.vids || {})[id] ? "Vidéo gardée : " : "Ajouter une vidéo : ") + MS[id].name); fm.onclick = () => vPick(id, renderCycle); c.append(fm); }); romTest(c); box.append(c); }
  else if (cycTest()) { const figs = cycFigs(C.start); if (figs.length) { const c = el("div","cycard"); const held = cycTestHeld();
      c.append(el("b",null, held ? "Test reporté" : "Jour de test"), el("p","mut", held ? "Pas aujourd’hui : ton corps demande du calme. Le test attendra un jour plus frais, avant la fin du cycle." : "Ta séance du jour est le test : échauffement, deux montées en charge, puis une tentative au maximum par figure. C’est ce qui recale tes dates."));
      figs.forEach(id => { const m = MS[id], x = el("button","cytest"), b = cycBest(id, C.start, Date.now()); x.append(el("span",null,m.name), el("span","mut","record du cycle : " + (b ? fmt(m, b) : "aucun"))); x.onclick = () => openMs(id);
        const ft = (C.vids || {})[id] ? "Vidéo gardée, refaire" : "Filmer la tentative", fm = el("button","chip cyfilm", ft); fm.setAttribute("aria-label", ft + " : " + m.name); fm.onclick = () => vPick(id, renderCycle); c.append(x, fm); });
      if (!held) romTest(c); box.append(c); } }
}
// la mesure de souplesse du cycle : un repère différent à chaque cycle, après l’échauffement du test
function romTest(c){ const r = romOfCycle(), done = romLog(r.id).some(e => e.t >= cyc().start), x = el("button","cytest");
  x.append(el("span",null,"Souplesse : " + r.name), el("span","mut", done ? "mesurée ce cycle, " + r.lv[romLv(r.id)].toLowerCase() : "à mesurer après l’échauffement")); x.onclick = () => romOpen(r.id, () => { renderCycle(); renderSouple(); }); c.append(x); }
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
  { const vids = Object.keys(C.vids || {}); if (vids.length) { const s = el("div","qkinfo"), sc = el("section"); sc.append(el("h3",null,"Ton carnet vidéo"));
      vids.forEach(id => { if (!MS[id]) return; const row = el("div","vrow"); sc.append(el("p","mut",MS[id].name), row);
        const sa = el("div"), sb = el("div"); row.append(sa, sb);   // deux emplacements fixes : l’ordre reste le même quel que soit le temps de lecture
        if (prev && (prev.vids || {})[id]) vShow(sa, prev.start, id, "Cycle précédent"); vShow(sb, C.start, id, "Ce cycle"); }); s.append(sc); box.append(s); } }
  { const sc = romBilan(C.start); if (sc) { const s = el("div","qkinfo"); s.append(sc); box.append(s); } }
  if (C.intent) box.append(el("p","vq","Ton intention : « " + C.intent + " »"));
  { const E = (S.ecl || []).filter(e => e.t >= C.start), half = C.start + 14 * 864e5, avg = (L, z) => L.length ? Math.round(L.reduce((a, e) => a + (e[z] || 0), 0) / L.length * 10) / 10 : null;
    if (E.length >= 2) { const s = el("div","qkinfo"), sc = el("section"); sc.append(el("h3",null,"Ton corps, au fil du cycle"));
      [["poignet","Poignets"],["coude","Coudes"],["epaule","Épaules"],["dos","Bas du dos"]].forEach(([z, n]) => { const a = avg(E.filter(e => e.t < half), z), b = avg(E.filter(e => e.t >= half), z); if (a == null || b == null || (a === 0 && b === 0)) return;
        const r = el("div","cyrec"); r.append(el("span",null,n), el("b",null, num(a) + " → " + num(b))); sc.append(r); });
      if (sc.childElementCount > 1) { s.append(sc); box.append(s); } } }
  const notes = (S.jr || []).filter(e => e.t >= C.start); if (notes.length) { const s = el("div","qkinfo"), sc = el("section"); sc.append(el("h3",null,"Ce que tu as écrit")); notes.slice(-4).forEach(e => { const r = el("div","vjr"); r.append(el("div","mut", new Date(e.t).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}) + ", " + lc1(e.q)), el("p",null,e.a)); sc.append(r); }); s.append(sc); box.append(s); }
  const TQ = cycTheme().b; box.append(el("p","vq",TQ)); const ta = el("textarea","vta"); ta.rows = 3; ta.setAttribute("aria-label",TQ); box.append(ta);
  box.append(el("p","vq","Ton intention pour le cycle suivant")); const ni = el("input","cyin"); ni.placeholder = "Une phrase"; ni.value = C.intent || ""; ni.maxLength = 80; ni.setAttribute("aria-label","Intention du cycle suivant"); box.append(ni);
  const ok = el("button","btn cyok","Ouvrir le cycle suivant"); ok.onclick = () => {
    const refl = ta.value.trim(), n = cycN(); (S.cycles || (S.cycles = [])).push({start:C.start, end, intent:C.intent, best, refl, vids:C.vids});
    if (refl) (S.jr || (S.jr = [])).push({t:end, q:"Bilan du cycle " + n + " : " + lc1(TQ), a:refl});
    S.cyc = {start:end, intent:ni.value.trim()}; save(); vPrune(); $("qkDlg").close(); render(); toast("Cycle " + cycN() + " ouvert. Bonne route."); };
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
    const last = pts[pts.length - 1]; r.append(el("span","recn", m.name), g, el("b",null, last ? fmt(m, last) : "à venir")); g.setAttribute("role","img"); g.setAttribute("aria-label", "Record de " + m.name + " par cycle : " + pts.map(v => fmt(m, v)).join(", ")); box.append(r); });
}
// ---------- Carnet vidéo du cycle : une tentative filmée par figure le jour du test, gardée sur le téléphone (IndexedDB) ----------
// seuls les deux derniers cycles sont gardés : de quoi comparer, sans remplir la mémoire
let vdb = null;
const VDB = () => vdb || (vdb = new Promise((ok, ko) => { if (!window.indexedDB) return ko("indisponible"); const r = indexedDB.open("hs-videos", 1); r.onupgradeneeded = () => r.result.createObjectStore("v"); r.onsuccess = () => ok(r.result); r.onerror = () => { vdb = null; ko(r.error); }; }));
const vTx = (mode, fn) => VDB().then(db => new Promise((ok, ko) => { const t = db.transaction("v", mode), st0 = t.objectStore("v"), out = fn(st0); t.oncomplete = () => ok(out instanceof IDBRequest ? out.result : out); t.onerror = () => ko(t.error); t.onabort = () => ko(t.error); }));
const vKey = (start, id) => start + "|" + id;
const vPut = (start, id, blob) => vTx("readwrite", s => s.put(blob, vKey(start, id)));
const vGet = (start, id) => vTx("readonly", s => s.get(vKey(start, id)));
const vKeys = () => vTx("readonly", s => s.getAllKeys());
async function vPrune(){ try { const keep = new Set([cyc().start].concat((S.cycles || []).slice(-1).map(c => c.start))), ks = await vKeys();
  const old = ks.filter(k => !keep.has(+String(k).split("|")[0])); if (old.length) await vTx("readwrite", s => { old.forEach(k => s.delete(k)); }); } catch(e){} }
function vPick(id, after){   // filmer ou choisir une vidéo pour une figure du test
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "video/*"; inp.hidden = true; document.body.append(inp);   // caméra ou photothèque, au choix du téléphone
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch(e){}
  window.addEventListener("focus", () => setTimeout(() => { if (!inp.files || !inp.files.length) inp.remove(); }, 5000), {once:true});   // sélecteur annulé : rien ne reste dans la page
  inp.onchange = async () => { const f = inp.files && inp.files[0]; inp.remove(); if (!f) return; if (f.size > 80e6) { toast("Vidéo trop lourde (plus de 80 Mo) : coupe-la autour de la tentative."); return; }
    try { await vPut(cyc().start, id, f); S.cyc.vids = Object.assign(S.cyc.vids || {}, {[id]:1}); save(); vPrune(); toast("Vidéo gardée dans ton carnet du cycle."); if (after) after(); } catch(e){ toast("Impossible de garder la vidéo sur ce téléphone."); } };
  inp.click();
}
function vShow(box, start, id, label){   // une vidéo du carnet, lue sur place
  vGet(start, id).then(b => { if (!b) return; const f = el("figure","vfig"), v = document.createElement("video"), u = URL.createObjectURL(b); v.src = u; $("qkDlg").addEventListener("close", () => URL.revokeObjectURL(u), {once:true}); v.controls = true; v.playsInline = true; v.preload = "metadata"; v.setAttribute("aria-label", label);
    f.append(v, el("figcaption","mut",label)); box.append(f); }).catch(() => {});
}
