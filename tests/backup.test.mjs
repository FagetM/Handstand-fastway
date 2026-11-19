// La sauvegarde : un fichier qu'on peut garder ailleurs, un rappel quand elle date, et un aller-retour sans perte.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { serve, launch, openApp, SAVE, T0 } from './helpers.mjs';

let server, browser;
before(async () => { server = await serve(); browser = await launch(); });
after(async () => { await browser.close(); await server.close(); });

const logs = n => Array.from({length: n}, (_, i) => ({t: T0 - (n - i) * 864e5, id: 'fd_plank', v: 20 + i}));   // du plus ancien au plus récent, comme l'app les range
const state = (n, extra) => SAVE(Object.assign({log: logs(n), ms: {fd_plank: {done: true, best: 30}}}, extra));
const card = page => page.evaluate(() => ({shown: !$('bkCard').hidden, text: $('bkCard').innerText, info: $('bkInfo').textContent}));

test('pas de rappel tant qu’il n’y a presque rien à perdre (moins de 5 essais)', async () => {
  const app = await openApp(browser, {url: server.url, state: state(4)});
  const c = await card(app.page); assert.equal(c.shown, false); assert.match(c.info, /Pas encore de sauvegarde/);
  await app.ctx.close();
});

test('rappel sur Aujourd’hui dès 5 essais sans sauvegarde ; « Plus tard » le repousse d’une semaine', async () => {
  const app = await openApp(browser, {url: server.url, state: state(5)}), p = app.page;
  let c = await card(p); assert.equal(c.shown, true); assert.match(c.text, /à l’abri/);
  await p.locator('#bkCard button', {hasText: 'Plus tard'}).tap();
  assert.equal((await card(p)).shown, false);
  await p.evaluate(() => { __tick(6 * 864e5); render(); }); assert.equal((await card(p)).shown, false, 'encore repoussé au 6e jour');
  await p.evaluate(() => { __tick(2 * 864e5); render(); }); assert.equal((await card(p)).shown, true, 'de retour après 7 jours');
  assert.deepEqual(app.errors, []);
  await app.ctx.close();
});

test('enregistrer : un fichier JSON complet est téléchargé, le rappel disparaît, puis revient après 4 semaines', async () => {
  const app = await openApp(browser, {url: server.url, state: state(6, {mins: 45, goal: 'planche'})}), p = app.page;
  const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('#bkCard button', {hasText: 'Sauvegarder'}).tap()]);
  assert.match(dl.suggestedFilename(), /^gymnastic-yoga-2026-11-16\.json$/);
  const saved = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  assert.equal(saved.log.length, 6); assert.equal(saved.goal, 'planche'); assert.equal(saved.mins, 45); assert.ok(saved.ms.fd_plank.done);
  let c = await card(p); assert.equal(c.shown, false); assert.match(c.info, /Dernière sauvegarde : 16 novembre 2026/);
  await p.evaluate(() => { __tick(27 * 864e5); render(); }); assert.equal((await card(p)).shown, false);
  await p.evaluate(() => { __tick(2 * 864e5); render(); }); c = await card(p); assert.equal(c.shown, true); assert.match(c.text, /date d’un mois/);
  assert.deepEqual(app.errors, []);
  await app.ctx.close();
});

test('aller-retour : le fichier enregistré, ouvert sur un téléphone vide, rend toute la progression', async () => {
  const a = await openApp(browser, {url: server.url, state: state(8, {mins: 60, goal: 'press', sq: {sq_roueG: T0 - 5 * 864e5}})});
  await a.page.evaluate(() => showTab('me'));
  const [dl] = await Promise.all([a.page.waitForEvent('download'), a.page.evaluate(() => $('bkSave').click())]);
  const file = {name: dl.suggestedFilename(), mimeType: 'application/json', buffer: fs.readFileSync(await dl.path())}, before = await a.page.evaluate(() => JSON.stringify([S.ms, S.log, S.goal, S.mins, S.sq]));
  await a.ctx.close();
  const b = await openApp(browser, {url: server.url, state: SAVE()}), p = b.page;
  p.on('dialog', d => d.accept());   // « Remplacer les données actuelles ? », puis « Sauvegarde importée. »
  // l'import recharge la page : on attend ce rechargement avant de relire l'état
  const reloaded = p.waitForEvent('framenavigated', {timeout: 30000});
  await p.setInputFiles('#bkFile', file); await reloaded;
  await p.waitForFunction(() => typeof render === 'function' && typeof S !== 'undefined' && S.log && S.log.length === 8, null, {timeout: 30000});
  assert.equal(await p.evaluate(() => JSON.stringify([S.ms, S.log, S.goal, S.mins, S.sq])), before);
  await b.ctx.close();
});

test('un fichier qui n’est pas une sauvegarde est refusé sans rien effacer', async () => {
  const app = await openApp(browser, {url: server.url, state: state(5)}), p = app.page, said = [];
  p.on('dialog', d => { said.push(d.message()); d.accept(); });
  await p.setInputFiles('#bkFile', {name: 'photo.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}')});
  await p.waitForFunction(() => true); await p.waitForTimeout(300);
  assert.match(said.join(' '), /illisible/); assert.equal(await p.evaluate(() => S.log.length), 5);
  await app.ctx.close();
});
