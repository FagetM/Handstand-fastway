// L'app vue par quelqu'un qui n'a que son téléphone : elle s'ouvre, se lit, se touche, et marche sans réseau.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { serve, launch, openApp, SAVE, settle } from './helpers.mjs';

let server, browser;
before(async () => { server = await serve(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const TABS = ['today', 'path', 'voie', 'learn', 'me'];
const is3d = u => /avatar3d\.js|spr-worker\.js|three\.module/.test(u);

test('les cinq onglets s’ouvrent sans erreur, avec du contenu', async () => {
  const app = await openApp(browser, {url: server.url, state: SAVE()});
  for (const v of TABS) { await app.page.locator(`nav.tabs button[data-v="${v}"]`).tap(); await settle(app.page);
    const r = await app.page.evaluate(() => { const on = document.querySelectorAll('.view.on'); return {n: on.length, id: on[0] && on[0].id, len: on[0] ? on[0].innerText.trim().length : 0}; });
    assert.deepEqual([r.n, r.id], [1, 'v-' + v]); assert.ok(r.len > 100, v + ' : onglet presque vide (' + r.len + ' caractères)'); }
  assert.deepEqual(app.errors, []); assert.deepEqual(app.realNotFound(), [], 'fichiers introuvables');
  await app.ctx.close();
});

test('code d’accès : l’app reste fermée, un mauvais code est refusé, rien ne se charge derrière', async () => {
  const app = await openApp(browser, {url: server.url, state: null, locked: true}), p = app.page, reqs = [];
  p.on('request', r => reqs.push(r.url()));
  assert.equal(await p.evaluate(() => document.body.classList.contains('locked')), true);
  assert.equal(await p.locator('main').isVisible(), false, 'le contenu ne doit pas être visible avant le code');
  await p.fill('#gateCode', 'mauvais code'); await p.locator('#gateForm button[type=submit]').tap();
  await p.waitForFunction(() => /incorrect/i.test(document.getElementById('gateMsg').textContent));
  assert.equal(await p.evaluate(() => document.body.classList.contains('locked')), true);
  await p.waitForTimeout(1500);
  assert.deepEqual(reqs.filter(is3d), [], 'le moteur 3D ne doit pas être téléchargé derrière l’écran du code');
  assert.deepEqual(app.errors, []);
  await app.ctx.close();
});

test('le moteur 3D n’est chargé dans la page qu’à la première visite du Profil', async () => {
  const app = await openApp(browser, {url: server.url, state: SAVE()}), p = app.page;
  for (const v of ['path', 'voie', 'learn', 'today']) { await p.locator(`nav.tabs button[data-v="${v}"]`).tap(); await p.waitForTimeout(150); }
  assert.equal(await p.evaluate(() => !!sprMod || !!A3), false, 'moteur 3D chargé avant le Profil');
  assert.equal(await p.evaluate(() => !!document.querySelector('#av3d canvas')), false);   // le Worker des animations, lui, a le droit de charger three.js hors de la page
  await p.locator('nav.tabs button[data-v="me"]').tap();
  const webgl = await p.evaluate(() => { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); });
  if (webgl) { await p.waitForFunction(() => !!A3 && !!document.querySelector('#av3d canvas'), null, {timeout: 20000});
    assert.equal(await p.evaluate(() => $('av3d').hidden), false); }
  else assert.equal(await p.evaluate(() => $('av').style.display !== 'none'), true, 'sans WebGL, le personnage 2D reste affiché');
  assert.deepEqual(app.errors, []);
  await app.ctx.close();
});

// dans la page : textes trop petits, cibles tactiles trop petites, débordement, contraste insuffisant
const AUDIT = () => {
  const root = document.querySelector('dialog[open]') || document.querySelector('.view.on'), out = {tiny: [], small: [], contrast: [], overflow: document.documentElement.scrollWidth > innerWidth};
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (m) { const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; }
    const o = c.match(/color\(srgb ([^)]+)\)/); if (!o) return null; const v = o[1].replace('/', ' ').split(/\s+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; };
  const blend = (t, b) => [0, 1, 2].map(i => t[i] * t[3] + b[i] * (1 - t[3])).concat(1);
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const bgOf = el => { const stack = []; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } }
    let bg = !stack.length || stack[stack.length - 1][3] < 1 ? parse(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1] : [0, 0, 0, 1];
    for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg); return bg; };
  const label = el => (el.id || (typeof el.className === 'string' && el.className) || el.tagName) + ' « ' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24) + ' »';
  root.querySelectorAll('*').forEach(el => { if (el.closest('.cst')) return;   // le ciel : fond dessiné et étoiles qui grossissent au zoom, vérifié à part
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el); if (!r.width || !r.height || cs.visibility === 'hidden') return;
    if (el.matches('button, a, input, select, summary') && (r.height < 40 || r.width < 40) && !(Math.min(r.width, r.height) >= 28 && Math.max(r.width, r.height) >= 44)) { const lab = el.closest('label'), lr = lab && lab.getBoundingClientRect(); if (!(lr && lr.height >= 40 && lr.width >= 40)) out.small.push(label(el) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const fs = parseFloat(cs.fontSize); if (fs < 12) out.tiny.push(label(el) + ' ' + fs + 'px');
    let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= +getComputedStyle(e).opacity; if (op < 0.05) return;
    const bg = bgOf(el), fg = parse(cs.color), c = blend([fg[0], fg[1], fg[2], fg[3] * op], bg), a = lum(c), b = lum(bg), ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700); if (ratio < (large ? 3 : 4.5) - 0.005) out.contrast.push(label(el) + ' ' + ratio.toFixed(2)); });
  ['tiny', 'small', 'contrast'].forEach(k => { out[k] = [...new Set(out[k])]; }); return out; };

for (const theme of [null, 'light']) for (const width of [320, 360]) {
  test(`lisible et touchable à ${width} px, thème ${theme || 'sombre'} : texte ≥ 12 px, cibles ≥ 40 px (28 × 44 en rangée serrée), contraste AA, pas de débordement`, async () => {
    const app = await openApp(browser, {url: server.url, state: SAVE({mins: 60}), theme, width, height: 700}), p = app.page, bad = [];
    const check = async name => { await settle(p); const r = await p.evaluate(AUDIT);
      if (r.overflow) bad.push(name + ' : la page déborde en largeur'); for (const k of ['tiny', 'small', 'contrast']) r[k].forEach(x => bad.push(name + ' ' + k + ' : ' + x)); };
    for (const v of TABS) { await p.evaluate(v => { showTab(v); if (v === 'me') document.querySelectorAll('#v-me details').forEach(d => { d.open = true; }); }, v); await check(v); }
    await p.evaluate(() => { showTab('today'); const t = $('sessToggle'); if (t && !t.hidden) t.click(); }); await check('détail de la séance');
    await p.evaluate(() => quick('fd_pike')); await check('fiche de figure'); await p.evaluate(() => $('qkDlg').close());
    await p.evaluate(() => document.querySelector('#v-today button.btn.big').click()); await p.waitForTimeout(300); await check('séance guidée');
    assert.deepEqual(bad, []); assert.deepEqual(app.errors, []);
    await app.ctx.close();
  });
}

test('le Parcours garde les noms de ses lignes entiers sur un écran de 360 px', async () => {
  const app = await openApp(browser, {url: server.url, state: SAVE(), width: 360, height: 700});
  await app.page.evaluate(() => showTab('path')); await settle(app.page);
  const cut = await app.page.evaluate(() => [...document.querySelectorAll('#v-path .cstpr span')].filter(s => s.scrollWidth > s.clientWidth).map(s => s.textContent));
  assert.deepEqual(cut, []);
  await app.ctx.close();
});

test('« réduire les animations » : plus aucune animation en boucle', {todo: 'connu : la figure en cours (Aujourd’hui) et le personnage 2D du Profil continuent de bouger'}, async () => {
  const app = await openApp(browser, {url: server.url, state: SAVE({mins: 60}), reducedMotion: 'reduce', no3d: true}), found = [];
  for (const v of TABS) { await app.page.evaluate(v => showTab(v), v); await settle(app.page);
    found.push(...await app.page.evaluate(v => [...document.querySelectorAll('.view.on *')].filter(e => [null, '::before', '::after'].some(pe => { const cs = getComputedStyle(e, pe);
      return cs.animationName !== 'none' && cs.animationIterationCount === 'infinite' && parseFloat(cs.animationDuration) > 0.2; })).map(e => v + ' : .' + e.className), v)); }
  assert.deepEqual([...new Set(found)], []);
  await app.ctx.close();
});

test('hors connexion, après une première ouverture : l’app se recharge et la séance démarre', async () => {
  const app = await openApp(browser, {url: server.url, state: SAVE(), serviceWorkers: 'allow'}), p = app.page;
  await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, {timeout: 30000});
  // le temps de laisser les animations se calculer une fois (elles sont gardées sur l'appareil) ; sans WebGL il n'y en a pas
  await p.waitForTimeout(1500);
  await app.ctx.setOffline(true); const failed = []; p.on('requestfailed', r => failed.push(r.url()));
  app.errors.length = 0; await p.reload(); await p.waitForFunction(() => typeof render === 'function' && document.querySelector('.view.on'));
  assert.match(await p.evaluate(() => document.body.innerText), /Aujourd/);
  for (const v of ['path', 'voie', 'learn', 'today']) { await p.evaluate(v => showTab(v), v); await p.waitForTimeout(150); }
  await p.evaluate(() => document.querySelector('#v-today button.btn.big').click());
  await p.waitForFunction(() => !!document.querySelector('#sd[open]'));
  // seules les images fixes des figures (anim/still_*.webp) ne sont pas mises en cache d'avance
  assert.deepEqual(failed.filter(u => !/\/anim\/still_[\w-]+\.webp$/.test(u)), [], 'fichiers manquants hors connexion');
  assert.deepEqual(app.errors, []);
  await app.ctx.close();
});
