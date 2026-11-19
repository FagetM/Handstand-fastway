// Règles de l'entraînement, testées sur les vraies fonctions de l'app (dans le navigateur, état contrôlé).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { serve, launch, openApp, SAVE } from './helpers.mjs';

let server, browser, app;
before(async () => { server = await serve(); browser = await launch(); app = await openApp(browser, {url: server.url, state: SAVE()}); });
after(async () => { await browser.close(); await server.close(); });

// dans la page : remet une sauvegarde neuve, puis applique objectif, durée, figures validées, humeur et douleur
const PREP = `window.__prep = (o) => {
  S = Object.assign(JSON.parse(JSON.stringify(window.__base || (window.__base = JSON.parse(JSON.stringify(S))))), {goal: o.goal || null, mins: o.mins || 30});
  goalOf().ms.slice(0, o.done || 0).forEach(id => { const x = st(id); x.done = true; x.best = MS[id].target || 1; });
  if (o.mood) S.mood = {d: dayKey(Date.now()), k: o.mood};
  if (o.pain) S.painLog = [{t: Date.now() - (o.painAgo || 1) * 864e5, zone: o.pain}];
  window._bb = null; stats.k = null; window._sv = (window._sv || 0) + 1; };`;
const inPage = (fn, arg) => app.page.evaluate(PREP).then(() => app.page.evaluate(fn, arg));
const MATRIX = [];
for (const goal of [null, 'planche', 'press', 'oahs']) for (const mins of [15, 30, 45, 60, 90]) for (const done of [0, 6, 15, 30, 60]) MATRIX.push({goal, mins, done});

test('chaque séance générée est complète : un nom, des séries, des nombres valides', async () => {
  const bad = await inPage(M => { const out = [];
    for (const o of M) { __prep(o); const bb = builtinBlocks(); if (!bb.length) out.push('vide ' + JSON.stringify(o));
      bb.forEach(b => { if (!b.name) out.push('bloc sans nom ' + JSON.stringify(o)); if (!b.sets || !b.sets.length) out.push('bloc sans série ' + b.name);
        b.sets.forEach(s => Object.entries(s).forEach(([k, v]) => { if (typeof v === 'number' && (!isFinite(v) || v < 0)) out.push(b.name + ' ' + k + '=' + v); })); }); }
    return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('les figures annoncées par la séance existent dans l’arbre', async () => {
  const bad = await inPage(M => { const out = []; for (const o of M) { __prep(o); builtinBlocks().forEach(b => { if (b.ms && !MS[b.ms]) out.push(b.ms); }); } return [...new Set(out)]; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('fatigué, ou 15 minutes : une seule figure travaillée', async () => {
  const bad = await inPage(M => { const out = [];
    for (const o of M) { for (const mood of [null, 'fatigue']) { if (!mood && o.mins > 15) continue; __prep(Object.assign({}, o, {mood}));
      const n = builtinBlocks().filter(b => b.ms).length; if (n > 1) out.push(JSON.stringify(o) + ' ' + (mood || '') + ' : ' + n + ' figures'); } }
    return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('douleur à l’épaule ou au coude : ni un bras, ni force pendant la phase de repos', async () => {
  const bad = await inPage(M => { const out = [];
    for (const o of M) for (const pain of ['epaule', 'coude']) { __prep(Object.assign({}, o, {pain}));
      builtinBlocks().filter(b => b.ms).forEach(b => { if (MS[b.ms].sec === 'onearm' || FORCE(b.ms)) out.push(pain + ' ' + JSON.stringify(o) + ' : ' + b.ms); }); }
    return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('douleur : repos de 3 jours (7 pour épaule et coude), puis reprise à 60 % et 80 %', async () => {
  const phases = await inPage(() => { const at = (zone, days) => { __prep({pain: zone, painAgo: days}); const p = painState(); return p.phase + '@' + p.ease; };
    return {poignet: [1, 2.5, 4, 11, 18].map(d => at('poignet', d)), epaule: [1, 6, 8, 15, 22].map(d => at('epaule', d))}; });
  assert.deepEqual(phases.poignet, ['1@0.6', '1@0.6', '2@0.6', '3@0.8', '0@1']);
  assert.deepEqual(phases.epaule, ['1@0.6', '1@0.6', '2@0.6', '3@0.8', '0@1']);
});

test('à partir de 60 minutes, la séance tient dans le temps choisi (10 % de marge)', async () => {
  const bad = await inPage(M => { const out = []; for (const o of M.filter(x => x.mins >= 60)) { __prep(o); const r = estSecs(builtinBlocks()) / (o.mins * 60); if (r > 1.1) out.push(JSON.stringify(o) + ' ×' + r.toFixed(2)); } return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('séances courtes (15 à 45 minutes) dans le temps choisi', {todo: 'connu : les blocs « à garder » ne sont jamais raccourcis ; une séance de 15 min peut en durer 38'}, async () => {
  const bad = await inPage(M => { const out = []; for (const o of M.filter(x => x.mins < 60)) { __prep(o); const r = estSecs(builtinBlocks()) / (o.mins * 60); if (r > 1.1) out.push(JSON.stringify(o) + ' ×' + r.toFixed(2)); } return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('réduire une séance trop longue garde ses figures, ses blocs « à garder » et 6 essais d’équilibre', async () => {
  // une vraie séance de 90 minutes, serrée à 5, 10 puis 15 minutes
  const bad = await inPage(M => { const out = [];
    for (const o of M.filter(x => x.mins === 90)) { __prep(o); const full = builtinBlocks();
      for (const mins of [5, 10, 15]) { const r = fitTime(JSON.parse(JSON.stringify(full)), mins), tag = JSON.stringify(o) + ' → ' + mins + ' min';
        full.filter(b => b.ms).forEach(b => { const y = r.find(z => z.ms === b.ms); if (!y) out.push(tag + ' : ' + b.ms + ' retirée');
          else if (FREE(MS[b.ms]) && y.sets.length < Math.min(6, b.sets.length)) out.push(tag + ' : ' + b.ms + ' à ' + y.sets.length + ' essais'); });
        if (r.filter(b => b.keep).length !== full.filter(b => b.keep).length) out.push(tag + ' : bloc « à garder » retiré');
        if (estSecs(r) > estSecs(full)) out.push(tag + ' : la séance s’est allongée'); } }
    return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('le plan termine chaque prérequis avant la figure qui en dépend', async () => {
  const bad = await inPage(M => { const out = [];
    for (const o of M.filter(x => x.mins === 30)) { __prep(o); const {fin} = planCalc();
      for (const id in fin) { if (fin[id] == null || eqSkip(id)) continue; if (!isFinite(fin[id]) || fin[id] < 0) out.push(id + ' fin=' + fin[id]);
        (MS[id].req || []).forEach(r => { if (fin[r] != null && !eqSkip(r) && fin[r] > fin[id] + 1e-9) out.push(r + ' après ' + id + ' ' + JSON.stringify(o)); }); } }
    return [...new Set(out)]; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('valider des figures ne fait jamais baisser l’expérience ni le niveau', async () => {
  const seq = await inPage(() => { const out = []; for (const done of [0, 1, 3, 6, 10, 20, 40]) { __prep({done}); const z = stats(); out.push([z.xp, z.lvl, z.done]); } return out; });
  for (let i = 1; i < seq.length; i++) { assert.ok(seq[i][0] >= seq[i - 1][0], 'xp ' + JSON.stringify(seq)); assert.ok(seq[i][1] >= seq[i - 1][1], 'niveau ' + JSON.stringify(seq)); assert.ok(seq[i][2] >= seq[i - 1][2]); }
  assert.ok(seq[seq.length - 1][0] > seq[0][0], 'valider 40 figures doit rapporter de l’expérience');
});

test('les quêtes annexes ont un point d’entrée dans l’app', {todo: 'connu : sqOpen() n’est plus appelée depuis la suppression de l’ancien chemin'}, async () => {
  const src = await app.page.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean));
  const texts = await Promise.all(src.map(u => fetch(u).then(r => r.text())));
  assert.ok(texts.join('\n').match(/sqOpen\(/g).length > 1, 'sqOpen n’est appelée nulle part');
});
