// Personnage 3D : un mannequin articulé construit avec des formes simples, posé selon le dernier jalon validé.
// Chargé à la demande ; si WebGL ou ce module manquent, l'app garde la silhouette 2D.
import * as THREE from "./vendor/three.module.min.js";

const PI = Math.PI;
// Angles en radians. pitch : bascule du corps vers l'avant (π = tête en bas). arm / hip : flexion (négatif = vers l'avant).
// armZ / hipZ : écartement latéral. knee, elbow : flexion. Les valeurs à deux éléments sont [gauche, droite].
const POSES = {
  stand:      {pitch:0,    arm:[0.06,0.06],   armZ:[0.14,0.14], hip:[0,0],        hipZ:[0.05,0.05], knee:[0,0],     head:0},
  hs:         {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[0,0],        hipZ:[0,0],       knee:[0,0],     head:-0.35},
  hs_split:   {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[-0.75,0.75], hipZ:[0,0],       knee:[0,0],     head:-0.35},
  hs_straddle:{pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[0,0],        hipZ:[0.7,0.7],   knee:[0,0],     head:-0.35},
  hs_tuck:    {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[-1.9,-1.9],  hipZ:[0,0],       knee:[2.1,2.1], head:-0.35},
  hs_seven1:  {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[-1.57,0],    hipZ:[0,0],       knee:[0,0],     head:-0.35},
  hs_seven:   {pitch:PI,   arm:[-PI,-PI],     armZ:[0,0],       hip:[-1.57,-1.57],hipZ:[0,0],       knee:[0,0],     head:-0.35},
  oahs:       {pitch:PI,   arm:[-PI,-0.2],    armZ:[0,1.35],    hip:[0,0],        hipZ:[0.55,0.55], knee:[0,0],     head:-0.3, roll:0.1},
  pl_lean:    {pitch:1.17, arm:[-0.85,-0.85], armZ:[0,0],       hip:[0,0],        hipZ:[0,0],       knee:[0,0],     head:-0.5},
  pl_tuck:    {pitch:1.3,  arm:[-1.15,-1.15], armZ:[0,0],       hip:[-2.35,-2.35],hipZ:[0,0],       knee:[2.5,2.5], head:-0.5},
  pl_adv:     {pitch:1.5,  arm:[-1.25,-1.25], armZ:[0,0],       hip:[-1.55,-1.55],hipZ:[0,0],       knee:[2.0,2.0], head:-0.6},
  pl_frog:    {pitch:1.5,  arm:[-1.2,-1.2],   armZ:[0,0],       hip:[-0.9,-0.9],  hipZ:[0.55,0.55], knee:[1.7,1.7], head:-0.6},
  pl_pike:    {pitch:1.5,  arm:[-1.12,-1.12], armZ:[0,0],       hip:[-0.28,-0.28],  hipZ:[0.55,0.55], knee:[0,0],     head:-0.6},
  pl_straddle:{pitch:1.57, arm:[-1.17,-1.17], armZ:[0,0],       hip:[0,0],        hipZ:[0.6,0.6],   knee:[0,0],     head:-0.7},
  pl_full:    {pitch:1.57, arm:[-1.1,-1.1],   armZ:[0,0],       hip:[0,0],        hipZ:[0,0],       knee:[0,0],     head:-0.7},
};
const KEYS = ["hands","one","pitch","roll","head","arm0","arm1","armZ0","armZ1","hip0","hip1","hipZ0","hipZ1","knee0","knee1"];
const flat = (p, name) => ({hands:name && name !== "stand" && name !== "pl_lean" ? 1 : 0, one:name === "oahs" ? 1 : 0, pitch:p.pitch, roll:p.roll || 0, head:p.head, arm0:p.arm[0], arm1:p.arm[1], armZ0:p.armZ[0], armZ1:p.armZ[1],
  hip0:p.hip[0], hip1:p.hip[1], hipZ0:p.hipZ[0], hipZ1:p.hipZ[1], knee0:p.knee[0], knee1:p.knee[1]});

export function mount(host){
  const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement; canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
  canvas.setAttribute("role","img");
  host.append(canvas);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777770, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8); sun.position.set(2.5, 5, 4); scene.add(sun);

  const body = new THREE.MeshStandardMaterial({roughness:0.62, metalness:0.05});
  const acc = new THREE.MeshStandardMaterial({roughness:0.5, metalness:0.05});
  const soft = new THREE.MeshStandardMaterial({roughness:0.9, metalness:0});
  const cap = (r, len, mat) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), mat);
  const ball = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);
  const band = (r, h) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), acc);
  const grp = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

  const pivot = grp(scene, 0, 0, 0);            // rotation à la main et rotation lente
  const root = grp(pivot, 0, 0, 0);             // bassin
  const hipsM = cap(0.105, 0.13, body); hipsM.rotation.z = PI/2; root.add(hipsM);
  const torso = cap(0.135, 0.3, body); torso.position.y = 0.29; root.add(torso);
  const chest = cap(0.12, 0.2, body); chest.rotation.z = PI/2; chest.position.y = 0.47; root.add(chest);
  const belt = band(0.142, 0.05); belt.position.y = 0.1; root.add(belt);
  const neck = grp(root, 0, 0.6, 0);
  const head = ball(0.125, body); head.position.y = 0.17; neck.add(head);
  const headband = band(0.128, 0.035); headband.position.y = 0.2; neck.add(headband);
  const limbs = [0, 1].map(i => { const sx = i ? -1 : 1;
    const sh = grp(root, sx*0.215, 0.5, 0);
    const up = cap(0.052, 0.2, body); up.position.y = -0.15; sh.add(up);
    const el = grp(sh, 0, -0.3, 0);
    const fo = cap(0.045, 0.19, body); fo.position.y = -0.14; el.add(fo);
    const hand = ball(0.055, body); hand.position.y = -0.3; hand.scale.set(1, 0.7, 1.15); el.add(hand);
    const wrist = band(0.05, 0.05); wrist.position.y = -0.235; el.add(wrist);
    const hip = grp(root, sx*0.095, -0.03, 0);
    const th = cap(0.075, 0.3, body); th.position.y = -0.22; hip.add(th);
    const kn = grp(hip, 0, -0.45, 0);
    const shn = cap(0.058, 0.3, body); shn.position.y = -0.21; kn.add(shn);
    const foot = cap(0.045, 0.1, body); foot.rotation.x = PI/2; foot.position.set(0, -0.44, 0.06); kn.add(foot);
    const ankle = band(0.06, 0.04); ankle.position.y = -0.37; kn.add(ankle);
    return {sx, sh, el, hip, kn, wrist, ankle, hand}; });

  // socle : disque + arc de progression vers le niveau suivant
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.03, 64), soft); base.position.y = -0.016; scene.add(base);
  const track = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.018, 8, 96), soft); track.rotation.x = PI/2; scene.add(track);
  let arc = null;
  const setArc = frac => { if (arc) { scene.remove(arc); arc.geometry.dispose(); }
    arc = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.03, 8, 96, Math.max(0.02, Math.min(1, frac)) * 2 * PI), acc);
    arc.rotation.x = -PI/2; arc.rotation.z = PI/2; scene.add(arc); };

  let cur = flat(POSES.stand, "stand"), from = cur, to = cur, t = 1, yaw = -0.9, spin = true, scale = 1, box = new THREE.Box3(), hb = new THREE.Box3();
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function apply(p, breath){
    root.rotation.set(p.pitch, 0, p.roll); neck.rotation.x = p.head;
    limbs.forEach((L, i) => {
      L.sh.rotation.set(p["arm" + i], 0, L.sx * p["armZ" + i]); L.el.rotation.x = 0;
      L.hip.rotation.set(p["hip" + i], 0, L.sx * p["hipZ" + i]); L.kn.rotation.x = p["knee" + i]; });
    torso.scale.set(1 + breath, 1, 1 + breath); chest.scale.set(1, 1 + breath, 1 + breath);
    root.position.set(0, 0, 0); pivot.scale.setScalar(scale); pivot.updateMatrixWorld(true);
    box.setFromObject(root); let low = box.min.y;
    if (p.hands) { low = Infinity; limbs.forEach(L => { if (L.sx > 0 || !p.one) low = Math.min(low, hb.setFromObject(L.hand).min.y); }); }
    root.position.y = -low / scale;                                            // l'appui (mains, ou point le plus bas) touche le socle
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
    const c = new THREE.Vector3(cx, 0, cz); pivot.worldToLocal(c); root.position.x -= c.x; root.position.z -= c.z;
  }
  function colors(){
    body.color.set(cssv("--txt") || "#f2f0ea"); acc.color.set(cssv("--acc") || "#ff5b2e"); soft.color.set(cssv("--line") || "#2c2c29");
  }
  function size(){ const w = host.clientWidth || 300, h = host.clientHeight || 240; renderer.setSize(w, h, false); cam.aspect = w / h;
    cam.position.set(0, 1.3, 5.6); cam.lookAt(0, 0.98, 0); cam.updateProjectionMatrix(); }
  let last = performance.now(), visible = true, raf = 0, dirty = true;
  function frame(now){
    raf = 0; const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (t < 1) { t = Math.min(1, t + dt / 0.9); const k = t*t*(3 - 2*t); cur = {}; KEYS.forEach(key => cur[key] = from[key] + (to[key] - from[key]) * k); dirty = true; }
    if (spin && !reduce && !drag) { yaw += dt * 0.25; dirty = true; }
    const breath = reduce ? 0 : Math.sin(now / 900) * 0.012;
    if (dirty || !reduce) { pivot.rotation.y = yaw; apply(cur, breath); renderer.render(scene, cam); dirty = false; }
    if (visible && (!reduce || t < 1)) raf = requestAnimationFrame(frame);
  }
  const kick = () => { dirty = true; if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  let drag = null;
  canvas.addEventListener("pointerdown", e => { drag = {x:e.clientX, yaw}; spin = false; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", e => { if (drag) { yaw = drag.yaw + (e.clientX - drag.x) * 0.012; kick(); } });
  const end = () => { drag = null; canvas.style.cursor = "grab"; };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
  if (window.ResizeObserver) new ResizeObserver(() => { size(); kick(); }).observe(host);
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(host);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) kick(); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { colors(); kick(); });
  colors(); size(); setArc(0);

  return {
    // pose : clé de POSES · frac : progression vers le niveau suivant (0 à 1) · rank : rang (0 à 7) · level : niveau
    set({pose, frac, rank, level, label}){
      const target = flat(POSES[pose] || POSES.stand, POSES[pose] ? pose : "stand");
      if (KEYS.some(k => Math.abs(target[k] - to[k]) > 1e-4)) { from = cur; to = target; t = 0; }
      setArc(frac || 0);
      scale = 0.9 + Math.min(10, (level || 1) - 1) * 0.012;                  // le personnage grandit légèrement avec le niveau
      limbs.forEach(L => { L.wrist.visible = rank >= 1; L.ankle.visible = rank >= 4; });
      belt.visible = rank >= 2; headband.visible = rank >= 3;
      if (label) canvas.setAttribute("aria-label", label);
      colors(); kick();
    },
    poses: Object.keys(POSES),
  };
}
