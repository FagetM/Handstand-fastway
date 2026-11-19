// Outils partagés par les tests : un petit serveur statique, un navigateur, et l'app ouverte dans un état choisi.
// La date et le hasard sont figés : deux passages donnent exactement le même résultat.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
export const { chromium } = require('playwright');

// le code d'accès de l'app (empreinte lue dans js/main.js) : les tests ouvrent l'app déverrouillée
export const GATE = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8').match(/const GATE = "([0-9a-f]{64})"/)[1];

const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml'};

// serveur des fichiers du dépôt sur un port libre
export function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
      fs.createReadStream(f).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({url: 'http://localhost:' + server.address().port + '/index.html', close: () => new Promise(r => server.close(r))}));
  });
}

export const launch = () => chromium.launch();

// date de référence : lundi 16 novembre 2026, 10 h à Paris ; `day` décale de N jours
export const T0 = Date.UTC(2026, 10, 16, 9, 0, 0);

function initPage({gate, state, day, seed}) {
  if (day != null) {
    let t = Date.UTC(2026, 10, 16, 9, 0, 0) + day * 864e5; const RD = Date;
    class FD extends RD { constructor(...a) { if (!a.length) super(t); else super(...a); } static now() { return t; } }
    window.Date = FD; window.__tick = ms => { t += ms; };
  }
  if (seed != null) { let s = seed; Math.random = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  // l'état de départ n'est posé qu'au premier chargement : un rechargement garde ce que l'app a enregistré
  if (sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded', '1');
  if (gate) localStorage.setItem('hs-fastway-gate', gate);
  if (state) localStorage.setItem('hs-fastway-v1', JSON.stringify(state));
}

// ouvre l'app : `state` est la sauvegarde de départ, `locked` laisse l'écran du code d'accès,
// `no3d` coupe le moteur 3D (les figures restent en image fixe : utile pour des écrans reproductibles)
export async function openApp(browser, {state = {placed: true}, theme = null, width = 390, height = 844, day = 0, seed = 1, locked = false,
  reducedMotion = 'no-preference', serviceWorkers = 'block', url, context, no3d = false} = {}) {
  const ctx = context || await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    serviceWorkers, reducedMotion, timezoneId: 'Europe/Paris', locale: 'fr-FR'});
  const st = state && theme ? Object.assign({}, state, {nuit: true, theme}) : state;
  await ctx.addInitScript(initPage, {gate: locked ? null : GATE, state: st, day, seed});
  if (no3d) await ctx.route(/\/(avatar3d|spr-worker|vendor\/three\.module\.min)\.js$/, r => r.abort());
  const page = await ctx.newPage(), errors = [], notFound = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) notFound.push(r.url()); });
  await page.goto(url);
  await page.waitForFunction(() => typeof render === 'function' && document.querySelector('.view.on, #gate'));
  await page.waitForTimeout(300);
  // les fiches de figures cherchent une photo « but-<figure> » facultative : son absence est prévue
  const realNotFound = () => notFound.filter(u => !/\/photos\/but-[\w-]+\.webp$/.test(u));
  return {ctx, page, errors, realNotFound};
}

// une sauvegarde de départ : placement fait, `done` figures validées dans l'ordre de l'objectif
export const SAVE = (extra = {}) => Object.assign({countdown: 5, ms: {}, log: [], vid: {}, pg: {best: {}, wk: {}, by: {}}, placed: true}, extra);

// attend que les images de la page soient chargées ou écartées (une photo absente retire son cadre), puis une image d'écran
export const settle = page => page.waitForFunction(() => [...document.images].every(i => i.complete)).then(() => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))));
