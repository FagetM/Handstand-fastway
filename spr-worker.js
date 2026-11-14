// Fabrique les animations des nœuds hors de la page : l'écran reste fluide pendant le calcul.
// Reçoit une figure à la fois, renvoie une planche d'images WebP en grille (une image par pas de temps, COLS par ligne).
import {mount, SCRIPTS, faultScript} from "./avatar3d.js";
let A = null, size = 0;
self.onmessage = async e => {
  const {id, fit, colors, SPN, SPF, MAXF, COLS} = e.data, sc = SCRIPTS[id] || faultScript(id);
  if (!sc) { self.postMessage({id, error:"no script"}); return; }
  try {
    if (!A || size !== SPN) { size = SPN; A = mount(null, {bare:true, manual:true, yaw:-1.15, loopT:3, offscreen:{canvas:new OffscreenCanvas(SPN, SPN), w:SPN, h:SPN, colors}}); }
    const sheet = new OffscreenCanvas(COLS * SPN, Math.ceil(MAXF / COLS) * SPN), cx = sheet.getContext("2d"), dt = 1 / SPF; let n = 0, hold = -1, g = 0;
    const stillAt = sc.still || sc.s[sc.s.length - 1][0];
    const snap = () => { if (n < MAXF) { A.step(dt); if (hold < 0 && A.holding() && A.at() === stillAt) hold = n; cx.drawImage(A.canvas, (n % COLS) * SPN, Math.floor(n / COLS) * SPN, SPN, SPN); n++; } };
    A.vest(sc.vest); A.wall(sc.wall || 0); A.view(sc.yaw != null ? sc.yaw : -1.15); A.jump(sc.start || "stand"); A.set({pose:sc.start || "stand", fit, level:6}); snap(); snap();
    A.play(sc.s, !sc.cut); do { snap(); g++; } while (A.moving() && g < MAXF);
    if (!sc.cut) snap(); if (hold < 0) hold = Math.floor(n / 2);
    const out = new OffscreenCanvas(Math.min(n, COLS) * SPN, Math.ceil(n / COLS) * SPN); out.getContext("2d").drawImage(sheet, 0, 0); sheet.width = sheet.height = 0;
    const blob = await out.convertToBlob({type:"image/webp", quality:0.84});
    self.postMessage({id, blob, n, hold});
  } catch(err) { self.postMessage({id, error:String(err)}); }
};
self.postMessage({ready:true});
