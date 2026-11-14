// Voix : la séance guidée annonce l'exercice, la cible, le repos et le temps qui reste, d'une voix posée.
"use strict";
// Synthèse vocale du téléphone (rien n'est envoyé sur internet). Choix de la voix française la plus naturelle disponible,
// d'après les recommandations du projet Readium (voix « Natural » d'Edge, Google sur Chrome et Android, Audrey/Thomas sur iPhone).
// Une voix douce : débit un peu plus lent, phrases courtes, jamais par-dessus le décompte 3-2-1 (les bips gardent le rythme).
const VOICE_PREF = [
  /Vivienne.*Natural|Denise.*Natural|Henri.*Natural|Remy.*Natural|Eloise.*Natural/i, // Edge (Windows, Mac)
  /Google français \d \(Natural\)|fr-fr-x-(frc|fra|vlf|frd|frb)/i,                // Android, ChromeOS
  /^Google français$/i,                                                               // Chrome ordinateur
  /(Audrey|Aurélie|Thomas|Amélie).*(Premium|Enhanced|Amélioré|Améliorée)/i,          // iPhone, voix téléchargées
  /^(Audrey|Aurélie|Thomas|Amélie)\b/i, /Microsoft (Julie|Hortense|Paul)/i,
];
const VOICE_BAD = /Grandma|Grandpa|Eddy|Flo\b|Reed|Rocko|Sandy|Shelley|Jacques|Compact|eSpeak/i; // voix gadget ou robotiques
const VRATE = {douce:0.9, normale:1, rapide:1.1};
const synth = window.speechSynthesis || null;
let voices = [], vUtt = null, vReady = false;
const voiceOn = () => !!synth && S.voice !== false;
function frVoices(){ return voices.filter(v => /^fr/i.test(v.lang) && !VOICE_BAD.test(v.name)); }
function loadVoices(){ if (!synth) return; voices = synth.getVoices() || []; if (window.renderVoiceSel) renderVoiceSel(); }
if (synth) { loadVoices(); synth.addEventListener && synth.addEventListener("voiceschanged", loadVoices); setTimeout(loadVoices, 1500); }
function bestVoice(){
  const fr = frVoices(); if (!fr.length) return null;
  if (S.voiceName) { const v = fr.find(x => x.name === S.voiceName); if (v) return v; }
  const ff = fr.filter(v => /fr[-_]FR/i.test(v.lang)), pool = ff.length ? ff : fr;
  for (const re of VOICE_PREF) { const v = pool.find(x => re.test(x.name)); if (v) return v; }
  return pool.find(v => v.localService) || pool[0];
}
// iPhone et Android exigent qu'un premier son parte d'un vrai toucher : on le fait au démarrage de la séance.
function voiceUnlock(){
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state !== "running") ac.resume().catch(()=>{}); } catch(e){}
  if (!voiceOn() || vReady) return; vReady = true;
  try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; u.lang = "fr-FR"; synth.speak(u); } catch(e){}
}
// say : une phrase courte ; la nouvelle remplace celle en cours (on ne laisse jamais une file de retard s'accumuler).
let vLast = "", vLastT = 0;
function say(text, keep){
  if (!voiceOn() || !text || document.hidden) return;
  if (text === vLast && Date.now() - vLastT < 2500) return; vLast = text; vLastT = Date.now(); // jamais deux fois la même phrase d'affilée
  try {
    if (!keep) synth.cancel();
    const u = new SpeechSynthesisUtterance(text), v = bestVoice();
    u.lang = v ? v.lang : "fr-FR"; if (v) u.voice = v;
    u.rate = VRATE[S.voiceRate] || VRATE.douce; u.pitch = 1; u.volume = 0.95;
    vUtt = u; u.onend = () => { if (vUtt === u) vUtt = null; }; // garder une référence : Chrome perd sinon la fin de phrase
    synth.speak(u);
  } catch(e){}
}
const hush = () => { try { if (synth) synth.cancel(); } catch(e){} };
document.addEventListener("visibilitychange", () => { if (document.hidden) hush(); });
// durées dites comme on les dit : « 45 secondes », « 1 minute 30 », « 2 minutes »
function secSay(n){ n = Math.round(n); if (n < 60) return n + (n > 1 ? " secondes" : " seconde");
  const m = Math.floor(n/60), r = n % 60; return m + (m > 1 ? " minutes" : " minute") + (r ? " " + r : ""); }
// un rappel technique par famille de figures, dit juste après le départ
function cueFor(b){
  const id = b && b.ms || "";
  if (/^oa_/.test(id)) return "Hanche au-dessus de la main. Doigts actifs.";
  if (/^pl_/.test(id)) return "Omoplates écartées. Bras verrouillés.";
  if (/^pr_|^in_hspu/.test(id)) return "Épaules devant. Monte lentement.";
  if (/^fd_plank|^fd_c2w/.test(id)) return "Corps aligné. Serre les fesses.";
  if (/^(st_|b1_|b2_|in_)/.test(id)) return ["Pousse le sol. Grandis-toi.", "Respire. Laisse le poids descendre.", "Doigts vivants, épaules longues."][Math.floor(Math.random() * 3)];
  return "";
}

// Réglages : voix active, débit, choix de la voix, bouton pour l'écouter
function renderVoiceSel(){
  const sel = $("voiceSel"); if (!sel) return; const fr = frVoices(), best = bestVoice();
  sel.textContent = ""; sel.add(new Option("Automatique" + (best && !S.voiceName ? " : " + best.name.replace(/ - French.*| Online \(Natural\)/g, "") : ""), ""));
  fr.forEach(v => sel.add(new Option(v.name.replace(/ - French.*| Online \(Natural\)/g, "") + (v.localService ? "" : " (en ligne)"), v.name)));
  sel.value = fr.some(v => v.name === S.voiceName) ? S.voiceName : "";
  $("voiceNone").hidden = fr.length > 0;
}
if (!synth) $("voiceBlock").hidden = true;
else {
  $("voiceOn").checked = S.voice !== false; renderVoiceSel();
  $("voiceOn").onchange = e => { S.voice = e.target.checked; save(); if (!S.voice) hush(); };
  $("voiceSel").onchange = e => { S.voiceName = e.target.value || null; save(); };
  $("voiceTest").onclick = () => { voiceUnlock(); say("Gainage bras tendus. Série 1 sur 3. Tiens 20 secondes."); };
}

// ---------- Commandes à la voix : top, stop, pause, recommence (seulement pendant la séance) ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let vcRec = null, vcWant = false, vcLastCmd = "", vcLastT = 0, vcSeen = "";
// \b ne connaît pas les lettres accentuées : on borne les mots à la main
const VW = w => new RegExp("(?:^|[^a-zà-ÿ])(?:" + w + ")(?![a-zà-ÿ])");
const VC = [["redo", /(recommenc|faux d[ée]part)/], ["pause", VW("pause|pose")], ["stop", VW("stop|stoppe|fini|termin[ée]e?|arr[êe]t[ée]?")], ["top", VW("top|go|reprends?|c'est parti|continue")]];
const vcOn = () => !!SR && !!S.vcmd;
function vcDo(cmd){ if (typeof sd === "undefined" || !sd || !$("sd").open) return;
  const now = Date.now(); if (cmd === vcLastCmd && now - vcLastT < 1800) return; vcLastCmd = cmd; vcLastT = now;
  const go = $("sdGo"), shown = e => e && !e.hidden && e.style.display !== "none" && !e.disabled;
  if (cmd === "pause") { if (sdTimer) setPause(true); return; }
  if (cmd === "top") { if (sd.paused) setPause(false); else if ((sd.mode === "idle" || sd.mode === "rest") && shown(go)) go.click(); return; }
  if (cmd === "stop" && sd.mode === "count") { openSet(sd.bi, sd.si); return; }   // stop pendant le décompte : on annule, on n'enregistre rien
  if (cmd === "stop") { if (sd.paused) sd.paused = false; if ((sd.mode === "run" || sd.mode === "count" || (sd.mode === "idle" && sd.fx && sd.s.dur == null)) && shown(go)) go.click(); return; }
  if (cmd === "redo") { if (shown($("sdRedo"))) $("sdRedo").click(); } }
// une phrase entendue : on ne regarde que ses derniers mots, pour réagir à l'ordre le plus récent
function vcHear(tx){ const last = String(tx || "").toLowerCase().trim().split(/\s+/).slice(-3).join(" "), hit = VC.find(([, re]) => re.test(last)); if (hit) vcDo(hit[0]); return hit ? hit[0] : null; }
function vcStart(){ if (!vcOn() || vcRec) return; vcWant = true;
  try { const r = new SR(); r.lang = "fr-FR"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onresult = e => { if (synth && synth.speaking) return;   // on n'écoute pas la voix de l'app
      for (let i = e.resultIndex; i < e.results.length; i++) { const tx = e.results[i][0].transcript || "", key = i + ":" + tx; if (!tx || key === vcSeen) continue; vcSeen = key; if (vcHear(tx)) break; } };
    r.onerror = e => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { vcWant = false; S.vcmd = false; save(); if ($("vcOn")) $("vcOn").checked = false; toast("Micro refusé : les commandes à la voix sont coupées."); } };
    r.onend = () => { vcRec = null; vcMic(); if (vcWant && $("sd").open && !document.hidden) setTimeout(vcStart, 250); };
    r.start(); vcRec = r; vcMic(); } catch(e){ vcRec = null; } }
function vcStop(){ vcWant = false; if (vcRec) { try { vcRec.abort(); } catch(e){} vcRec = null; } vcMic(); }
function vcMic(){ const m = $("sdMic"); if (!m) return; m.hidden = !vcOn(); m.textContent = vcRec ? "Micro à l'écoute : top, stop, pause, recommence" : "Micro en attente…"; }
if (!SR) { $("vcOn").disabled = true; $("vcHelp").textContent = "Ce navigateur ne sait pas écouter les commandes à la voix (elles fonctionnent dans Chrome sur Android)."; }
else { $("vcOn").checked = !!S.vcmd; $("vcOn").onchange = e => { S.vcmd = e.target.checked; save(); if (S.vcmd) toast("Au prochain chrono, autorise le micro. Dis « top », « stop », « pause » ou « recommence »."); else vcStop(); }; }
// le micro suit la fenêtre de séance : ouvert avec elle, coupé à la fermeture ou quand l'app passe en arrière-plan
{ const d = $("sd"); new MutationObserver(() => { if (d.open) vcStart(); else vcStop(); }).observe(d, {attributes:true, attributeFilter:["open"]});
  document.addEventListener("visibilitychange", () => { if (document.hidden) vcStop(); else if (d.open) vcStart(); }); }
