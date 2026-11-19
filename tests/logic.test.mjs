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

test('séances courtes (15 à 45 minutes) dans le temps choisi (10 % de marge)', async () => {
  const bad = await inPage(M => { const out = []; for (const o of M.filter(x => x.mins < 60)) { __prep(o); const r = estSecs(builtinBlocks()) / (o.mins * 60); if (r > 1.1) out.push(JSON.stringify(o) + ' ×' + r.toFixed(2)); } return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('réduire une séance trop longue garde ses figures, la mise en route, les poignets et 6 essais d’équilibre', async () => {
  // une vraie séance de 90 minutes, serrée à 5, 10 puis 15 minutes
  const bad = await inPage(M => { const out = [];
    for (const o of M.filter(x => x.mins === 90)) { __prep(o); const full = builtinBlocks(); if (!full.some(b => b.ms)) continue;   // objectif entièrement validé : séance de souplesse, sans appui sur les mains
      for (const mins of [5, 10, 15]) { const r = fitTime(JSON.parse(JSON.stringify(full)), mins), tag = JSON.stringify(o) + ' → ' + mins + ' min';
        full.filter(b => b.ms).forEach(b => { const y = r.find(z => z.ms === b.ms); if (!y) out.push(tag + ' : ' + b.ms + ' retirée');
          else if (FREE(MS[b.ms]) && y.sets.length < Math.min(6, b.sets.length)) out.push(tag + ' : ' + b.ms + ' à ' + y.sets.length + ' essais'); });
        for (const dk of ['miseEnRoute', 'poignets']) if (!r.some(b => b.dk === dk)) out.push(tag + ' : ' + dk + ' retiré');
        r.forEach(b => { if (!b.sets.length) out.push(tag + ' : ' + b.name + ' sans série'); });
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

test('quêtes annexes : on y arrive par le Profil et par la fiche de la figure, et le tampon compte pour le badge', async () => {
  const r = await inPage(() => { __prep({done: 8}); render(); const out = {};
    showTab('me'); const link = [...document.querySelectorAll('#v-me button')].find(b => /^Quêtes annexes/.test(b.textContent)); out.link = link && link.textContent;
    link.click(); out.rows = document.querySelectorAll('#qkBody .sqrow').length; out.total = SQ.filter(q => MS[q.req]).length;
    const q = SQ.find(q => reqDone(q.req)), locked = SQ.find(q => !reqDone(q.req));
    quick(q.req); const row = [...document.querySelectorAll('#qkBody .sqrow')].find(b => b.textContent.includes(q.name)); out.onSheet = !!row;
    row.click(); out.title = $('qkT').textContent === q.name;
    [...document.querySelectorAll('#qkBody button')].find(b => b.textContent === 'C’est fait').click();
    out.stamped = !!S.sq[q.id]; out.badge = BADGES.find(b => b.id === 'sq8').cur();
    sqOpen(locked); out.lockedHasNoButton = ![...document.querySelectorAll('#qkBody button')].some(b => b.textContent === 'C’est fait'); $('qkDlg').close();
    return out; });
  assert.match(r.link, /^Quêtes annexes \(0\/\d+\)$/); assert.equal(r.rows, r.total); assert.ok(r.rows >= 10);
  assert.ok(r.onSheet, 'la fiche de la figure doit proposer sa quête'); assert.ok(r.title); assert.ok(r.stamped); assert.equal(r.badge, 1);
  assert.ok(r.lockedHasNoButton, 'une quête verrouillée ne se valide pas');
});

test('une séance très courte garde toujours la mise en route et la préparation des poignets (3 minutes au moins)', async () => {
  const bad = await inPage(M => { const out = [];
    for (const o of M.filter(x => x.mins === 15)) { __prep(o); const bb = builtinBlocks(), w = bb.find(b => b.dk === 'poignets');
      if (!goalOf().ms.some(id => !st(id).done)) { if (!bb.some(b => b.dk === 'miseEnRoute')) out.push('souplesse sans mise en route'); continue; }   // objectif validé : séance de souplesse
      if (!bb.some(b => b.dk === 'miseEnRoute')) out.push('sans mise en route ' + JSON.stringify(o));
      if (!w || w.sets[0].dur < 180) out.push('poignets absents ou trop courts ' + JSON.stringify(o));
      if (!bb.some(b => b.ms)) out.push('aucune figure ' + JSON.stringify(o)); }
    return out; }, MATRIX);
  assert.deepEqual(bad, []);
});

test('quête principale : le pourcentage suit les étapes validées, de 0 à 100, pour chaque objectif', async () => {
  const r = await inPage(() => { const out = [];
    for (const goal of [null, 'planche', 'press', 'oahs', 'min']) { let prev = -1; const tot = (() => { __prep({goal}); return questState().tot; })();
      for (const done of [0, 1, 5, 12, 25, 200]) { __prep({goal, done}); const Q = questState();
        if (Q.pct < prev) out.push(goal + ' : le pourcentage baisse à ' + done); prev = Q.pct;
        if (Q.pct !== Math.floor(Q.done / Q.tot * 100) || Q.done > Q.tot) out.push(goal + ' : compte incohérent');
        if (Q.next && (st(Q.next[0]).done || msLocked(MS[Q.next[0]]))) out.push(goal + ' : la prochaine étape n’est pas travaillable');
        if (Q.left.length && !Q.next) out.push(goal + ' ' + done + ' : il reste des étapes mais aucune n’est ouverte');
        if (done >= tot && (Q.pct !== 100 || Q.left.length)) out.push(goal + ' : tout validé mais ' + Q.pct + ' %'); }
      __prep({goal}); if (questState().pct > 10) out.push(goal + ' : ne part pas de zéro'); }
    return out; });
  assert.deepEqual(r, []);
});

test('quête principale : la carte est au-dessus de la séance et dit l’objectif, le pourcentage, la date et la prochaine étape', async () => {
  const r = await inPage(() => { __prep({goal: 'planche', done: 10}); render(); showTab('today'); const c = $('sommet'), Q = questState();
    return {above: !!(c.compareDocumentPosition($('nextCard')) & Node.DOCUMENT_POSITION_FOLLOWING), hidden: c.hidden, text: c.innerText.replace(/[\u00a0\u202f]/g, ' '),   // l'app pose des espaces insécables avant les unités
       pct: Q.pct, goal: Q.G.name, next: MS[Q.next[0]].name}; });
  assert.equal(r.hidden, false); assert.ok(r.above, 'la quête doit venir avant la séance du jour');
  assert.match(r.text, /Quête principale/); assert.ok(r.text.includes(r.goal)); assert.ok(r.text.includes(r.pct + ' %') || r.text.includes(String(r.pct)));
  assert.match(r.text, /arrivée estimée/); assert.match(r.text, /Prochaine étape/); assert.ok(r.text.includes(r.next)); assert.match(r.text, /dans (\d+ jours?|≈)/);
});

test('page de la quête : le chemin par chapitres, ce qu’on peut travailler maintenant, les quêtes annexes ouvertes', async () => {
  const r = await inPage(() => { __prep({goal: 'planche', done: 10}); render(); $('sommet').click(); const Q = questState(), body = $('qkBody');
    const secs = [...new Set(Q.ids.map(id => MS[id].sec))], rows = [...body.querySelectorAll('.qpath li')];
    const out = {open: $('qkDlg').open, text: body.innerText, chapters: rows.length, secs: secs.length, counts: rows.map(li => li.querySelector('.qcnt').textContent),
      sum: rows.reduce((n, li) => n + +li.querySelector('.qcnt').textContent.split('/')[1], 0), tot: Q.tot, steps: body.querySelectorAll('.qstep').length, okFirst: rows[0].className};
    body.querySelector('.qstep').click(); out.sheet = $('qkT').textContent; $('qkDlg').close();
    __prep({goal: 'min', done: 200}); render(); out.doneText = $('sommet').innerText; $('sommet').click(); out.donePage = $('qkBody').innerText; $('qkDlg').close(); return out; });
  assert.ok(r.open); assert.equal(r.chapters, r.secs); assert.equal(r.sum, r.tot, 'les chapitres couvrent toutes les étapes');
  assert.ok(r.steps >= 1 && r.steps <= 3); assert.equal(r.okFirst, 'ok', 'le premier chapitre est terminé');
  for (const t of ['Maintenant', 'Le chemin', 'Quêtes annexes', 'Arrivée estimée', 'Changer d’objectif']) assert.ok(r.text.includes(t), t);
  assert.notEqual(r.sheet, 'Ma quête', 'toucher une étape ouvre sa fiche');
  assert.match(r.doneText, /Quête accomplie/); assert.match(r.donePage, /100/); assert.ok(!/null|undefined|NaN/.test(r.text + r.donePage + r.doneText));
});
