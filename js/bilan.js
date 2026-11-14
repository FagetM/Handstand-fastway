// Bilan de départ et profil : sécurité, objectif, matériel, âge, poids, fragilités, puis les figures déjà acquises (vérifiées ensuite en séance).
"use strict";
// Bilan de départ : on parcourt les figures dans l’ordre ; tu dis ce que tu sais faire, l’app valide et se place au bon jalon.
// Profil en trois touches : il allonge les dates (âge, poids) et ajoute des protections (poignets, coudes, biceps)
const PROF = [["age","Âge",[["<35","Moins de 35 ans"],["35-50","35 à 50 ans"],[">50","Plus de 50 ans"]]],["poids","Poids",[["<70","Moins de 70 kg"],["70-90","70 à 90 kg"],[">90","Plus de 90 kg"]]]];
const FRAG = [["hyper","Hyperlaxe"],["poignet","Poignets"],["coude","Coudes"],["biceps","Biceps"],["epaule","Épaules"]];
const frag = z => ((S.prof || {}).frag || []).includes(z);
function profForm(box, after){ if (!box) return; box.textContent = ""; const P = S.prof || (S.prof = {});
  const done = () => { save(); if (after) after(); };
  PROF.forEach(([k, lab, opts]) => { const row = chipRow(opts, v => P[k] === v, v => { P[k] = v; done(); }, "prow", lab); row.setAttribute("role","group"); box.append(el("div","lab",lab), row); });
  box.append(el("div","lab","Déjà fragile, ou déjà blessé"), chipRow(FRAG, frag, z => { P.frag = frag(z) ? (P.frag || []).filter(x => x !== z) : (P.frag || []).concat(z); done(); }, "prow", "Fragilités")); }
let plSkip = new Set(), plMiss = {}, plN = 0;
// d’abord la sécurité, puis les questions ; un « pas du tout » deux fois dans une même voie et on passe à la suivante
// une figure déclarée qui ne passe pas : celles déclarées après elle, qui en dépendent, repartent aussi
// tous les prérequis d’une figure, en remontant l’arbre
const reqsOf = id => { const out = new Set(), go = x => (MS[x] && MS[x].req || []).forEach(r => { if (!out.has(r)) { out.add(r); go(r); } }); go(id); return out; };
// vérification réussie : ses prérequis déclarés sont confirmés avec elle
const confirmUp = id => { const R = reqsOf(id); S.confirm = (S.confirm || []).filter(x => x !== id && (SAFE.has(x) || !R.has(x))); };
function unDeclare(id){ const dep = (x, seen) => (MS[x].req || []).some(r => r === id || (!seen.has(r) && MS[r] && (seen.add(r), dep(r, seen))));
  (S.confirm || []).filter(x => x !== id && MS[x] && dep(x, new Set())).forEach(x => { const s = st(x); s.done = false; s.best = 0; s.b0 = null; }); S.confirm = (S.confirm || []).filter(x => x === id || !(MS[x] && dep(x, new Set()))); }
function startPlacement(){ plSkip = new Set(); plMiss = {}; plN = 0; const box = $("plBody"); box.textContent = "";
  const go = el("button","btn","J’ai lu, on y va"); go.onclick = plStep;
  const pf = el("div"); profForm(pf);
  const E = S.equip || (S.equip = {});
  const eqr = chipRow([["band","Élastiques"],["para","Parallettes"],["blocks","Briques de yoga"],["bench","Banc"],["rings","Anneaux"]], k => E[k],
    k => { E[k] = !E[k]; const cb = $("eq" + k[0].toUpperCase() + k.slice(1)); if (cb) cb.checked = E[k]; save(); }, "prow", "Ton matériel");   // les réglages restent d’accord
  const gr = chipRow([["both","Le combo"],["planche","Full planche"],["press","Équilibre en force"],["oahs","Un bras"],["min","Équilibre droit"]], g => (S.goal || "both") === g,
    g => { S.goal = g === "both" ? null : g; save(); const gs = $("goalSel"); if (gs) gs.value = g; }, "prow", "Ton objectif");
  const wrap = el("div"); wrap.append(el("div","lab","Ton objectif"), gr, pf, el("div","lab","Ton matériel"), eqr);   // le profil se redessine seul, sans effacer objectif ni matériel
  box.append(el("h2",null,"Avant de te renverser"), el("p",null, SAFE_TXT), el("h2",null,"Toi, en quelques touches"), wrap, el("p","mut","Ensuite, ce que tu sais déjà faire. L’app vérifiera en séance."), go); $("plDlg").showModal(); }
const SAFE = new Set(["fd_roue","st_bail30","st_bailc2w"]);
function plStep(){
  const id = goalOf().ms.find(x=>!st(x).done && !msLocked(MS[x]) && !eqSkip(x) && !plSkip.has(x) && (plMiss[MS[x].sec] || 0) < 2), box = $("plBody"); box.textContent = "";
  if (!id) { S.placed = true; save(); render();
    const nx = goalOf().ms.find(x=>!st(x).done && !msLocked(MS[x]) && !eqSkip(x)); box.append(el("h2",null,"Bilan terminé"), el("p",null, nx ? (plN <= 3 ? "En " + plN + " question" + (plN > 1 ? "s" : "") + " : tu démarres par « " + SEC[MS[nx].sec].name + " ». " : "") + "Ton point de départ : « " + MS[nx].name + " ». La séance du jour est prête." : "Tout est validé."));
    if ((S.confirm || []).length) box.append(el("p","mut","Les figures de force, d’équilibre à un bras et de souplesse que tu as déclarées seront vérifiées en séance, deux à la fois. Si l’une ne passe pas, elle revient simplement dans ton parcours."));
    const b = el("button","btn","Voir ma séance"); b.onclick = () => { $("plDlg").close(); showTab("today"); window.scrollTo(0,0); }; box.append(b); return; }
  const m = MS[id], L = lvls(m), art = el("div","plart"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 150); art.append(sp);
  box.append(el("div","lab", "Question " + (++plN) + ", " + SEC[m.sec].name), el("h2",null, m.name), art);
  if (m.desc) box.append(el("p","mut", m.desc));
  const yes = () => { const x = st(id); x.done = true; if (m.target) x.best = Math.max(x.best, m.target); if (SAFE.has(id) || FORCE(id) || (m.sec !== "base" && m.type !== "check")) (S.confirm || (S.confirm = [])).push(id); save(); plStep(); };
  const no = (v) => { if (v) { const x = st(id); x.best = Math.max(x.best, v); } else plMiss[m.sec] = (plMiss[m.sec] || 0) + 1; plSkip.add(id); save(); plStep(); };
  const exact = (unit) => { const r = el("form","plx"), i = el("input"); i.type = "number"; i.min = "0"; i.inputMode = "numeric"; i.placeholder = "autre"; i.setAttribute("aria-label","Nombre exact en " + unit);
    const b = el("button","chip","Valider"); b.type = "submit"; r.onsubmit = (e) => { e.preventDefault(); const v = Math.max(0, Math.round(+i.value || 0)); if (!i.value) return; v >= (m.target || 1) ? yes() : no(v); };
    r.append(i, el("span","mut",unit), b); return r; };
  const q = el("div","plq");
  if (m.type === "hold") { q.append(el("div","mut","Combien de temps tiens-tu cette figure ?"));
    const row = el("div","chips"); [["Pas du tout",0]].concat(L.slice(0, -1).map(v=>["≈ " + v + " s", v])).forEach(([lab,v])=>{ const b = el("button","chip",lab); b.onclick = () => no(v); row.append(b); });
    const ok = el("button","chip", m.target + " s ou plus"); ok.onclick = yes; row.append(ok); q.append(row, exact("secondes")); }
  else { q.append(el("div","mut","Sais-tu le faire proprement ?")); const row = el("div","chips"), y = el("button","chip on","Oui"), n = el("button","chip","Pas encore"); y.onclick = yes; n.onclick = () => no(0); row.append(y, n); q.append(row); if (m.type === "reps" && m.target > 1) q.append(exact("répétitions")); }
  box.append(q);
}
