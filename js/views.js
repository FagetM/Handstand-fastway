// Vestiaire, rendu des onglets, fiche d'une figure avec chrono.
"use strict";
// Vestiaire : [identifiant, nom, niveau requis]. La médaille se débloque en terminant une quête principale.
const WARD = [
  {slot:"skin", name:"Peau", items:[["s1","Claire"],["s2","Hâlée"],["s3","Mate"],["s4","Foncée"]]},
  {slot:"hair", name:"Coiffure", items:[["none","Rasés"],["short","Courts"],["bun","Chignon"],["tail","Queue de cheval"]]},
  {slot:"hairc", name:"Couleur des cheveux", items:[["brown","Bruns"],["black","Noirs"],["blond","Blonds"],["red","Roux"],["grey","Gris"]]},
  {slot:"top", name:"Haut", items:[["none","Torse nu"],["tank_k","Débardeur noir"],["tee_w","T-shirt blanc"],["tank_w","Débardeur blanc",2],["tee_g","T-shirt gris",2],["tee_k","T-shirt noir",3],
    ["tee_o","T-shirt orange",5],["tank_o","Débardeur orange",6],["tee_b","T-shirt bleu",7],["ls_k","Manches longues noir",9],["tee_v","T-shirt vert",10],["ls_w","Manches longues blanc",11],
    ["tee_y","T-shirt jaune","b:st7"],["tee_r","T-shirt rouge","b:s100"],["tee_p","T-shirt violet","b:e10"],["ls_n","Manches longues marine","b:se10"],
    ["tee_x","T-shirt rose","m:in_holds"],["tank_v","Débardeur vert","m:pl_lean"],["ls_v","Manches longues vert","m:pl_half"],["tank_r","Débardeur rouge","b:h180"],["ls_r","Manches longues rouge","m:oa_switch"],["tank_p","Débardeur violet","b:se200"],["ls_p","Manches longues violet","b:se400"],["tank_y","Débardeur jaune","m:pl_press"]]},
  {slot:"bottom", name:"Bas", items:[["short_k","Short noir"],["short_g","Short gris",2],["short_o","Short orange",4],["short_b","Short bleu",5],["pants_k","Pantalon noir",6],["pants_g","Pantalon gris",8],
    ["pants_n","Pantalon marine",10],["short_v","Short vert","b:st3"],["short_r","Short rouge","b:h10"],["pants_w","Pantalon blanc","b:st30"],
    ["short_x","Short rose","m:in_7s"],["short_y","Short jaune","m:pr_lsit"],["pants_o","Pantalon orange","m:oa_wall"],["pants_r","Pantalon rouge","b:se100"],["pants_p","Pantalon violet","m:pr_manna"],["pants_x","Pantalon rose","b:h600"]]},
  {slot:"feet", name:"Pieds", items:[["bare","Pieds nus"],["socks_w","Chaussettes blanches",2],["socks_k","Chaussettes noires",3],["shoes_k","Chaussures noires",4],["shoes_w","Chaussures blanches",6],["shoes_o","Chaussures orange",9],["shoes_y","Chaussures jaunes","b:se50"],
    ["socks_r","Chaussettes rouges","m:b2_str15"],["socks_x","Chaussettes roses","m:in_str40"],["shoes_x","Chaussures roses","m:oa_flaghoriz"],["flip_b","Palmes de plongée","m:st_split"],["clown_r","Chaussures de clown","b:se100"]]},
  {slot:"wrists", name:"Poignets et mains", items:[["none","Rien"],["wraps_w","Bandes blanches",3],["wraps_o","Bandes orange",4],["wraps_k","Bandes noires",7],["chalk","Magnésie","b:h10"],["wraps_r","Bandes rouges","m:in_str60"],["wraps_p","Bandes violettes","m:pl_tuck"],["wraps_y","Bandes jaunes","m:pr_lsitHs"],["box_r","Gants de boxe","m:oa_wall"]]},
  {slot:"head", name:"Tête", items:[["none","Rien"],["band_o","Bandeau orange",5],["band_w","Bandeau blanc",5],["beanie_k","Bonnet noir",7],["cap_o","Casquette orange",8],["cap_k","Casquette noire",9],["beanie_r","Bonnet rouge","b:s1000"],["crown","Couronne","b:goal_oahs"],
    ["prop_b","Casquette à hélice",2],["party_r","Chapeau de fête","b:se10"],["cat_k","Oreilles de chat","m:b2_str15"],["chef_w","Toque de chef","m:in_str60"],["viking_g","Casque de viking","m:pl_straddle"],["horn","Corne de licorne","m:oa_oahs"],["halo","Auréole","m:pr_manna"]]},
  {slot:"face", name:"Visage", items:[["none","Rien"],["stache","Moustache",3],["nose","Nez de clown","b:st3"],["shades","Lunettes de soleil","m:b1_free5"],["mono","Monocle","m:pr_straddle"],["beard","Barbe de sage","b:h60"]]},
  {slot:"extra", name:"Accessoire", items:[["none","Rien"],["belt_w","Ceinture blanche",3],["belt_o","Ceinture orange",6],["belt_k","Ceinture noire",12],["medal","Médaille","quest"],["medal2","Deux médailles","b:goal_planche"],
    ["bow_r","Nœud papillon","m:in_holds"],["duck","Bouée canard","m:pr_lsit"],["tutu","Tutu rose","m:in_7s"],["cape_r","Cape de super-héros","m:pr_straddle"],["cape_k","Cape noire","m:pl_press"]]},
];
// Postures que le personnage peut prendre : debout, plus celle de chaque jalon validé.
const poseOf = id => POSE3D[id] || (id.startsWith("pl_") ? id : null);
function unlockedPoses(){ const out = [["stand","Debout"]], seen = new Set(["stand"]);
  Object.keys(MS).forEach(id=>{ const p = poseOf(id); if (p && st(id).done && !seen.has(p)) { seen.add(p); out.push([p, MS[id].name]); } });
  return out; }
// les coffres du parcours ajoutent chacun une tenue au vestiaire
Object.entries(CHESTS).forEach(([sid, [slot, id, name]])=>{ const w = WARD.find(x=>x.slot === slot); if (w && !w.items.some(it=>it[0] === id)) w.items.push([id, name, "c:" + sid]); });
const wardOk = (need, Z) => !need || (need === "quest" ? Z.badges.some(b=>b.ok && b.id.startsWith("goal_")) : typeof need === "string" ? need.startsWith("m:") ? st(need.slice(2)).done : (need.startsWith("c:") ? (chestOpen(SEC[need.slice(2)]) || (S.chests || []).includes(need.slice(2))) : (Z.badges.find(b=>b.id === need.slice(2)) || {}).ok) : Z.lvl >= need);
const FIT0 = {skin:"s2", hair:"short", hairc:"brown", top:"tee_w", bottom:"short_k", feet:"bare", wrists:"none", head:"none", face:"none", extra:"none"};
const fit = () => Object.assign({}, FIT0, S.fit || {});
function renderFit(){
  const box = $("fitBody"), F = fit(), Z = lastZ || stats(); box.textContent = "";
  const all = WARD.flatMap(w=>w.items), okN = all.filter(([id,name,need])=>wardOk(need, Z)).length;
  const cnt0 = el("div","mut", okN + " éléments débloqués sur " + all.length); cnt0.style.marginTop = "10px"; box.append(cnt0);
  { const s = el("div","slot"), row = el("div","chips"), cur = F.pose || "auto"; s.append(el("div","lab","Posture"));
    [["auto","Automatique (dernière figure)"]].concat(unlockedPoses()).forEach(([id, name])=>{
      const b = el("button","chip" + (cur === id ? " on" : ""), name); b.setAttribute("aria-pressed", cur === id);
      b.onclick = () => { S.fit = Object.assign(fit(), {pose:id}); save(); render(); renderFit(); }; row.append(b); });
    s.append(row, el("div","mut","Chaque figure validée débloque sa posture.")); s.lastChild.style.marginTop = "8px"; box.append(s); }
  WARD.forEach(w=>{ const s = el("div","slot"); s.append(el("div","lab",w.name)); const row = el("div","chips");
    w.items.forEach(([id, name, need])=>{
      const bd = typeof need === "string" && need.startsWith("b:") ? Z.badges.find(b=>b.id === need.slice(2)) : null, ch = typeof need === "string" && need.startsWith("c:") ? SEC[need.slice(2)] : null;
      const ok = wardOk(need, Z);
      const b = el("button","chip" + (F[w.slot] === id ? " on" : ""), name); b.disabled = !ok; b.setAttribute("aria-pressed", F[w.slot] === id);
      if (!ok) b.append(el("small",null, need === "quest" ? "une quête terminée" : ch ? "coffre « " + ch.name + " »" : bd ? "badge « " + bd.name + " »" : typeof need === "string" && need.startsWith("m:") ? "figure « " + MS[need.slice(2)].name + " »" : "niveau " + need));
      b.onclick = () => { S.fit = Object.assign(fit(), {[w.slot]:id}); save(); if (A3 && a3want) { a3want.fit = fit(); A3.set(a3want); } clearTimeout(sprT); sprT = setTimeout(buildSprites, 900); renderFit(); };
      row.append(b); });
    s.append(row); box.append(s); });
}
$("fitOpen").onclick = () => { renderFit(); window.scrollTo(0, 0); $("fitDlg").showModal(); };
document.querySelectorAll("#fbDlg [data-k]").forEach(b=>b.onclick = () => { if (b.dataset.k === "pain") { $("fbZone").hidden = false; return; } feedback(b.dataset.k); });
document.querySelectorAll("#fbDlg [data-z]").forEach(b=>b.onclick = () => { S.painZone = b.dataset.z; feedback("pain"); $("fbZone").hidden = true; });
$("plX").onclick = () => { S.placed = true; save(); $("plDlg").close(); render(); };
// fenêtres : la croix ferme, et un toucher à côté de la fenêtre aussi
[["qkDlg","qkX"],["vdDlg","vdX"],["bdDlg","bdX"],["fitDlg","fitX"],["dlg","dX"],["sd","sdX"]].forEach(([id, x]) => { const d = $(id);
  $(x).onclick = () => d.close(); d.addEventListener("click", e => { if (e.target === d) d.close(); }); });
function setAvatar(s){
  a3want = s; if (A3) { A3.set(s); return; }
  if (a3tried) return; a3tried = true;
  try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) return; } catch(e){ return; }
  import(new URL("avatar3d.js", document.baseURI).href).then(m=>{ sprMod = m; buildSprites(); const host = $("av3d"); host.hidden = false; A3 = m.mount(host); $("av").style.display = "none"; A3.set(a3want); })
    .catch(()=>{ $("av3d").hidden = true; $("av").style.display = ""; });
}

// ---------- Rendu ----------
function render(){
  window._bb = null;
  const ids = GOALS[0].ms;
  const Z = stats(), weekAgo = Date.now() - 7*864e5;
  $("stStreak").textContent = Z.streak;
  $("stWeek").textContent = new Set(S.log.filter(l=>l.t>weekAgo).map(l=>dayKey(l.t))).size;
  $("stDone").textContent = Z.done;
  // personnage : sa posture est celle du dernier jalon validé de la quête ; l'anneau montre la progression vers le niveau suivant
  const stage = ids.filter(id=>st(id).done && FIG[id]).pop() || "_stand", frac = (Z.xp - Z.lo) / (Z.hi - Z.lo), R = 48, C = 2*Math.PI*R;
  $("av").innerHTML = '<svg class="ring" viewBox="0 0 104 104" width="104" height="104" fill="none" aria-hidden="true"><circle cx="52" cy="52" r="' + R + '" stroke="var(--line)" stroke-width="4"/>'
    + '<circle cx="52" cy="52" r="' + R + '" stroke="var(--acc)" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (C*frac).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><span class="me">' + figMini(stage, 72) + '</span>';
  $("av").setAttribute("aria-label","Ton personnage, niveau " + Z.lvl);
  const autoPose = POSE3D[stage] || (stage.startsWith("pl_") ? stage : "stand"), want = (S.fit || {}).pose;
  setAvatar({pose:want && want !== "auto" && unlockedPoses().some(p=>p[0] === want) ? want : autoPose, frac, level:Z.lvl, fit:fit(), label:"Ton personnage en 3D, niveau " + Z.lvl + ", " + Z.rank});
  lastZ = Z;
  $("lvRank").textContent = Z.rank; $("lvNum").textContent = "Niveau " + Z.lvl;
  $("xpBar").style.width = (frac*100) + "%"; $("xpTxt").textContent = Z.xp + " / " + Z.hi + " points d'expérience";
  const seen = S.seen, nowB = Z.badges.filter(b=>b.ok).map(b=>b.id);
  if (seen){ const nb = Z.badges.find(b=>b.ok && !seen.b.includes(b.id));
    if (nb) toast("Badge débloqué : " + nb.name); else if (Z.lvl > seen.lvl) toast("Niveau " + Z.lvl + " · " + Z.rank);
    if ((nb || Z.lvl > seen.lvl) && A3) A3.celebrate(); }
  { const op = Object.keys(CHESTS).filter(sid=>SEC[sid] && chestOpen(SEC[sid])), had = S.chests;
    if (had) { const nw = op.find(sid=>!had.includes(sid)); if (nw) { toast("Coffre ouvert : " + CHESTS[nw][2] + " ! Va l'enfiler dans le vestiaire."); if (A3) A3.celebrate(); } }
    const all = [...new Set((had || []).concat(op))]; if (!had || had.length !== all.length) { S.chests = all; save(); } }   // un coffre ouvert le reste
  if (!seen || seen.lvl !== Z.lvl || seen.b.length !== nowB.length) { S.seen = {lvl:Z.lvl, b:nowB}; save(); }

  const nextId = ids.find(id=>!reqDone(id) && !msLocked(MS[id])) || ids.find(id=>!reqDone(id));
  today: { // Aujourd'hui : la séance du jour d'un coup d'œil, et un seul bouton pour tout lancer
    const nc = $("nextCard"); nc.textContent = ""; pickP(); $("sessToggle").hidden = $("sess").hidden = false;
    const today = todayIdx(), day = pDay(today), vals = wkGet(today), all = allP();
    const tot = day.blocks.reduce((n,b)=>n + b.sets.length, 0), dn = Object.keys(vals).length;
    nc.append(el("div","lab", DAYN[today] + " · séance du jour"));
    if (!S.placed && Object.keys(MS).filter(id=>st(id).done).length < 6) { const pb = el("button","place");
      pb.append(el("b",null,"Commence par ton bilan"), el("span",null,"Quelques questions rapides sur ce que tu sais déjà faire : l'app te propose ensuite une séance à ta mesure."));
      pb.onclick = () => startPlacement(); nc.append(pb); $("sessToggle").hidden = $("sess").hidden = true;   // avant le bilan : rien d'autre à l'écran
      const sk = el("button","golink","Passer : je pars de zéro"); sk.onclick = () => { S.placed = true; save(); render(); }; nc.append(sk);
      break today; }
    // quel programme aujourd'hui : une pastille par programme, un seul toucher pour changer
    const chips = el("div","srcs"); Object.keys(all).sort((a,b)=>(progLock(a) ? 1 : 0) - (progLock(b) ? 1 : 0)).forEach(id=>{ const lock = progLock(id), c = el("button","src" + (P.id === id ? " on" : "") + (lock ? " lk" : ""));
      if (lock) c.append(icon("lock","lki")); c.append(all[id].name); c.setAttribute("aria-pressed", P.id === id); if (lock) c.setAttribute("aria-label", all[id].name + ", verrouillé");
      c.onclick = () => { if (lock) { toast("« " + all[id].name + " » s'ouvre après : " + lock); return; } pg().cur = id; save(); render(); }; chips.append(c); }); nc.append(chips);
    // météo du corps : comment tu te sens aujourd'hui ? (règle la séance d'équilibre)
    if (P.builtin && dn && dn < tot) { const md = MOODS.find(x => x[0] === moodToday()); delete S.moodEdit; nc.append(el("div","moodset", (S.mins || 30) + " min" + (md ? " · " + md[1] : "") + " · séance en cours")); }   /* séance commencée : on ne change plus la durée ni l'humeur */
    else if (P.builtin && moodToday() && !S.moodEdit) { const mk = moodToday(), md = MOODS.find(x => x[0] === mk), mb = el("button","moodset"); mb.textContent = (S.mins || 30) + " min · " + md[1] + " · changer"; mb.onclick = () => { S.moodEdit = 1; render(); }; nc.append(mb); }
    else if (P.builtin) { const mw = el("div","mood"), mk = moodToday(); mw.append(el("span",null,"Aujourd'hui, je suis…"));
      MOODS.forEach(([k, lab, ico]) => { const b = el("button", mk === k ? "on" : ""); b.append(el("b",null,lab)); b.setAttribute("aria-pressed", mk === k); b.onclick = () => { delete S.moodEdit; setMood(k); }; mw.append(b); });
      nc.append(mw);
      if (mk === "fatigue") { const z = el("button","zenhint"); z.append(el("b",null,"Aujourd'hui : récup active, 8 min"), el("span",null,"Mobilité, ça compte aussi. Ou la séance allégée ci-dessous.")); z.onclick = () => openZen("recup"); nc.append(z); } }
    if (P.builtin && !(dn && dn < tot) && (!moodToday() || S.moodEdit)) { const tm = el("div","mins"); 
      [15,30,45,60].forEach(v=>{ const b = el("button", (S.mins || 30) === v ? "on" : "", v + " min"); b.setAttribute("aria-label", v + " minutes"); b.setAttribute("aria-pressed", (S.mins || 30) === v); b.onclick = () => { S.mins = v; if (S.bday && !dn) S.bday = null; save(); render(); }; tm.append(b); }); nc.append(tm); }
    if (P.builtin && needRest()) nc.append(el("div","painnote","Jour de récup : trois jours d'entraînement de suite. Mobilité et poignets aujourd'hui, la force revient demain."));
    if (P.builtin && deloadWeek()) nc.append(el("div","painnote","Semaine légère : moins de séries et pas de tentative à fond. Les tendons se renforcent pendant ce temps."));
    { const PS = painState(); if (PS.phase) nc.append(el("div","painnote", PS.phase === 1 ? (PS.zone === "poignet" ? "Poignets au repos encore " + PS.days + " j : pas d'appui sur les mains." : PS.zone === "epaule" || PS.zone === "coude" ? "Encore " + PS.days + " j sans un bras, planche ni montées." : "Séance en douceur encore " + PS.days + " j.") : PS.phase === 2 ? "Reprise : 60 % de la charge, sans tentative à fond." : "Reprise : 80 % de la charge.")); }
    { const rep3 = (S.fb || []).filter(x=>x.k === "pain" && Date.now() - x.t < 10 * 864e5).length; if (rep3 >= 3) nc.append(el("div","painnote","Trois douleurs en dix jours : fais une vraie pause et demande l'avis d'un professionnel de santé avant de reprendre.")); }
    // Maîtrise : on choisit sa séance de postures tenues (poignets, compression, ligne, contrôle, récup)
    if (P.zen) { const zw = el("div","srcs zchips"); ZEN.forEach((z, i) => { const b = el("button","src" + (pp().step === i ? " on" : ""), z.name); b.setAttribute("aria-pressed", pp().step === i); b.onclick = () => { pp().step = i; save(); render(); }; zw.append(b); });
      const z = ZEN[pp().step] || ZEN[0]; nc.append(zw, el("div","zt2", z.when + " · " + zenTxt(z)));
      if (forceDays().has((() => { const x = new Date(); x.setDate(x.getDate() - 1); return dayKey(x); })()) && ["poignets","controle"].includes((ZEN[pp().step] || {}).id)) nc.append(el("p","zt2","Hier : force. Ligne ou Compression ménagent mieux les poignets aujourd'hui."));
    }

    if (!tot){ nc.append(el("h2",null,"Repos aujourd'hui"), el("p",null, P.builtin ? "Aucune figure accessible pour l'instant." : "Rien de prévu ce jour-là dans « " + P.name + " ». Choisis un autre programme ci-dessus, ou profite du repos.")); }
    else {
      let secs = 0; const list = el("div","tlist");
      day.blocks.forEach((b,bi)=>{ const r = el("div","trow"), art = el("span","art"), g = el("div","grow"), done = b.sets.filter((_,si)=>vals[bi + "-" + si] != null).length;
        if (b.ms && MS[b.ms]) { const sp = el("span","sp"); sp.dataset.pose = poseId(b.ms); sp.dataset.anim = b.ms; sp.dataset.lk = ""; sprPaint(sp, 64); art.append(sp); } else art.append(el("span","num", String(bi + 1)));
        const s0 = b.sets[0], work = b.sets.filter(s=>!s.max), mx = b.sets.filter(s=>s.max);
        const one = s => s.goal ? (b.kind === "hold" ? s.goal + " s" : "× " + s.goal) : fixed(s) ? fixTxt(b, s, day.scale) : s.pct ? s.pct + " %" : "max";
        const u = s => b.kind === "hold" ? one(s) : one(s).replace("× ", "") + " rép.", ess = n => n + (n > 1 ? " essais" : " essai");
        const dose = mx.length && !work.length ? ess(mx.length) + " calmes" : mx.length ? work.length + " × " + u(work[0]) + " + " + ess(mx.length) + " à " + u(mx[0]) : b.sets.length > 1 ? b.sets.length + " × " + (fixed(s0) ? fixTxt(b, s0, day.scale) : u(s0)) : fixed(s0) ? fixTxt(b, s0, day.scale) : u(s0);
        g.append(el("div","tn2", b.name), el("div","td", dose + (b.ms && !b.confirm && canValToday(b.ms) ? " · validation possible aujourd'hui" : "")));
        const dots = el("div","dots"); if (dn) b.sets.forEach((s,si)=>{ const v = vals[bi + "-" + si]; dots.append(el("i", (v != null ? (b.kind === "hold" && s.goal && v < s.goal * 0.95 ? "half" : "ok") : "") + (s.max ? " t" : ""))); }); g.append(dots);
        b.sets.forEach(s=>{ secs += (s.rest || 20) + (s.goal && b.kind === "hold" ? s.goal : s.dur ? sDur(s, day.scale) * (s.sides ? 2 : 1) : 25); });
        r.append(art, g); if (done >= b.sets.length) r.classList.add("ok"); list.append(r); });
      nc.append(list);
      // gilet lesté : s'il n'est pas là aujourd'hui, un toucher et les exercices lestés passent en version lente sans charge
      if ((S.equip || {}).kg && (noVest() || day.blocks.some(b => b.dk && DRILLS[b.dk].eq === "kg"))) { const v = el("button","vest" + (noVest() ? " off" : "")); v.setAttribute("aria-pressed", noVest());
        v.append(el("b",null, noVest() ? "Sans gilet aujourd'hui" : "Gilet lesté prévu"), el("span",null, noVest() ? "Dips et pompes en version lente. Toucher si tu l'as finalement." : "Pas de gilet sous la main ? Toucher pour la version sans charge."));
        v.onclick = () => setNoVest(!noVest()); nc.append(v); }
      const bt = el("button","btn big" + (dn >= tot ? " done" : ""), dn >= tot ? "Bravo, séance faite ! Voir mon parcours" : dn ? "Reprendre · " + dn + " / " + tot : (P.zen ? "Commencer" : "Démarrer") + " · " + Math.max(5, Math.round(estSecs(day.blocks) / 60)) + " min"); 
      bt.onclick = () => dn >= tot ? showTab("path") : startGuided(); nc.append(bt);
      if (dn >= tot && P.builtin) { const z = el("button","zenhint"); z.append(el("b",null,"Récup active · 8 min"), el("span",null,"Mobilité après l'effort : le corps construit pendant le repos.")); z.onclick = () => openZen("recup"); nc.append(z); }
      if (dn >= tot) nc.append(el("div","tmeta", daySummary()));
    }
    // la semaine en un coup d'œil : un point par jour, plein si tu t'es entraîné
    const wk = el("div","twk"), d0 = new Date(); d0.setDate(d0.getDate() - today);
    DAYL.forEach((l,i)=>{ const dd = new Date(d0); dd.setDate(d0.getDate() + i); const did = S.log.some(x=>dayKey(x.t) === dayKey(dd)); const c = el("span", (did ? "did" : "") + (i === today ? " today" : "")); c.append(el("i"), el("b",null,l)); wk.append(c); });
    nc.append(wk);
  }

  { const pt = $("pathTop"), gms = GOALS[0].ms, dn = doneIn(gms); pt.textContent = "";
    const c = el("div","ptop"), fins = el("div","fins"); ["oa_oahs","pl_full"].forEach(id=>{ const w = el("span","fin"), sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 60); w.append(sp); fins.append(w); });
    const g = el("div","grow"); g.append(el("div","pt2", dn + " / " + gms.length + " figures"));
    const bar = el("div","bar"), bi = el("i"); bi.style.width = (dn / gms.length * 100) + "%"; bar.append(bi); const nxt = gms.find(id=>!reqDone(id) && !msLocked(MS[id])) || gms.find(id=>!reqDone(id)); g.append(bar, el("div","pn2", nxt ? "Prochaine étape : " + MS[nxt].name + (MS[nxt].target ? " · " + unitTxt(MS[nxt], nextStep(MS[nxt]) || MS[nxt].target) : "") : "Un bras, full planche et stalder : tout est validé !"));
    c.append(fins, g);
    if (nextId) { const here = el("button","here"); here.setAttribute("aria-label","Aller à ma position : " + MS[nextId].name);
      here.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'; here.onclick = () => goHere(nextId); c.append(here); }
    pt.append(c);
  }
  const tree = $("tree"), keepY = window.scrollY; tree.textContent = "";
  tree.append(journey(nextId));
  if (keepY) window.scrollTo(0, keepY);

  $("countdown").value = String(S.countdown);
  renderQuest(Z, nextId);
  renderSess();
}
function logRow(l, withName){
  const m = MS[l.id] || (String(l.id).startsWith("pg:") ? {name:l.id.slice(3), type:l.k} : null); const r = el("div","log"); if (!m) { r.style.display = "none"; return r; }
  const when = new Date(l.t).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) + ", " + new Date(l.t).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  const left = el("span","grow"); if (withName) left.append(el("div",null,m.name)); left.append(el("div","mut",when + (l.pr ? " · record" : "")));
  r.append(left, el("span","v" + (l.pr ? " pr" : ""), l.v === true ? (String(l.id).startsWith("pg:") ? "Séance terminée" : "Validé") : fmt(m,l.v)));
  return r;
}

// ce que la séance du jour a apporté, en une ligne qui reste sur la carte
function daySummary(){ const d = dayKey(Date.now()), H = S.hit || {}, tl = S.log.filter(l => dayKey(l.t) === d);
  const val = Object.keys(H).find(id => MS[id] && st(id).done && (H[id].days || []).slice(-1)[0] === d);
  if (val) return "« " + MS[val].name + " » validée · " + doneIn(GOALS[0].ms) + "/" + GOALS[0].ms.length;
  const part = Object.keys(H).find(id => MS[id] && !st(id).done && (H[id].days || []).slice(-1)[0] === d);
  if (part) return MS[part].name + " : séance validée " + H[part].days.length + "/" + valRule(part).n;
  const pr = tl.filter(l => l.pr).pop(); if (pr) return "Record : " + num(pr.v) + (pr.k === "hold" ? " s" : " rép.") + " · " + pr.id.replace(/^pg:/, "");
  const hold = Math.round(tl.filter(l => l.k === "hold" && typeof l.v === "number").reduce((n, l) => n + l.v, 0));
  return tl.filter(l => typeof l.v === "number").length + " séries" + (hold ? " · " + (hold >= 60 ? Math.floor(hold / 60) + " min " + (hold % 60) + " s" : hold + " s") + " en appui" : "") + " · séance n° " + (cnt().sess || 1); }
// la figure peut-elle être validée dès aujourd'hui ? (dernière séance manquante, écart et étendue respectés)
function canValToday(id){ const h = (S.hit || {})[id], V = valRule(id), d = dayKey(Date.now()); if (!h || !h.days || h.days.length !== V.n - 1 || st(id).done || h.days.includes(d)) return false;
  return dayDiff(d, h.days[h.days.length - 1]) >= V.gap && dayDiff(d, h.days[0]) >= V.span; }
// ---------- Fiche jalon + chrono ----------
let cur = null, timer = null, phase = "idle", t0 = 0, beeped = false, ac = null, wake = null;
function beep(freq, ms){
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended" || ac.state === "interrupted") ac.resume().catch(()=>{});
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.25, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + ms/1000);
    o.start(); o.stop(ac.currentTime + ms/1000);
  } catch(e){}
  if (navigator.vibrate) navigator.vibrate(ms);
}
function openMs(id){
  cur = id; const m = MS[id];
  $("dT").textContent = m.name + (m.target ? " · " + goalTxt(m) : "");
  $("dS").textContent = [SEC[m.sec].name, m.sub].filter(Boolean).join(" · ");
  $("dEn").textContent = m.en && m.en !== m.name ? "Nom d'origine : " + m.en : "";
  $("dDesc").textContent = m.desc || "";
  const fg = $("dFig"); fg.textContent = "";
  { const pz = poseId(id);
    if (SPR[id]) { const sp = el("span","sp demo"); sp.dataset.pose = pz; sp.dataset.anim = id; sp.dataset.lk = ""; sprPaint(sp, 132); fg.append(sp); }
    else if (pz !== "stand") { const im = el("img","demo"); im.alt = ""; im.width = im.height = 132; im.src = "anim/" + (animOn() && STILLS.has(pz) ? "demo_" : "still_") + stillOf(pz) + ".webp"; im.onerror = () => { im.remove(); const f2 = figure(id); if (f2) fg.append(f2); }; fg.append(im); }
    else { const f2 = figure(id); if (f2) fg.append(f2); } }
  const dd = $("dMore"); dd.textContent = ""; const D = DETAILS[id];
  if (D){
    const part = (title, items, ordered) => { if (!items || !items.length) return;
      dd.append(el("h3",null,title)); const list = el(ordered ? "ol" : "ul"); items.forEach(t=>list.append(el("li",null,t))); dd.append(list); };
    part("Comment faire", D.how, true);
    part("Repères", D.cue);
    part("Erreur fréquente", D.err ? [D.err] : null);
    part("Validé quand", D.ok ? [D.ok] : null);
  }
  const dv = $("dVid"); dv.textContent = "";
  (m.img||[]).forEach(src=>{ const im = el("img","ph"); im.src = src; im.alt = "Exemple : " + m.name; im.loading = "lazy"; dv.append(im); });
  (m.yt||[]).forEach(([vid,title])=>{
    const a = el("a","yt"); a.href = "https://www.youtube.com/watch?v=" + vid; a.target = "_blank"; a.rel = "noopener";
    const im = el("img"); im.src = "https://i.ytimg.com/vi/" + vid + "/mqdefault.jpg"; im.alt = ""; im.loading = "lazy"; im.onerror = () => im.remove();
    const tx = el("span","grow"); tx.append(el("div","t",title), el("div","mut","Voir sur YouTube"));
    a.append(im, tx); dv.append(a);
  });
  $("dHold").style.display = m.type === "hold" ? "" : "none";
  $("dReps").style.display = m.type === "reps" ? "" : "none";
  $("reps").value = "";
  resetClock(); fillDlg(); $("dlg").showModal(); $("dlg").scrollTop = 0;
}
function fillDlg(){
  const m = MS[cur], x = st(cur), lk = !x.done && msLocked(m);
  $("toggle").textContent = x.done ? "Retirer la validation" : "Réussi aujourd'hui"; $("toggle").hidden = !x.done && m.type !== "check";   // tenues et répétitions : seule la mesure valide
  $("toggle").className = "btn" + (!x.done && m.type === "check" ? "" : " line");
  const parts = [];
  if (m.type !== "check") parts.push(x.best ? "Record : " + fmt(m,x.best) : "Aucun essai enregistré");
  { const L = lvls(m), k = lvlOf(m), nx = nextStep(m); if (L.length > 1) parts.push("Niveau " + k + " sur " + L.length + (nx ? " · niveau suivant : " + unitTxt(m, nx) : "")); }
  if (x.done) parts.push("Jalon validé");
  if (lk) parts.push("Recommandé après : " + missing(m));
  $("dBest").textContent = parts.join(" · ");
  { const dp = $("dPlan"), L = lvls(m), k = lvlOf(m), pl = planFor(m); dp.textContent = "";
    if (L.length > 1){ dp.append(el("h3",null,"Les niveaux")); const ld = el("div","ladder");
      L.forEach((v,i)=>{ const r = el("div","lv" + (i < k ? " ok" : i === k ? " now" : "")); r.append(el("span","b", i < k ? "" : String(i+1)), el("span","grow","Niveau " + (i+1) + (i === L.length - 1 ? " · jalon validé" : "")), el("span","v", unitTxt(m, v))); if (i < k) r.firstChild.innerHTML = ICON.check; ld.append(r); });
      dp.append(ld); }
    dp.append(el("h3",null,pl.head)); const ul = el("ul","plan"); pl.lines.forEach(t=>ul.append(el("li",null,t))); dp.append(ul);
    if (pl.prog) { const pb = el("button","btn line","Programme associé : " + PS[pl.prog[0]].name + (PS[pl.prog[0]].steps[pl.prog[1]] && pl.prog[0] === "planche-domination" ? " · " + PS[pl.prog[0]].steps[pl.prog[1]].name : "")); pb.onclick = () => { $("dlg").close(); openProg(pl.prog[0], pl.prog[0] === "planche-domination" ? pl.prog[1] : null); }; dp.append(pb); }
  }
  const dl = $("dLog"); dl.textContent = "";
  S.log.filter(l=>l.id===cur).slice(-5).reverse().forEach(l=>dl.append(logRow(l,false)));
}
function record(v){
  const m = MS[cur], x = st(cur), lv0 = lvlOf(m); let pr = false;
  if (v === true) { if (msLocked(m)) { toast("Valide d'abord : " + missing(m) + "."); return; } chkHit(cur); }
  else { if (v > x.best) { pr = x.best > 0; x.best = v; } if (v >= m.target && !x.done && SIDED.has(cur)) toast("Cible tenue. Cette figure se valide des deux côtés : fais-la dans la séance du jour, côtés alternés."); else if (v >= m.target && !x.done) { const msg = hitTarget(cur); toast(msg || "« " + m.name + " » validée !"); } if (m.type === "hold") cnt().hold += v; }
  S.log.push({t:Date.now(), id:cur, v, pr}); if (S.log.length > 2000) S.log = S.log.slice(-2000);
  save(); fillDlg(); render();
  const lv1 = lvlOf(m); if (lv1 > lv0 && lv1 < lvls(m).length) toast(m.name + " · niveau " + lv1 + " atteint");
  const nd = document.querySelector('.jn[data-id="' + cur + '"]'); if (nd && lv1 > lv0) nd.classList.add("pop");
}
function resetClock(){
  clearInterval(timer); phase = "idle"; beeped = false;
  $("clock").textContent = "0,0"; $("clock").className = "clock";
  $("go").textContent = "Démarrer"; $("clockHint").textContent = cur && MS[cur].target ? "Objectif : " + goalTxt(MS[cur]) : "";
  if (wake) { wake.release().catch(()=>{}); wake = null; }
}
$("go").onclick = async () => {
  const m = MS[cur], ck = $("clock");
  if (phase === "idle"){
    keepAwake(w => wake = w);
    const left = S.countdown; let lastShown = -1;
    const startRun = () => { phase = "run"; t0 = performance.now(); ck.className = "clock"; $("go").textContent = "Arrêter"; $("clockHint").textContent = "Appuie sur Arrêter en redescendant"; beep(880, 350); };
    if (left > 0) { phase = "count"; ck.className = "clock count"; $("go").textContent = "Annuler"; $("clockHint").textContent = "Mets-toi en place"; t0 = performance.now(); } else startRun();
    timer = setInterval(()=>{
      const e = (performance.now() - t0) / 1000;
      if (phase === "count"){
        const r = Math.ceil(left - e);
        if (r <= 0) startRun();
        else { ck.textContent = String(r); if (r !== lastShown) { lastShown = r; if (r <= 3) beep(440, 120); } }
      } else if (phase === "run"){
        ck.textContent = e.toFixed(1).replace(".", ",");
        if (!beeped && e >= m.target) { beeped = true; ck.className = "clock hit"; beep(1320, 600); }
      }
    }, 50);
  } else if (phase === "count"){ resetClock(); }
  else if (phase === "run"){
    const v = Math.floor((performance.now() - t0) / 100) / 10;
    clearInterval(timer); phase = "idle"; $("go").textContent = "Nouvel essai";
    if (wake) { wake.release().catch(()=>{}); wake = null; }
    $("clockHint").textContent = v >= m.target ? "Objectif atteint" : "Il manque " + num(m.target - v) + " s";
    if (v >= 0.5) record(v);
  }
};
$("saveReps").onclick = () => { const v = parseInt($("reps").value, 10); if (!(v > 0)) { toast("Entre un nombre de répétitions."); return; } if (!saneReps(v, MS[cur] && MS[cur].target)) return; record(v); $("reps").value = ""; };
$("toggle").onclick = () => { const x = st(cur); if (x.done) { if (!confirm("Retirer la validation de « " + MS[cur].name + " » ?")) return; x.done = false; if (S.hit && S.hit[cur]) S.hit[cur].days = (S.hit[cur].days || []).slice(0, -1); if (S.chk) delete S.chk[cur]; save(); fillDlg(); render(); } else record(true); };
$("dlg").addEventListener("close", resetClock);
