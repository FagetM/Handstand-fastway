// Apprendre : les formations, façon Duolingo. Des voies par catégorie ; dans chaque voie, un chemin de leçons
// qui s’ouvrent l’une après l’autre ; une leçon = des cartes courtes, un petit quiz, une pratique guidée.
// État : S.learn = {done:{idLeçon:horodatage}, xp, days:[clés de jour], open:idVoie}
"use strict";
const LN_IC = {
  tree:'<path d="M12 21v-6"/><path d="M12 15c-4 0-7-2.5-7-6 0-3 3-6 7-6s7 3 7 6c0 3.5-3 6-7 6Z"/>',
  body:'<circle cx="12" cy="5" r="2"/><path d="M12 7v7M6 10l6 1 6-1M9 21l3-7 3 7"/>',
  wind:'<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/>',
  drop:'<path d="M12 3c3.5 4.5 6 7.7 6 11a6 6 0 0 1-12 0c0-3.3 2.5-6.5 6-11Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7s-5-2-6.5-5L3 13a1.5 1.5 0 0 1 2.5-1.5L8 14"/>',
  book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1Z"/><path d="M12 6v14"/>',
  hs:'<circle cx="12" cy="19" r="2"/><path d="M12 17V8M8 21l4-4 4 4M12 8l-3-5M12 8l3-5"/>'};
const lnIcon = k => '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (LN_IC[k] || LN_IC.book) + '</svg>';
const LS = () => S.learn || (S.learn = {done:{}, xp:0, days:[]});
const lessonsOf = v => v.units.flatMap(u => u.lessons);
const voieById = id => LEARN.flatMap(c => c.voies).find(v => v.id === id);
// série : jours d’affilée avec au moins une leçon (aujourd’hui ou hier compte encore)
function lnStreak(){ const D = new Set(LS().days); let n = 0, k = D.has(ago(0)) ? 0 : 1; while (D.has(ago(k))) { n++; k++; } return n; }

function renderLearn(){
  const box = $("learn"); if (!box) return; box.textContent = ""; const L = LS();
  if (L.open && voieById(L.open)) return renderVoiePath(box, voieById(L.open));
  const hd = el("div","lnstats"); hd.append(el("div","lnst", lnStreak() + " j"), el("span","mut","de série"), el("div","lnst", String(L.xp || 0)), el("span","mut","points"));
  box.append(hd);
  LEARN.forEach(c => { box.append(el("h2","lncat", c.cat)); const g = el("div","lngrid");
    c.voies.forEach(v => { const ls = lessonsOf(v), dn = ls.filter(l => L.done[l.id]).length, b = el("button","lnv" + (dn === ls.length ? " done" : ""));
      const ic = el("span","lnic"); ic.innerHTML = lnIcon(v.ic); const bar = el("span","bar"), i = el("i"); i.style.width = Math.round(dn / ls.length * 100) + "%"; bar.append(i);
      b.append(ic, el("b",null,v.name), el("span","mut", v.sub), bar, el("span","lncnt", dn + " / " + ls.length));
      b.setAttribute("aria-label", v.name + ", " + dn + " leçons sur " + ls.length);
      b.onclick = () => { L.open = v.id; save(); renderLearn(); window.scrollTo(0, 0); }; g.append(b); });
    box.append(g); });
}
// le chemin d’une voie : une leçon par rond, la suivante s’ouvre quand la précédente est faite
function renderVoiePath(box, v){ const L = LS(), ls = lessonsOf(v), next = ls.find(l => !L.done[l.id]);
  const back = el("button","lnback","‹ Toutes les voies"); back.onclick = () => { L.open = null; save(); renderLearn(); window.scrollTo(0, 0); };
  const hd = el("div","lnvh"), ic = el("span","lnic"); ic.innerHTML = lnIcon(v.ic); const t = el("div"); t.append(el("h2",null,v.name), el("span","mut", v.sub)); hd.append(ic, t);
  box.append(back, hd); let k = 0;
  v.units.forEach(u => { box.append(el("div","lnunit", u.name)); const p = el("div","lnpath");
    u.lessons.forEach(l => { const done = !!L.done[l.id], cur = next && next.id === l.id, lock = !done && !cur, b = el("button","lnn" + (done ? " done" : cur ? " cur" : " lk"));
      b.style.marginLeft = [0, 22, 34, 22, 0, -22, -34, -22][k++ % 8] + "%";
      const r = el("span","lnr"); r.innerHTML = done ? ICON.check : lock ? ICON.lock : lnIcon(v.ic); b.append(r, el("span","lnl", l.name));
      b.setAttribute("aria-label", l.name + (done ? ", faite" : lock ? ", verrouillée" : ", à faire"));
      b.onclick = () => { if (lock) { toast("Termine d’abord : " + next.name); return; } lnOpen(v, l); }; p.append(b); });
    box.append(p); });
  if (!next) box.append(el("p","lnfin","Voie terminée. Tu peux refaire chaque leçon quand tu veux."));
}

// ---------- Une leçon ----------
let ln = null;
function lnOpen(v, l){ const steps = l.steps.map(s => s[0] === "q" ? (() => { const ord = s[2].map((t, i) => [t, i]).sort(() => Math.random() - 0.5); return ["q", s[1], ord.map(o => o[0]), ord.findIndex(o => o[1] === s[3]), s[4]]; })() : s);
  ln = {v, l, steps, i:0, miss:0, wrong:[]}; const d = $("lnDlg"); $("lnT").textContent = l.name; lnStep(); if (!d.open) d.showModal(); }
function lnStep(){ const box = $("lnBody"), go = $("lnGo"); box.textContent = ""; go.disabled = false;
  $("lnBar").style.transform = "scaleX(" + (ln.i / ln.steps.length).toFixed(3) + ")";
  const s = ln.steps[ln.i]; if (!s) return lnEnd();
  if (s[0] === "c") { box.append(el("div","lab","À retenir"), el("h3",null,s[1]), el("p","lncard", s[2])); go.textContent = "Continuer"; go.onclick = () => { ln.i++; lnStep(); }; }
  else if (s[0] === "q") { box.append(el("h3",null,s[1])); const opts = el("div","lnq"); go.textContent = "Vérifier"; go.disabled = true; let pick = null;
    s[2].forEach((t, k) => { const b = el("button","lnopt", t); b.onclick = () => { if (go.dataset.done) return; pick = k; opts.querySelectorAll(".lnopt").forEach((x, j) => x.classList.toggle("on", j === k)); go.disabled = false; }; opts.append(b); });
    box.append(opts); go.dataset.done = "";
    go.onclick = () => { if (!go.dataset.done) { if (pick == null) return; go.dataset.done = "1"; const ok = pick === s[3];
        opts.querySelectorAll(".lnopt").forEach((x, j) => { x.classList.toggle("ok", j === s[3]); x.classList.toggle("ko", j === pick && !ok); x.classList.remove("on"); });
        box.append(el("p","lnwhy" + (ok ? " ok" : " ko"), (ok ? "Juste. " : "Pas tout à fait. ") + s[4]));
        if (!ok) { ln.miss++; if (!ln.wrong.includes(s)) { ln.wrong.push(s); ln.steps.push(s); } }   // une erreur revient à la fin de la leçon
        go.textContent = "Continuer"; return; }
      go.dataset.done = ""; ln.i++; lnStep(); }; }
  else if (s[0] === "p") { const p = typeof s[1] === "string" ? PRATIQUES.find(x => x.id === s[1]) : s[1];
    if (!p) { ln.i++; return lnStep(); }
    box.append(el("div","lab","Pratique"), el("h3",null,p.name), el("p","mut", p.dur));
    const pb = el("button","btn line","Commencer la pratique"); pb.onclick = () => { $("lnDlg").close(); vpOpen(p); $("vpDlg").addEventListener("close", () => { $("lnDlg").showModal(); ln.i++; lnStep(); }, {once:true}); }; box.append(pb);
    go.textContent = "Passer"; go.onclick = () => { ln.i++; lnStep(); }; }
}
function lnEnd(){ const L = LS(), first = !L.done[ln.l.id], pts = 10 + (ln.miss ? 0 : 5);
  L.done[ln.l.id] = Date.now(); L.xp = (L.xp || 0) + pts; const d = dayKey(Date.now()); if (!L.days.includes(d)) { L.days.push(d); if (L.days.length > 400) L.days = L.days.slice(-400); } save();
  const box = $("lnBody"), go = $("lnGo"); box.textContent = ""; $("lnBar").style.transform = "scaleX(1)";
  box.append(el("div","lnend", "+" + pts), el("h3",null, ln.miss ? "Leçon terminée" : "Sans faute"), el("p","mut", lnStreak() + " j de série" + (first ? "" : " · leçon revue")));
  go.textContent = "Continuer"; go.onclick = () => { $("lnDlg").close(); renderLearn(); };
}
$("lnX").onclick = () => $("lnDlg").close();
