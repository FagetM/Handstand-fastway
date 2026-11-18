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
function startPlacement(){ plSkip = new Set(); plMiss = {}; plN = 0; delete S.plAdv; delete S.plRom; const box = $("plBody"); box.textContent = "";
  const go = el("button","btn","C’est parti"); go.onclick = plGoal;
  const pf = el("div"); profForm(pf);
  const E = S.equip || (S.equip = {});
  const eqr = chipRow([["band","Élastiques"],["para","Parallettes"],["blocks","Briques de yoga"],["bench","Banc"],["rings","Anneaux"]], k => E[k],
    k => { E[k] = !E[k]; const cb = $("eq" + k[0].toUpperCase() + k.slice(1)); if (cb) cb.checked = E[k]; save(); }, "prow", "Ton matériel");   // les réglages restent d’accord
  const wrap = el("div"); wrap.append(pf, el("div","lab","Ton matériel"), eqr);   // le profil se redessine seul, sans effacer le matériel ; le but se choisit juste après, en grand
  const opt = el("details","popt"); opt.append(el("summary",null,"Préciser matériel et profil (facultatif)"), wrap);
  box.append(el("h2",null,"Avant de te renverser"), safeList(), go, opt); $("plDlg").showModal(); }
const SAFE = new Set(["fd_roue","st_bail30","st_bailc2w"]);
// le but, en premier et en grand : tout le bilan (et le parcours) s’oriente dessus
const PL_GOALS = [["min","Tenir sur les mains","in_str60"],["planche","La full planche","pl_full"],["oahs","Tenir sur un bras","oa_oahs"],["press","Monter en force : stalder, manna","pr_stalder"],["both","Tout : le combo ultime","ul_full"]];
function plGoal(){ const box = $("plBody"); box.textContent = ""; box.append(el("div","lab","Ton but"), el("h2",null,"Qu’est-ce qui te fait envie ?"));
  const g = el("div","plgoal");
  PL_GOALS.forEach(([k, name, fig]) => { const b = el("button","plg" + ((S.goal || "both") === k ? " on" : "")), sp = el("span","sp"); sp.dataset.pose = poseId(fig); sp.dataset.anim = fig; sp.dataset.lk = ""; sprPaint(sp, 56);
    b.append(sp, el("b",null,name)); b.onclick = () => { S.goal = k === "both" ? null : k; save(); const gs = $("goalSel"); if (gs) gs.value = k; plHs(); }; g.append(b); });
  box.append(g, el("p","mut","Tu pourras changer d’avis dans le Profil.")); }
// une question d’aiguillage : qui tient déjà l’équilibre sans mur saute les fondations (elles seront vérifiées en séance)
function plHs(){ const box = $("plBody"); box.textContent = ""; const art = el("div","plart"), sp = el("span","sp"); sp.dataset.pose = poseId("b2_str15"); sp.dataset.anim = "b2_str15"; sp.dataset.lk = ""; sprPaint(sp, 150); art.append(sp);
  box.append(el("div","lab","Une question pour commencer"), el("h2",null,"Tu tiens déjà l’équilibre sur les mains, sans mur ?"), art);
  const row = el("div","chips"), opt = (t, fn) => { const b = el("button","chip", t); b.onclick = fn; row.append(b); };
  opt("Pas encore", () => plStep()); opt("Quelques secondes", () => plStep());
  opt("15 s ou plus", () => { [...reqsOf("b2_str15"), "b2_str15"].forEach(r => { const x = st(r); if (x.done || MS[r].alt) return; x.done = true; if (MS[r].target) x.best = Math.max(x.best, MS[r].target); (S.confirm || (S.confirm = [])).push(r); }); save(); plStep(); });
  box.append(row, el("p","mut","Si tu tiens 15 s, les étapes d’avant sont comptées comme acquises : la séance les vérifiera.")); }
// ta souplesse : trois repères, une touche chacun ; elle guide les étirements et compte pour la montée en force (facultatif)
function plRom(){ const box = $("plBody"), pick = {}; box.textContent = ""; box.append(el("div","lab","Ta souplesse"), el("h2",null,"Où en es-tu ?"), el("p","mut","Une touche par repère, sans t’échauffer : c’est une première idée. Tu pourras mesurer plus juste dans le Profil."));
  ["pike","pancake","epaules"].forEach(id => { const r = ROMI[id]; if (!r) return; box.append(el("div","lab", r.name + (r.yoga ? " · " + r.yoga : "")), chipRow(r.lv.map((t, k) => [k, t]), k => pick[id] === k, k => { pick[id] = k; }, "romch")); });
  const ok = el("button","btn","Continuer"); ok.onclick = () => { const R = S.rom || (S.rom = {}); Object.entries(pick).forEach(([id, v]) => (R[id] || (R[id] = [])).push({t:Date.now(), v})); save(); plStep(); };
  box.append(ok); }
// un même effort à plusieurs durées (équilibre droit 15, 40, 60 s) : une seule question, la réponse valide ce qu’elle couvre
const HOLD_FAM = [["b2_str15","in_str40","in_str60"]];
// déjà avancé : des figures phares à cocher d’un coup, leurs étapes d’avant comptent comme acquises (vérifiées en séance)
const PL_ADV = ["in_toes7","in_7d","pl_tuck","pl_adv","pl_straddle","pr_lsit","pr_vsit","pr_straddle","pr_pike","pr_stalder","oa_flaghoriz","oa_finger1","oa_oahs","lo_croc"];
function plAdv(){ const box = $("plBody"), pick = new Set(); box.textContent = "";
  box.append(el("div","lab","Déjà avancé"), el("h2",null,"Tu sais déjà faire certaines de ces figures ?"), el("p","mut","Touche celles que tu tiens proprement. Ce qui mène jusqu’à elles sera compté comme acquis, puis vérifié en séance."));
  const g = el("div","pladv"), done = el("button","btn","C’est tout");
  PL_ADV.filter(id => MS[id] && !st(id).done).forEach(id => { const b = el("button","pla"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 56);
    b.append(sp, el("span",null, MS[id].name)); b.setAttribute("aria-pressed","false"); b.onclick = () => { const on = !pick.has(id); on ? pick.add(id) : pick.delete(id); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }; g.append(b); });
  done.onclick = () => { pick.forEach(id => [...reqsOf(id), id].forEach(r => { const x = st(r); if (x.done || MS[r].alt) return; x.done = true; if (MS[r].target) x.best = Math.max(x.best, MS[r].target); if (FORCE(r) || MS[r].type !== "check") (S.confirm || (S.confirm = [])).push(r); })); S.plAdv = 2; save(); plStep(); };
  box.append(g, done); }
function plStep(){
  const id = goalOf().ms.find(x=>!st(x).done && !msLocked(MS[x]) && !eqSkip(x) && !plSkip.has(x) && (plMiss[MS[x].sec] || 0) < 2 && !(S.plAdv === 2 && /^(pl_|pr_|oa_|ul_|lo_)/.test(x))), box = $("plBody"); box.textContent = "";   // après la page « déjà avancé », les disciplines se découvrent en séance
  // ceux qui tiennent déjà l’équilibre droit : une page pour déclarer leurs figures avancées, au lieu de dizaines de questions
  if (!S.plAdv && plN > 0 && (st("in_str60").done || st("b1_free5").done) && goalOf().ms.some(x => !st(x).done && /^(pl_|pr_|oa_)/.test(x))) { S.plAdv = 1; return plAdv(); }
  if (!id && !S.plRom && typeof ROM !== "undefined") { S.plRom = 1; return plRom(); }   // la souplesse fait partie du bilan, en une page
  if (!id) { S.placed = true; save(); render();
    const nx = goalOf().ms.find(x=>!st(x).done && !msLocked(MS[x]) && !eqSkip(x)), gw = planWk(plan(), [goalTop()]);
    box.append(el("div","lab","Bilan fini"), el("h2",null, nx ? "On commence par : " + MS[nx].name : "Tout est validé"));
    if (gw) box.append(el("p","mut","Ton but, " + goalShort().toLowerCase() + " : " + rangeTxt(gw) + ", à ce rythme."));
    if ((S.confirm || []).length) box.append(el("p","mut","Ce que tu as déclaré sera vérifié en séance."));
    const b = el("button","btn","Démarrer la séance"); b.onclick = () => { $("plDlg").close(); showTab("today"); window.scrollTo(0,0); startGuided(); }; box.append(b);

    const l = el("button","lnk","Plus tard"); l.onclick = () => { $("plDlg").close(); showTab("today"); }; box.append(l); return; }
  const m = MS[id], L = lvls(m), art = el("div","plart"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 150); art.append(sp);
  box.append(el("div","lab", "Question " + (++plN) + ", " + SEC[m.sec].name), el("h2",null, m.name), art);
  { const stop = el("button","lnk plstop","C’est bon, je m’arrête là"); stop.onclick = () => { goalOf().ms.forEach(x => plSkip.add(x)); plStep(); }; box.append(stop); }   // le reste se découvrira en séance
  if (m.desc) { const d = el("p","mut"), qb = el("button","qhelp","?"); qb.setAttribute("aria-label","C’est quoi ?"); qb.onclick = () => { d.textContent = m.desc; qb.remove(); }; box.querySelector("h2").append(" ", qb); box.append(d); }
  const yes = () => { const x = st(id); x.done = true; if (m.target) x.best = Math.max(x.best, m.target); if (SAFE.has(id) || FORCE(id) || (m.sec !== "base" && m.type !== "check")) (S.confirm || (S.confirm = [])).push(id); save(); plStep(); };
  const no = (v) => { if (v) { const x = st(id); x.best = Math.max(x.best, v); } else plMiss[m.sec] = (plMiss[m.sec] || 0) + 1; plSkip.add(id); save(); plStep(); };
  const exact = (unit) => { const r = el("form","plx"), i = el("input"); i.type = "number"; i.min = "0"; i.inputMode = "numeric"; i.placeholder = "autre"; i.setAttribute("aria-label","Nombre exact en " + unit);
    const b = el("button","chip","Valider"); b.type = "submit"; r.onsubmit = (e) => { e.preventDefault(); const v = Math.max(0, Math.round(+i.value || 0)); if (!i.value) return; v >= (m.target || 1) ? yes() : no(v); };
    r.append(i, el("span","mut",unit), b); return r; };
  const q = el("div","plq");
  const fam0 = HOLD_FAM.find(f => f.includes(id)), fam = fam0 ? fam0.slice(fam0.indexOf(id)) : null;   // la question couvre ce qui reste de la famille
  if (fam) { q.append(el("div","mut","Combien de temps tiens-tu cette figure ?")); const row = el("div","chips");
    [["Pas du tout",0]].concat(L.slice(0, -1).map(v=>["≈ " + v + " s", v])).forEach(([lab,v])=>{ const b = el("button","chip",lab); b.onclick = () => no(v); row.append(b); });
    fam.forEach((f, i) => { const b = el("button","chip", MS[f].target + " s" + (i === fam.length - 1 ? " ou plus" : "")); b.onclick = () => { fam.slice(0, i + 1).forEach(x => { const o = st(x); o.done = true; o.best = Math.max(o.best, MS[x].target); (S.confirm || (S.confirm = [])).push(x); });
      fam.slice(i + 1).forEach(x => { st(x).best = Math.max(st(x).best, MS[f].target); plSkip.add(x); }); save(); plStep(); }; row.append(b); });
    q.append(row, exact("secondes")); }
  else if (m.type === "hold") { q.append(el("div","mut","Combien de temps tiens-tu cette figure ?"));
    const row = el("div","chips"); [["Pas du tout",0]].concat(L.slice(0, -1).map(v=>["≈ " + v + " s", v])).forEach(([lab,v])=>{ const b = el("button","chip",lab); b.onclick = () => no(v); row.append(b); });
    const ok = el("button","chip", m.target + " s ou plus"); ok.onclick = yes; row.append(ok); q.append(row, exact("secondes")); }
  else { q.append(el("div","mut","Sais-tu le faire proprement ?")); const row = el("div","chips"), y = el("button","chip","Oui"), n = el("button","chip","Pas encore"); y.onclick = yes; n.onclick = () => no(0); row.append(y, n); q.append(row); if (m.type === "reps" && m.target > 1) q.append(exact("répétitions")); }
  box.append(q);
}
