// Navigation, réglages, code d'accès, conseil du jour, app installable. Seul fichier qui lance l'app.
"use strict";
// ---------- Navigation + réglages ----------
function goHere(id){ const m = MS[id]; if (!m) return;
  requestAnimationFrame(()=>{ const nd = document.querySelector('.jn[data-id="' + id + '"]'); if (nd) nd.scrollIntoView({behavior:noMotion ? "auto" : "smooth", block:"center"}); }); }
function showTab(v){ document.querySelectorAll("nav.tabs button").forEach(x=>x.classList.toggle("on", x.dataset.v === v)); document.querySelectorAll(".view").forEach(s=>s.classList.toggle("on", s.id === "v-" + v)); }
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{ const was = b.classList.contains("on"); showTab(b.dataset.v); window.scrollTo(0,0);
  // en arrivant sur le parcours, on t'amène à ta position
  if (b.dataset.v === "path" && !was) { const cur = document.querySelector(".jn.cur"); if (cur) setTimeout(()=>goHere(cur.dataset.id), 350); } });
document.querySelectorAll(".jump button").forEach(b=>b.onclick=()=>{ const t = document.getElementById(b.dataset.to); if (b.dataset.to === "sect-sess" && !S.sessOpen) { S.sessOpen = true; save(); renderSess(); } if (t) t.scrollIntoView({behavior:noMotion ? "auto" : "smooth", block:"start"}); });
$("countdown").onchange = e => { S.countdown = +e.target.value; save(); };
$("animOn").onchange = e => { S.anim = e.target.checked; save(); sprRepaint(); };
// matériel : élastiques, parallettes, lest ; la séance du jour se recompose si elle n'est pas commencée
{ const E = () => S.equip || (S.equip = {}), redo = () => { if (S.bday && !Object.keys(wkGet(todayIdx())).length) S.bday = null; save(); render(); };
  $("eqBand").checked = !!E().band; $("eqPara").checked = !!E().para; $("eqKg").value = String(E().kg || 0);
  $("eqBand").onchange = e => { E().band = e.target.checked; redo(); }; $("eqPara").onchange = e => { E().para = e.target.checked; redo(); };
  $("eqKg").onchange = e => { E().kg = +e.target.value; redo(); }; }
$("exp").onclick = () => { $("io").value = JSON.stringify(S); $("io").select(); if (navigator.clipboard) navigator.clipboard.writeText($("io").value).catch(()=>{}); };
$("imp").onclick = () => {
  try { const d = JSON.parse($("io").value); if (!d || typeof d.ms !== "object" || !Array.isArray(d.log)) throw 0;
    if (confirm("Remplacer les données actuelles par cette sauvegarde ?")) { S = Object.assign(blank(), d); save(); render(); alert("Sauvegarde importée."); } }
  catch(e){ alert("Sauvegarde illisible : colle le texte exporté tel quel."); }
};
$("reset").onclick = () => { if (confirm("Effacer toute ta progression ? C'est définitif.")) { S = blank(); save(); render(); } };

// ---------- Code d'accès ----------
// Simple rideau : il écarte les curieux, mais le code de la page reste lisible par qui sait chercher.
const GATE = "fb3dec3691028de465ae4d4185b5b73c40027b8bccf38f3d3cae42419db0393c", GKEY = "hs-fastway-gate";
async function gateHash(code){
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hs-fastway:" + code));
  return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
function unlock(){ document.body.classList.remove("locked"); }
let known = null; try { known = localStorage.getItem(GKEY); } catch(e){}
if (known === GATE) unlock(); else $("gateCode").focus();
$("gateForm").onsubmit = async e => {
  e.preventDefault();
  let h = ""; try { h = await gateHash($("gateCode").value.trim().toLowerCase()); } catch(err){ $("gateMsg").textContent = "Ce navigateur ne peut pas vérifier le code."; return; }
  if (h === GATE) { try { localStorage.setItem(GKEY, h); } catch(err){} unlock(); }
  else { $("gateMsg").textContent = "Code incorrect."; $("gateCode").value = ""; }
};

render();
// ---------- Conseil du jour (affiché en haut du parcours) ----------
function curMs(){ return MS[GOALS[0].ms.find(id=>!st(id).done && !msLocked(MS[id]))]; }
function tipOfDay(){
  const m = curMs(), days = [...new Set(S.log.map(l=>dayKey(l.t)))], today = dayKey(Date.now()), trained = days.includes(today);
  const lastT = S.log.length ? S.log[S.log.length - 1].t : 0, gap = lastT ? Math.floor((Date.now() - lastT) / 864e5) : null;
  if (painRecent()) return "Tu as signalé une douleur : aujourd'hui, séance légère. Échauffe bien les poignets, et arrête si ça tire.";
  if (trained) return "Séance faite aujourd'hui, bravo. La progression se construit pendant la récupération : dors bien.";
  if (gap != null && gap >= 3) return gap + " jours sans séance : on reprend doucement aujourd'hui, une seule figure, 15 minutes.";
  if (!m) return "Tu as tout validé. Entretiens tes figures, tu es au sommet !";
  const x = st(m.id), nx = nextStep(m);
  if (m.type === "hold" && x.best > 0 && nx && nx - x.best <= 2) return "Tu es à " + num(nx - x.best) + " s de ton palier sur « " + m.name + " ». Tente-le aujourd'hui, en fin de séance.";
  if (!S.placed) return "Premier jour ? Commence par ton bilan sur l'accueil : l'app te place au bon endroit.";
  if (!S.log.length) return "Ta séance est prête sur l'accueil : touche « Démarrer », l'app s'occupe du chrono et des repos.";
  const pl = planFor(m).n; return "Ta figure du moment : « " + m.name + " »." + (pl && pl.work ? " Objectif du jour : " + pl.sets + " tenues de " + pl.work + " s." : "");
}
// ---------- Application installable (PWA) ----------
// Service worker : ouverture immédiate et hors connexion. Une mise à jour n'est appliquée que si tu l'acceptes, jamais pendant une séance.
let updating = false, reloaded = false;
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").then(reg => {
    const offer = () => { if (reg.waiting && navigator.serviceWorker.controller) $("updBar").hidden = false; };
    offer(); reg.addEventListener("updatefound", () => { const w = reg.installing; if (w) w.addEventListener("statechange", () => { if (w.state === "installed") offer(); }); });
    // un toucher suffit : on active la nouvelle version, puis on recharge ; si le navigateur ne répond pas, on recharge quand même
    $("updGo").onclick = async () => { const b = $("updGo"); b.disabled = true; b.textContent = "Mise à jour…"; updating = true;
      try { await reg.update(); } catch(e){}
      const w = reg.waiting || reg.installing; if (w) w.postMessage("skip");
      setTimeout(() => location.reload(), w ? 4000 : 300); };
    document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(()=>{}); });
  }).catch(()=>{});
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!updating || reloaded) return; reloaded = true; location.reload(); });
}
// Installation : le navigateur signale quand l'app peut être installée ; on propose alors un bouton, qu'on peut refuser une fois pour toutes.
{ let deferred = null; const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; let no = null; try { no = localStorage.getItem("hs-fastway-noinstall"); } catch(err){} if (!no && !standalone()) $("insBar").hidden = false; });
  $("insGo").onclick = async () => { if (!deferred) return; $("insBar").hidden = true; deferred.prompt(); try { await deferred.userChoice; } catch(err){} deferred = null; };
  $("insNo").onclick = () => { $("insBar").hidden = true; try { localStorage.setItem("hs-fastway-noinstall", "1"); } catch(err){} };
  window.addEventListener("appinstalled", () => { $("insBar").hidden = true; toast("App installée"); });
}
// Hors connexion : on le dit, pour qu'un programme qui ne se charge pas ne surprenne pas.
{ const net = () => { $("offBar").hidden = navigator.onLine; }; window.addEventListener("online", net); window.addEventListener("offline", net); net(); }
// Stockage durable : on demande au navigateur de ne pas effacer la progression ni les animations quand il manque de place.
if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist().catch(()=>{}); }).catch(()=>{});
// Raccourcis de l'icône : « Démarrer la séance » et « Mon parcours ».
{ const q = new URLSearchParams(location.search), go = () => { if (document.body.classList.contains("locked")) return;
    if (q.get("tab") === "path") { showTab("path"); const cur = document.querySelector(".jn.cur"); if (cur) setTimeout(()=>goHere(cur.dataset.id), 350); }
    if (q.get("go") === "session") setTimeout(()=>{ if (!$("sd").open && nextSet()) startGuided(); }, 500);
    if (q.has("tab") || q.has("go")) history.replaceState(null, "", location.pathname); };
  go(); }
