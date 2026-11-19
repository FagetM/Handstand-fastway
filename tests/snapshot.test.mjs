// Filet de sécurité pour les refactorings : avec la date et le hasard figés, l'app doit produire exactement
// les mêmes séances, les mêmes plans, les mêmes textes et les mêmes écrans que la référence enregistrée.
// Après un changement voulu (contenu, règle d'entraînement), regénérer la référence : npm run test:update
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { serve, launch, openApp, SAVE, ROOT, settle } from './helpers.mjs';

const UPDATE = !!process.env.UPDATE_GOLDEN;
const GOLD = path.join(ROOT, 'tests/golden');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
// ordre des attributs, styles en ligne et adresses blob : sans effet sur ce que voit l'utilisateur, et variables d'un navigateur à l'autre
const norm = h => h.replace(/\sstyle="[^"]*"/g, '').replace(/blob:[^")\s]*/g, 'blob')
  .replace(/<([a-z0-9]+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (m, t, at, sl) => '<' + t + ' ' + (at.match(/[\w-]+(?:="[^"]*")?/g) || []).sort().join(' ') + sl + '>');

const grab = async (page, id) => { await settle(page); return page.evaluate(id => $(id).innerHTML, id); };
let server, browser;
before(async () => { server = await serve(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

function compare(name, got) {
  const file = path.join(GOLD, name + '.json');
  if (UPDATE || !fs.existsSync(file)) { fs.mkdirSync(GOLD, {recursive: true}); fs.writeFileSync(file, JSON.stringify(got, null, 1) + '\n'); return; }
  const want = JSON.parse(fs.readFileSync(file, 'utf8'));
  const changed = Object.keys({...want, ...got}).filter(k => want[k] !== got[k]);
  assert.deepEqual(changed, [], changed.length + ' cas différents de la référence (' + name + '). Si le changement est voulu : npm run test:update');
}

test('séances, plans et textes des onglets identiques à la référence (192 cas)', async () => {
  const got = {};
  for (const day of [0, 3, 5]) {   // lundi, jeudi, samedi
    const app = await openApp(browser, {url: server.url, state: SAVE(), day, seed: 12345, no3d: true});
    const r = await app.page.evaluate(() => {
      const base = JSON.parse(JSON.stringify(S)), res = {};
      for (const g of [null, 'planche', 'press', 'oahs']) for (const mins of [15, 30, 60, 90]) for (const k of [0, 6, 25]) for (const mood of [null, 'fatigue']) for (const pain of [false, true]) {
        if (mood && (mins !== 30 || k !== 6)) continue; if (pain && (mins !== 60 || mood)) continue;
        S = JSON.parse(JSON.stringify(base)); S.goal = g; S.mins = mins;
        goalOf().ms.slice(0, k).forEach(id => { const o = st(id); o.done = true; o.best = MS[id].target || 1; });
        if (mood) S.mood = {d: dayKey(Date.now()), k: mood};
        if (pain) S.painLog = [{t: Date.now() - 30 * 3600e3, zone: 'poignet'}];
        window._bb = null; stats.k = null; window._sv = (window._sv || 0) + 1;
        const key = [g || 'both', mins, k, mood || '-', pain ? 'pain' : '-'].join('|');
        res[key + '|séance'] = JSON.stringify(builtinBlocks());
        res[key + '|plan'] = JSON.stringify(planCalc());
        render(); ['today', 'path', 'voie', 'learn', 'me'].forEach(v => { res[key + '|' + v] = document.getElementById('v-' + v).innerText; });
      }
      return res; });
    for (const k in r) got[day + '|' + k] = r[k];
    assert.deepEqual(app.errors, [], 'erreurs dans la page');
    await app.ctx.close();
  }
  const hashed = {}; for (const k in got) hashed[k] = hash(got[k]);
  assert.equal(Object.keys(hashed).length, 192 * 7);
  compare('behaviour', hashed);
});

test('écrans du bilan, des fiches de figures et de la séance guidée identiques à la référence', async () => {
  const shots = {};
  // bilan de départ : on touche alternativement le premier et le troisième choix
  { const app = await openApp(browser, {url: server.url, state: SAVE({placed: false, mins: 60, ms: {fd_plank: {done: true, best: 30}, fd_roue: {done: true, best: 5}}}), seed: 777, no3d: true});
    await app.page.evaluate(() => startPlacement());
    for (let i = 0; i < 14; i++) { shots['bilan' + i] = await grab(app.page, 'plBody');
      const ok = await app.page.evaluate(i => { const bs = [...$('plBody').querySelectorAll('button')].filter(x => x.getBoundingClientRect().width); const c = bs[i % 2 ? Math.min(2, bs.length - 1) : 0]; if (!c) return false; c.click(); return true; }, i);
      if (!ok) break; await app.page.waitForTimeout(100); }
    assert.deepEqual(app.errors, []); await app.ctx.close(); }
  // fiches de figures, détail de la séance, séance guidée
  { const app = await openApp(browser, {url: server.url, state: SAVE({mins: 60, ms: {fd_plank: {done: true, best: 30}, fd_roue: {done: true, best: 5}}}), seed: 777, no3d: true}), p = app.page;
    for (const id of ['fd_plank', 'fd_pike', 'b2_str15', 'pl_lean', 'oa_wall', 'pr_lsit']) { await p.evaluate(id => quick(id), id); shots['fiche_' + id] = await grab(p, 'qkBody'); await p.evaluate(() => $('qkDlg').close()); }
    shots.today = await grab(p, 'v-today');
    await p.evaluate(() => { const t = $('sessToggle'); if (t && !t.hidden) t.click(); }); shots.detail = await grab(p, 'v-today');
    await p.evaluate(() => document.querySelector('#v-today button.btn.big').click()); await p.waitForTimeout(200);
    for (let i = 0; i < 6; i++) { shots['seance' + i] = await grab(p, 'sd');
      await p.evaluate(() => { const g = $('sdGo'); if (g && g.getBoundingClientRect().width) g.click(); else { const q = document.querySelector('#sd .qrep.on, #sd .qrep'); if (q) q.click(); } __tick(5000); }); await p.waitForTimeout(150); }
    assert.deepEqual(app.errors, []); await app.ctx.close(); }
  const hashed = {}; for (const k in shots) hashed[k] = hash(norm(shots[k]));
  compare('screens', hashed);
});
