// Personnage 3D et animations des figures (bandes d'images calculées puis gardées sur l'appareil).
"use strict";
// ---------- Personnage 3D (chargé à la demande ; la silhouette 2D reste en secours) ----------
const POSE3D = {oa_tuckflag:"hs_flag", oa_shrug:"oahs", oa_sidehold:"hs_straddle", oa_flagfloor:"hs_flag", oa_finger3:"oahs", oa_finger2:"oahs", oa_finger1:"oahs", oa_oahsw:"oahs", pl_lean2:"pl_lean", pl_tuckP:"pl_tuck", pl_tuckPu:"pl_tuck", pl_tuckO:"pl_adv", pl_strBand:"pl_straddle", pl_strBandL:"pl_straddle", pl_strNar:"pl_straddle", pl_half:"pl_full", pl_fullBand:"pl_full", pl_fullNeg:"pl_full", pr_pikeLift:"stand", pr_stradLift:"stand", pr_wallNeg:"hs_spress", pr_elevLow:"hs_spress", pr_negP:"pk1", pr_vsit:"hs_stal0", pr_halfSt:"hs_stal1", pr_tuckUp:"hs_tuck", pr_stalPart:"hs_stal1", pr_lsitNeg:"lsit1", fd_plank:"pl_lean", fd_roue:"hs_straddle", fd_push:"pl_lean", fd_c2w:"hs", fd_dips:"sup_up", st_bail30:"hs", st_split:"hs_split", st_bailc2w:"hs", b1_free5:"hs_straddle", b2_str15:"hs",
  in_holds:"hs_straddle", in_changes:"hs_straddle", in_tuck:"hs_tuck", in_str40:"hs", in_str60:"hs", in_7s:"hs_seven1", in_7d:"hs_seven",
  in_toes:"hs", in_toes7:"hs_seven", oa_flaghoriz:"hs_flag", oa_shift:"hs_straddle", oa_finger:"oahs", oa_strarm:"oahs", oa_oahs:"oahs", oa_strad30:"hs_straddle", oa_wall:"oahs", oa_lift:"oahs", oa_oahs10:"oahs", pl_ppp:"pl_lean", pl_1leg:"pl_adv",
  pr_straddle:"hs_straddle", pr_pike:"pk1", pr_stalder:"hs_straddle", pr_negS:"hs_spress", pr_elev:"hs_spress", pr_stradL:"hs_stal0", pr_lsit:"lsit0", pr_lsitHs:"lsit1", in_mexican:"hs", in_hspu:"hs", oa_flagfloor:"hs_flag",
  oa_shTuck:"hs_oatuck", oa_shStrad:"hs_oastrad", oa_shFlag:"hs_oaflag", pr_vsitC:"vsitC", pr_mannaP:"mannaP", pr_manna:"manna", pl_strHs:"pl_s45", pl_hsDown:"hs_pl45", pl_press:"hs_pl45", ul_c1:"hs_oafull", ul_c2:"pl_full", ul_c3:"manna", ul_full:"manna", oa_switch:"hs_oafull", pr_extSup:"revSup", pr_vsitH:"vsitH", pl_halfPress:"pl_halfL", ul_c12:"pl_full",
  lo_frog:"crow", lo_elbow:"lever", lo_croc:"lever", lo_qdr:"lever"};
let A3 = null, a3want = null, a3tried = false, lastZ = null;
// Animations des nœuds : le personnage 3D, avec la tenue du vestiaire, joue chaque figure (debout, montée, maintien, retour).
// Chaque figure est rendue image par image dans une bande d'images, puis animée en boucle. Tant qu'elle n'est pas prête, on montre une image fixe.
const SPR = {}, SPN = 96, SPF = 8; let sprMod = null, sprA = null, sprKey = "", sprJob = 0, sprT = 0;
const animOn = () => true;
// exercices d'accompagnement qui ont leur animation (dr_<clé>)
const DR_ANIM = {hollow:"dr_hollow", tirage:"dr_tirage", rotext:"dr_rotext", extpoig:"dr_extpoig", c2w:"fd_c2w", lean:"pl_lean", pseudo:"pl_ppp", frog:"lo_frog", oawall:"oa_wall", oashrug:"oa_shrug", tuckflag:"oa_tuckflag", bandpl:"pl_strBand", lsitpara:"pr_lsit", dipsW:"fd_dips", pushW:"fd_push", appuiArr:"pr_extSup", stradlift:"pr_stradLift", elevpress:"pr_elev", shift:"oa_shift", pikepulse:"pr_pikeLift",
  poignets:"z_bascules", epaules:"z_chiot", omoplates:"fd_c2w", toepull:"st_split", kickup:"b2_str15", doigts:"in_str40", pike:"pr_pikeLift", pancake:"z_pancake", biceps:"dr_biceps", tuck2strad:"dr_t2s", protrac:"dr_protrac", mannaLift:"pr_mannaP", extEp:"dr_extEp", stalneg:"pr_halfSt", pikepu:"z_pikepu"};
// postures (séances « Postures ») : l'animation se retrouve par le nom de la posture
const ZN_ANIM = {"Bascules à quatre pattes":"z_bascules", "Appui sur le bout des doigts":"z_fing", "Planche inclinée":"pl_lean", "Planche inclinée sur les doigts":"pl_lean", "Appui sur le dos des mains":"z_dos", "Pompes de poignets":"z_ppoig",
  "Levées de talons en pike":"pr_pikeLift", "L-sit groupé":"z_lgroup", "L-sit une jambe tendue":"z_lone", "L-sit":"pr_lsit", "Cuillère creuse":"dr_hollow", "Écart facial actif":"z_pancake", "Équerre écartée":"pr_stradL", "Posture du chiot":"z_chiot",
  "Chien tête en bas actif":"z_dog", "Épaules au mur":"z_murEp", "Pompes d'omoplates en pike":"z_omoP", "Gainage creux":"z_creux", "Appui tendu en pike, pieds sur une caisse":"z_dog", "Équilibre dos au mur":"z_dosMur", "Corbeau":"lo_frog", "Corbeau bras tendus":"z_crowT",
  "Planche latérale":"z_side", "Chaturanga tenu":"z_chat", "Pseudo-planche":"pl_lean", "Planche vers chien, au ralenti":"z_transi", "Guerrier III":"z_war", "Étirement des avant-bras":"z_avbras", "Enfant bras longs":"z_enfant", "Pigeon":"z_pigeon", "Chien tête en bas":"z_dogP", "Torsion couchée":"z_twist"};
// exercices lestés : le personnage porte le gilet, sauf en version sans charge
const blockAnim = b => b.dk ? ((b.dk === "dipsW" || b.dk === "pushW") && b.name === DRILLS[b.dk].name ? "dr_" + b.dk : DR_ANIM[b.dk]) : ZN_ANIM[b.name];
const drSp = (b, size) => { const an = blockAnim(b), sp = el("span","sp"); sp.dataset.pose = poseId(an) || "stand"; sp.dataset.anim = an; sp.dataset.lk = ""; sprPaint(sp, size); return sp; };
// images fixes pré-calculées (anim/still_*.webp) : pour une posture qui n'en a pas, la plus proche
const STILLS = new Set(["crow","hs","hs_flag","hs_seven","hs_seven1","hs_split","hs_straddle","hs_tuck","lever","oahs","pl_adv","pl_frog","pl_full","pl_lean","pl_pike","pl_straddle","pl_tuck","stand"]);
const STILL_NEAR = {hs_wsplit:"hs_split", pk1:"hs_seven", pk2:"hs_seven", sp2:"hs_straddle", sup_up:"stand", hs_spress:"hs_straddle", hs_stal0:"crow", lsit0:"crow", lsit1:"crow", pl_1legP:"pl_adv", pl_pdown:"pl_lean", hs_tuck90:"hs_tuck", hs_finger:"oahs", hs_oastr:"oahs", hs_oafull:"oahs", hs_oatuck:"oahs", hs_oastrad:"oahs", hs_oaflag:"oahs", vsitC:"crow", mannaP:"crow", manna:"crow", vsitH:"crow", revSup:"stand", pl_halfL:"pl_full", hs_pl45:"pl_full", pl_s45:"pl_straddle"};
const stillOf = p => STILLS.has(p) ? p : STILL_NEAR[p] || (p.startsWith("hs") ? "hs" : p.startsWith("pl_") ? "pl_lean" : "stand");
function sprPaint(sp, size){
  const pose = sp.dataset.pose, lk = !!sp.dataset.lk, R = SPR[sp.dataset.anim]; sp.style.width = sp.style.height = size + "px"; if (size) sp.dataset.size = size;
  if (!R) { sp.style.backgroundImage = 'url("anim/still_' + stillOf(pose) + '.webp")'; sp.style.backgroundSize = "cover"; sp.style.animation = "none"; return; }
  sp.style.backgroundImage = 'url("' + R.url + '")'; sp.style.backgroundSize = (R.n * size) + "px " + size + "px";
  // still : on montre la posture tenue de la figure, sans boucle (nœuds du parcours)
  if (!animOn() || sp.dataset.still) { sp.style.animation = "none"; sp.style.backgroundPosition = (-R.hold * size) + "px 0"; return; }
  sp.style.backgroundPosition = "0 0"; sp.style.setProperty("--end", (-R.n * size) + "px");
  sp.style.animation = "spr " + (R.n / SPF).toFixed(2) + "s steps(" + R.n + ") infinite"; sp.style.animationDelay = (-Math.random() * R.n / SPF).toFixed(2) + "s";
  if (sprIO && !sp._io) { sp._io = 1; sprIO.observe(sp); }
}
// seuls les personnages visibles à l'écran sont animés : le reste est en pause, pour ménager le téléphone
const sprIO = window.IntersectionObserver ? new IntersectionObserver(es => es.forEach(e => { const sp = e.target; if (e.isIntersecting) { if (sp._off) { sp._off = 0; sprPaint(sp, +sp.dataset.size || 64); } sp.style.animationPlayState = "running"; }
  else { sp.style.animationPlayState = "paused"; if (SPR[sp.dataset.anim]) { sp._off = 1; sp.style.animation = "none"; sp.style.backgroundImage = "none"; } } }), {rootMargin:"120px"}) : null;
const sprRepaint = id => document.querySelectorAll(".sp" + (id ? '[data-anim="' + id + '"]' : "")).forEach(sp=>sprPaint(sp, +sp.dataset.size || 64));
// Les animations calculées sont conservées sur l'appareil (stockage du navigateur) : elles ne sont refaites que si la tenue change.
const SPV = "37-" + SPN + "-" + SPF, SPC = "hs-sprites", SPM = "hs-spr-meta";
const sprMeta = () => { try { return JSON.parse(localStorage.getItem(SPM)) || {}; } catch(e){ return {}; } };
const idle = () => new Promise(r => window.requestIdleCallback ? requestIdleCallback(() => r(), {timeout:500}) : setTimeout(r, 60));
async function sprRestore(key){
  const meta = sprMeta(); if (meta.key !== key || meta.v !== SPV || !window.caches) return 0;
  let n = 0; try { const c = await caches.open(SPC);
    for (const id of Object.keys(meta.items || {})) { if (SPR[id]) continue; const r = await c.match("spr/" + id); if (!r) continue; const bl = await r.blob(); SPR[id] = {url:URL.createObjectURL(bl), n:meta.items[id].n, hold:meta.items[id].hold}; n++; }
  } catch(e){} return n;
}
async function sprStore(key, id, blob, n, hold){
  if (!window.caches) return; try { const c = await caches.open(SPC); await c.put("spr/" + id, new Response(blob, {headers:{"Content-Type":"image/webp"}}));
    const meta = sprMeta(); if (meta.key !== key || meta.v !== SPV) { meta.key = key; meta.v = SPV; meta.items = {}; } meta.items[id] = {n, hold}; localStorage.setItem(SPM, JSON.stringify(meta)); } catch(e){}
}
async function buildSprites(force){
  if (!sprMod) return; const F = fit(), key = JSON.stringify([F.skin,F.hair,F.hairc,F.top,F.bottom,F.feet,F.wrists,F.head,F.extra,F.face]); if (key === sprKey && !force) return;
  const changed = sprKey && sprKey !== key; sprKey = key; const job = ++sprJob;
  if (changed && sprW) { sprW.terminate(); sprW = null; sprWok = null; }   // un calcul en cours avec l'ancienne tenue est abandonné
  if (changed) Object.keys(SPR).forEach(id=>{ const u = SPR[id].url; delete SPR[id]; setTimeout(()=>URL.revokeObjectURL(u), 2000); });
  if (await sprRestore(key)) sprRepaint();
  if (job !== sprJob) return;
  // ce qui manque est calculé par petits morceaux, pendant les temps morts, en commençant par ce qui est à l'écran
  const vh = window.innerHeight, dist = n => { const r = n.getBoundingClientRect(); return Math.abs(r.top + r.height/2 - vh/2); };
  const nodes = [...document.querySelectorAll(".sp[data-anim]")].sort((a,b)=>dist(a) - dist(b)).map(n=>n.dataset.anim);
  const ids = [...new Set(nodes.concat(Object.keys(MS), Object.values(DR_ANIM), Object.values(ZN_ANIM), ["dr_dipsW","dr_pushW"]))].filter(id=>!SPR[id] && sprMod.SCRIPTS[id]); if (!ids.length) return;
  // de préférence dans un Web Worker (hors de la page) ; sinon par petits morceaux dans la page
  if (await sprViaWorker(ids, F, key, job)) return;
  if (job !== sprJob) return;
  let host = $("sprHost"); if (!host) { host = el("div"); host.id = "sprHost"; host.style.cssText = "position:fixed;left:-9999px;top:0;width:" + SPN + "px;height:" + SPN + "px;pointer-events:none"; host.setAttribute("aria-hidden","true"); document.body.append(host); }
  try { sprA = sprA || sprMod.mount(host, {bare:true, manual:true, yaw:-1.15, loopT:3}); } catch(e){ return; }
  const A = sprA, dt = 1 / SPF, MAXF = 144; await idle();
  for (const id of ids){
    if (job !== sprJob) return; const sc = sprMod.SCRIPTS[id];
    while (document.hidden || sprBusy()) { await new Promise(r=>setTimeout(r, 400)); if (job !== sprJob) return; }
    const sheet = document.createElement("canvas"); sheet.width = MAXF * SPN; sheet.height = SPN; const cx = sheet.getContext("2d"); let n = 0, hold = -1, g = 0;
    const stillAt = sc.still || sc.s[sc.s.length - 1][0];
    const snap = () => { if (n < MAXF) { A.step(dt); if (hold < 0 && A.holding() && A.at() === stillAt) hold = n; cx.drawImage(A.canvas, n * SPN, 0, SPN, SPN); n++; } };
    A.vest(sc.vest); A.wall(sc.wall || 0); A.view(sc.yaw != null ? sc.yaw : -1.15); A.jump("stand"); A.set({pose:"stand", fit:F, level:6}); snap(); snap();
    A.play(sc.s, !sc.cut);
    do { snap(); g++; if (g % 4 === 0) { await idle(); if (job !== sprJob) return; } } while (A.moving() && g < MAXF);
    if (!sc.cut) snap(); if (hold < 0) hold = Math.floor(n / 2);
    const out = document.createElement("canvas"); out.width = n * SPN; out.height = SPN; out.getContext("2d").drawImage(sheet, 0, 0);
    const blob = await new Promise(r => out.toBlob(r, "image/webp", 0.84)); if (job !== sprJob || !blob) return;
    SPR[id] = {url:URL.createObjectURL(blob), n, hold}; sprRepaint(id); sprStore(key, id, blob, n, hold); await idle();
  }
}
let sprW = null, sprWok = null;
function sprWorker(){
  if (sprWok === false) return Promise.resolve(null); if (sprW) return sprWok;
  if (!window.Worker || !window.OffscreenCanvas) { sprWok = false; return Promise.resolve(null); }
  sprWok = new Promise(res => { try { sprW = new Worker("spr-worker.js", {type:"module"}); const t = setTimeout(()=>res(null), 8000);
    sprW.onmessage = e => { if (e.data && e.data.ready) { clearTimeout(t); res(sprW); } }; sprW.onerror = () => { clearTimeout(t); res(null); }; } catch(e){ res(null); } })
    .then(w => { if (!w) { sprWok = false; if (sprW) sprW.terminate(); sprW = null; } return w; });
  return sprWok;
}
async function sprViaWorker(ids, F, key, job){
  const w = await sprWorker(); if (!w) return false;
  const cs = getComputedStyle(document.documentElement), colors = {}; ["--acc","--line","--txt","--mut"].forEach(k=>colors[k] = cs.getPropertyValue(k).trim());
  for (const id of ids){
    if (job !== sprJob) return true;
    const r = await new Promise(res => { const to = setTimeout(() => res({error:"timeout"}), 30000);
      w.onmessage = e => { if (e.data && e.data.id === id) { clearTimeout(to); res(e.data); } }; w.postMessage({id, fit:F, colors, SPN, SPF, MAXF:144}); });
    if (job !== sprJob) return true;
    if (r.error || !r.blob) { if (Object.keys(SPR).length === 0) { sprWok = false; w.terminate(); sprW = null; return false; } continue; }
    SPR[id] = {url:URL.createObjectURL(r.blob), n:r.n, hold:r.hold}; sprRepaint(id); sprStore(key, id, r.blob, r.n, r.hold);
  }
  return true;
}
// pendant qu'on fait défiler ou qu'on touche l'écran, le calcul des animations attend
let sprTouch = 0; ["scroll","touchstart","touchmove","pointerdown"].forEach(ev=>window.addEventListener(ev, () => { sprTouch = Date.now(); }, {passive:true}));
const sprBusy = () => Date.now() - sprTouch < 700 || !!document.querySelector("dialog[open]");
