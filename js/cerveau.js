// ---------- La micro-intelligence : ce que l’app apprend de chacune de tes séries ----------
// Comme un coach qui note tout dans son carnet : ta capacité réelle par figure, ta forme du jour, la pente de ta progression.
// Tout reste sur le téléphone ; chaque décision garde sa raison, en une ligne.

// réserve déclarée après une série arrêtée à sa cible : rien = la cible était ton maximum du jour, un peu +6 %, beaucoup +20 % ; sans réponse, +10 %
const resK = l => l.rir === 0 ? 1 : l.rir === 1 ? 1.06 : l.rir === 2 ? 1.2 : 1.1;
// une entrée du journal → la figure concernée (en séance, les séries sont notées « pg:<nom> », « <nom>, test »…)
// les nouvelles entrées portent l’identifiant (m) ; pour les anciennes, le nom — et quand deux figures partagent un nom
// (« Équilibre droit » 40 s et 60 s), la première encore à travailler
let N2I = null;
const idOfLog = l => { if (l.m && MS[l.m]) return l.m; if (MS[l.id]) return l.id; if (!N2I) { N2I = {}; Object.values(MS).forEach(m => { (N2I[m.name] || (N2I[m.name] = [])).push(m.id); }); }
  const c = N2I[String(l.id).replace(/^pg:/, "").replace(/, (vérification|test|entretien|préparation)$/, "")]; return !c ? null : c.length === 1 ? c[0] : c.find(i => !st(i).done) || c[c.length - 1]; };
// index du journal par figure, refait une fois par enregistrement (pas une fois par figure)
const logIdx = () => { const k = (window._sv || 0) + "|" + S.log.length; if (logIdx.k !== k) { const o = {}; S.log.forEach(l => { if (typeof l.v !== "number") return; const i = idOfLog(l); if (i) (o[i] || (o[i] = [])).push(l); }); logIdx.k = k; logIdx.v = o; } return logIdx.v; };
const logsOf = (id, until) => { const L = logIdx()[id] || []; return until ? L.filter(l => l.t < until) : L; };

// capacité estimée : la meilleure valeur récente de chaque jour, un peu dévaluée avec l’âge ; une série de travail arrêtée
// à sa cible ne dit que « au moins la cible » (+10 %) ; après une coupure, la capacité redescend (environ 1,5 % par jour au-delà d’une semaine)
function capEst(id, until){ const now = until || Date.now(), L = logsOf(id, until).filter(l => now - l.t < 42 * 864e5); if (!L.length) return null;
  const byDay = {}; L.forEach(l => { const d = dayKey(l.t), capped = l.g && !l.mx && l.v >= l.g * 0.95, v = capped ? l.v * resK(l) : l.v; if (!byDay[d] || v > byDay[d].v) byDay[d] = {v, t:l.t, c:capped}; });
  const days = Object.values(byDay).sort((a, b) => a.t - b.t), last = days[days.length - 1], gap = (now - last.t) / 864e5;
  const dv = days.slice(-3).map(d => d.v * (1 - Math.min(0.15, (now - d.t) / 864e5 * 0.005))).sort((a, b) => a - b);
  const best = dv.length >= 3 ? dv[1] : dv[dv.length - 1];   /* la médiane des 3 dernières séances : robuste au hasard, et une baisse se voit en 2 séances */
  const off = gap > 7 ? Math.max(0.7, 1 - 0.015 * (gap - 7)) : 1;
  return {v:Math.round(best * off * 10) / 10, n:days.length, off, gap:Math.round(gap)}; }

// forme du jour (0,6 à 1,05) : météo du corps, jours enchaînés, retour de coupure, gênes notées, et surtout tes dernières séances
// comparées à ta capacité (une baisse silencieuse se voit avant que tu la sentes)
function readiness(){ let r = 1; const why = [], now = Date.now(), mood = typeof moodToday === "function" ? moodToday() : null;
  if (mood === "fatigue") { r -= 0.2; why.push("tu es fatigué"); } else if (mood === "top") r += 0.03;
  const days = new Set(S.log.filter(l => idOfLog(l)).map(l => dayKey(l.t))); let run = 0; for (let i = 1; i <= 4; i++) { const x = new Date(); x.setDate(x.getDate() - i); if (days.has(dayKey(x))) run++; else break; }
  if (run >= 3) { r -= 0.08; why.push(run + " jours enchaînés"); }
  const lastT = S.log.filter(l => idOfLog(l) && dayKey(l.t) !== dayKey(now)).reduce((a, l) => Math.max(a, l.t), 0), gap = lastT ? (now - lastT) / 864e5 : 0;
  if (gap > 10) { r -= 0.12; why.push("reprise après " + Math.round(gap) + " jours"); }
  const ec = (S.ecl || []).filter(e => now - e.t < 36 * 3600e3).slice(-1)[0]; if (ec && Math.max(ec.poignet || 0, ec.coude || 0, ec.epaule || 0, ec.dos || 0) >= 3) { r -= 0.1; why.push("une gêne notée"); }
  const P = (S.perf || []).filter(p => now - p.t < 10 * 864e5).slice(-2); if (P.length >= 1) { const a = P.reduce((s, p) => s + p.r, 0) / P.length, lo = Math.min(...P.map(p => p.r)), ms = Math.max(...P.map(p => p.miss || 0));
    const H = (S.perf || []).filter(p => now - p.t < 28 * 864e5 && p.res != null), lastR = H.length ? H[H.length - 1].res : null, usual = H.length >= 4 ? H.slice(0, -1).reduce((s, p) => s + p.res, 0) / (H.length - 1) : null;
    if (lastR != null && usual != null && usual - lastR >= 0.4 && now - H[H.length - 1].t < 4 * 864e5) { r -= 0.2; why.push("moins de réserve que d’habitude"); }   /* « rien » là où tu disais « un peu » : la fatigue avant l’échec */
    else if (a < 0.9 || lo < 0.82) { r -= 0.15; why.push("tes dernières séances sous ta capacité"); } else if (ms >= 0.4) { r -= 0.15; why.push("beaucoup de séries ratées la dernière fois"); } }
  r = Math.max(0.6, Math.min(1.05, Math.round(r * 100) / 100)); return {r, why}; }
const readyMemo = () => { const k = (window._sv || 0) + "|" + dayKey(Date.now()); if (readyMemo.k !== k) { readyMemo.k = k; readyMemo.v = readiness(); } return readyMemo.v; };

// pente de progression : régression sur les 8 dernières séances de la figure (meilleure valeur du jour), en % par semaine
function trend(id){ const byDay = {}; logsOf(id).filter(l => Date.now() - l.t < 60 * 864e5).forEach(l => { const d = dayKey(l.t); byDay[d] = Math.max(byDay[d] || 0, l.v); });
  const pts = Object.keys(byDay).map(d => [dk(d).getTime() / 864e5, byDay[d]]).sort((a, b) => a[0] - b[0]).slice(-8); if (pts.length < 6) return null;
  const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n, sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0); if (!sxx || !my) return null;
  const slope = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / sxx, span = pts[n - 1][0] - pts[0][0];
  return {pct:Math.round(slope * 7 / my * 1000) / 10, span, n}; }   // % de gain par semaine

// la raison d’une charge, en une ligne
function whyLoad(m, cap, work, R, light, variant){ const u = v => m.type === "hold" ? num(v) + " s" : v + " rép.";
  const p = []; if (cap && cap.v > 0) p.push("capacité estimée " + u(cap.v) + (cap.off < 1 ? " (reprise, −" + Math.round((1 - cap.off) * 100) + " %)" : ""));
  if (R && R.r < 1) p.push("forme du jour " + Math.round(R.r * 100) + " % : " + R.why.join(", "));
  if (light) p.push("semaine plus légère : progrès à l’arrêt depuis 2 semaines");
  if (variant) p.push("plateau : on change de stimulus, plus de séries un peu moins dures");
  const a = adaptOf(m.id); if (a > 1.04) p.push("tes dernières séances étaient propres, +" + Math.round((a - 1) * 100) + " %"); else if (a < 0.96) p.push("des séries ratées, −" + Math.round((1 - a) * 100) + " %");
  return p.length ? "Pourquoi " + u(work) + " : " + p.join(" ; ") + "." : ""; }
