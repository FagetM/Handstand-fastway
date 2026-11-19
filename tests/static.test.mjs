// Vérifications sans navigateur : syntaxe, fichiers mis en cache pour le hors-ligne, CSS sans règle morte, README à jour.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { ROOT } from './helpers.mjs';

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const jsFiles = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f);
const html = read('index.html'), sw = read('sw.js'), css = read('css/app.css');
const CORE = JSON.parse(sw.match(/const CORE = (\[[\s\S]*?\]);/)[1]);
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);

test('chaque script classique de js/ se lit sans erreur de syntaxe', () => {
  for (const f of jsFiles) assert.doesNotThrow(() => new vm.Script(read(f), {filename: f}), f);
});

test('les modules (avatar3d.js, spr-worker.js) se lisent sans erreur de syntaxe', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-mod-'));
  for (const f of ['avatar3d.js', 'spr-worker.js']) {
    const tmp = path.join(dir, f.replace(/\.js$/, '.mjs')); fs.writeFileSync(tmp, read(f));
    const r = spawnSync(process.execPath, ['--check', tmp], {encoding: 'utf8'});
    assert.equal(r.status, 0, f + '\n' + r.stderr);
  }
  fs.rmSync(dir, {recursive: true, force: true});
});

test('la page charge tous les scripts de js/, et chacun existe', () => {
  for (const s of scripts) assert.ok(fs.existsSync(path.join(ROOT, s)), s + ' manque');
  for (const f of jsFiles) assert.ok(scripts.includes(f), f + ' n’est pas chargé par index.html');
  assert.equal(scripts[scripts.length - 1], 'js/main.js', 'main.js lance l’app : il doit être chargé en dernier');
});

test('hors connexion : le service worker garde la page, le style et tous les scripts', () => {
  for (const f of CORE) if (f !== './') assert.ok(fs.existsSync(path.join(ROOT, f)), 'fichier du cache introuvable : ' + f);
  for (const f of ['index.html', 'css/app.css', 'manifest.webmanifest', 'avatar3d.js', 'spr-worker.js', 'vendor/three.module.min.js', ...scripts])
    assert.ok(CORE.includes(f), f + ' n’est pas dans CORE (sw.js) : il manquerait hors connexion');
  assert.match(sw, /const CACHE = "hs-fastway-v\d+"/);
});

test('le manifeste pointe vers des icônes qui existent', () => {
  const man = JSON.parse(read('manifest.webmanifest'));
  for (const i of man.icons || []) assert.ok(fs.existsSync(path.join(ROOT, i.src)), i.src);
});

test('index.html n’a pas deux éléments avec le même id', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  assert.deepEqual(dup, []);
});

test('le CSS ne garde pas de règle pour une classe que rien n’utilise', () => {
  const src = jsFiles.map(read).join('\n') + html + read('avatar3d.js');
  // classes fabriquées par concaténation dans le code : on vérifie le préfixe
  const DYNAMIC = [/^lg-/];
  const classes = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\([^)]*\)/g, '').matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)].map(m => m[1]).filter(c => !/^\d/.test(c)));
  const dead = [...classes].filter(c => !DYNAMIC.some(r => r.test(c)) && !new RegExp('(^|[^\\w-])' + c.replace(/-/g, '\\-') + '($|[^\\w-])').test(src));
  assert.deepEqual(dead, [], 'classes sans usage : retire leurs règles, ou ajoute leur préfixe à DYNAMIC si elles sont fabriquées');
});

test('le CSS n’a pas d’animation @keyframes inutilisée', () => {
  const names = [...css.matchAll(/@keyframes ([\w-]+)/g)].map(m => m[1]);
  const unused = names.filter(n => !new RegExp('animation(-name)?\\s*:[^;}]*\\b' + n + '\\b').test(css));
  assert.deepEqual(unused, []);
});

test('le README décrit chaque fichier de js/', () => {
  const readme = read('README.md');
  for (const f of jsFiles) assert.ok(readme.includes('`' + f + '`'), f + ' absent du tableau du README');
});
