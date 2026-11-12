// Personnage 3D : un mannequin articulé construit avec des formes simples, posé selon le dernier jalon validé,
// habillable (tenue choisie dans le vestiaire) et capable de fêter un passage de niveau.
// Chargé à la demande ; si WebGL ou ce module manquent, l'app garde la silhouette 2D.
import * as THREE from "./vendor/three.module.min.js";

const PI = Math.PI;
// Angles en radians. pitch : bascule du corps vers l'avant (π = tête en bas). arm / hip : flexion (négatif = vers l'avant).
// armZ / hipZ : écartement latéral. knee : flexion (positif). elbow : flexion (négatif). Valeurs à deux éléments : [gauche, droite].
const POSES = {
  stand:      {pitch:0,    arm:[0.08,0.08],   armZ:[0.13,0.13], elbow:[-0.22,-0.22], hip:[0,0],        hipZ:[0.05,0.05], knee:[0,0],     head:0},
  cheer:      {pitch:0,    arm:[-2.75,-2.75], armZ:[0.5,0.5],   elbow:[-0.25,-0.25], hip:[0,0],        hipZ:[0.12,0.12], knee:[0,0],     head:0.25},
  crouch:     {pitch:0.25, arm:[0.5,0.5],     armZ:[0.2,0.2],   elbow:[-0.7,-0.7],   hip:[-1.0,-1.0],  hipZ:[0.08,0.08], knee:[1.5,1.5], head:-0.1},
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
  pl_pike:    {pitch:1.5,  arm:[-1.12,-1.12], armZ:[0,0],       hip:[-0.28,-0.28],hipZ:[0.55,0.55], knee:[0,0],     head:-0.6},
  pl_straddle:{pitch:1.57, arm:[-1.17,-1.17], armZ:[0,0],       hip:[0,0],        hipZ:[0.6,0.6],   knee:[0,0],     head:-0.7},
  pl_full:    {pitch:1.57, arm:[-1.1,-1.1],   armZ:[0,0],       hip:[0,0],        hipZ:[0,0],       knee:[0,0],     head:-0.7},
};
const FEET = {stand:1, cheer:1, crouch:1, pl_lean:1};          // postures en appui sur les pieds (ou pieds + mains)
const KEYS = ["hands","one","pitch","roll","head","arm0","arm1","armZ0","armZ1","elbow0","elbow1","hip0","hip1","hipZ0","hipZ1","knee0","knee1"];
const flat = name => { const p = POSES[name] || POSES.stand, n = POSES[name] ? name : "stand", e = p.elbow || [0, 0];
  return {hands:FEET[n] ? 0 : 1, one:n === "oahs" ? 1 : 0, pitch:p.pitch, roll:p.roll || 0, head:p.head, arm0:p.arm[0], arm1:p.arm[1],
    armZ0:p.armZ[0], armZ1:p.armZ[1], elbow0:e[0], elbow1:e[1], hip0:p.hip[0], hip1:p.hip[1], hipZ0:p.hipZ[0], hipZ1:p.hipZ[1], knee0:p.knee[0], knee1:p.knee[1]}; };
const mix = (a, b, k) => { const o = {}; KEYS.forEach(key => o[key] = a[key] + (b[key] - a[key]) * k); return o; };
const ease = t => t*t*(3 - 2*t);

const SKIN = {s1:"#f0c8a4", s2:"#d9a074", s3:"#a86e45", s4:"#6b452b"};
const CLOTH = {w:"#f2f0ea", k:"#1d1d1b", g:"#8a8880", o:"#ff5b2e", b:"#3d5f94"};

export function mount(host){
  const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement; canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
  canvas.setAttribute("role","img");
  host.append(canvas);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a84, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(2.5, 5, 4); scene.add(sun);

  const M = n => new THREE.MeshStandardMaterial({roughness:n, metalness:0.03});
  const mSkin = M(0.6), mTop = M(0.85), mBot = M(0.85), mShoe = M(0.7), mAcc = M(0.6), mHair = M(0.9), mDark = M(0.4), mGold = M(0.35), soft = M(0.95);
  mHair.color.set("#2a211c"); mDark.color.set("#1b1b19"); mGold.color.set("#c9a227"); mGold.metalness = 0.6;
  const cap = (r, len, mat) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 18), mat);
  const ball = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), mat);
  const cyl = (r, h, mat) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat);
  const grp = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const at = (mesh, parent, x, y, z) => { mesh.position.set(x, y, z); parent.add(mesh); return mesh; };

  const pivot = grp(scene, 0, 0, 0);             // rotation à la main, rotation lente, saut
  const root = grp(pivot, 0, 0, 0);              // bassin
  const pelvis = cap(0.108, 0.13, mBot); pelvis.rotation.z = PI/2; root.add(pelvis);
  const waist = at(cap(0.118, 0.1, mSkin), root, 0, 0.16, 0);
  const torso = at(cap(0.132, 0.2, mSkin), root, 0, 0.34, 0);
  const chest = cap(0.118, 0.21, mSkin); chest.rotation.z = PI/2; at(chest, root, 0, 0.47, 0);
  const belt = at(cyl(0.136, 0.05, mAcc), root, 0, 0.09, 0);
  const medal = grp(root, 0, 0, 0);
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 8, 32), mAcc); ribbon.rotation.x = 1.15; at(ribbon, medal, 0, 0.5, 0.075);
  const coin = cyl(0.042, 0.012, mGold); coin.rotation.x = PI/2; at(coin, medal, 0, 0.385, 0.142);
  const neck = grp(root, 0, 0.6, 0);
  at(cyl(0.048, 0.1, mSkin), neck, 0, 0.03, 0);
  const head = at(ball(0.125, mSkin), neck, 0, 0.17, 0); head.scale.set(0.95, 1.05, 1);
  [-1, 1].forEach(s => at(ball(0.014, mDark), neck, s*0.045, 0.185, 0.113));
  const hairShort = new THREE.Mesh(new THREE.SphereGeometry(0.131, 28, 18, 0, 2*PI, 0, 1.25), mHair); hairShort.rotation.x = -0.45; hairShort.scale.set(0.97, 1.06, 1.02); at(hairShort, neck, 0, 0.172, -0.004);
  const bun = at(ball(0.052, mHair), neck, 0, 0.3, -0.07);
  const headband = at(cyl(0.126, 0.034, mAcc), neck, 0, 0.215, 0); headband.rotation.x = -0.12;
  const capG = grp(neck, 0, 0.19, 0);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.134, 28, 14, 0, 2*PI, 0, PI/2), mAcc); dome.scale.set(1, 0.85, 1.03); capG.add(dome);
  const brim = cyl(0.1, 0.012, mAcc); brim.scale.set(1, 1, 0.8); at(brim, capG, 0, 0.004, 0.13);
  const limbs = [0, 1].map(i => { const sx = i ? -1 : 1;
    const sh = grp(root, sx*0.215, 0.5, 0);
    const shoulder = at(ball(0.066, mSkin), sh, 0, 0, 0);
    at(cap(0.05, 0.2, mSkin), sh, 0, -0.15, 0);
    const sleeve = at(cap(0.062, 0.1, mTop), sh, 0, -0.085, 0);
    const el = grp(sh, 0, -0.3, 0);
    at(cap(0.043, 0.19, mSkin), el, 0, -0.14, 0);
    const hand = at(ball(0.052, mSkin), el, 0, -0.3, 0); hand.scale.set(0.8, 1.05, 1.15);
    at(ball(0.02, mSkin), el, sx*-0.03, -0.285, 0.035);
    const wrist = at(cyl(0.049, 0.06, mAcc), el, 0, -0.225, 0);
    const hip = grp(root, sx*0.095, -0.03, 0);
    const thigh = at(cap(0.074, 0.3, mSkin), hip, 0, -0.22, 0);
    const short = at(cap(0.084, 0.13, mBot), hip, 0, -0.12, 0);
    const kn = grp(hip, 0, -0.45, 0);
    const shin = at(cap(0.056, 0.3, mSkin), kn, 0, -0.21, 0);
    const foot = cap(0.043, 0.1, mSkin); foot.rotation.x = PI/2; at(foot, kn, 0, -0.44, 0.06);
    const sock = at(cyl(0.058, 0.09, mShoe), kn, 0, -0.36, 0);
    const sole = cap(0.05, 0.13, mShoe); sole.rotation.x = PI/2; sole.scale.set(1.1, 1, 0.62); at(sole, kn, 0, -0.465, 0.07);
    return {sx, sh, el, hip, kn, hand, shoulder, sleeve, wrist, thigh, short, shin, foot, sock, sole}; });

  // socle : disque + arc de progression vers le niveau suivant
  const base = at(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.03, 64), soft), scene, 0, -0.016, 0);
  const track = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.018, 8, 96), soft); track.rotation.x = PI/2; scene.add(track);
  const ringM = new THREE.MeshStandardMaterial({roughness:0.5});
  let arc = null;
  const setArc = frac => { if (arc) { scene.remove(arc); arc.geometry.dispose(); }
    arc = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.03, 8, 96, Math.max(0.02, Math.min(1, frac)) * 2 * PI), ringM);
    arc.rotation.x = -PI/2; arc.rotation.z = PI/2; scene.add(arc); };

  // confettis de célébration
  const NC = 110, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}), NC);
  conf.visible = false; conf.frustumCulled = false; scene.add(conf);
  const cp = Array.from({length:NC}, () => ({})), dummy = new THREE.Object3D(), cols = ["#ff5b2e","#f2f0ea","#c9a227","#3d5f94","#8a8880"];
  cp.forEach((c, i) => conf.setColorAt(i, new THREE.Color(cols[i % cols.length])));

  function dress(f){
    f = f || {};
    mSkin.color.set(SKIN[f.skin] || SKIN.s2);
    const top = f.top || "none", tk = top.split("_")[1], bot = f.bottom || "short_k", bk = bot.split("_")[1];
    const topM = top === "none" ? mSkin : mTop; if (tk) mTop.color.set(CLOTH[tk]);
    [waist, torso, chest].forEach(m => m.material = topM);
    mBot.color.set(CLOTH[bk] || CLOTH.k);
    const pants = bot.startsWith("pants");
    limbs.forEach(L => { L.sleeve.visible = top.startsWith("tee"); L.shoulder.material = top.startsWith("tee") ? mTop : mSkin;
      L.thigh.material = pants ? mBot : mSkin; L.shin.material = pants ? mBot : mSkin; L.short.visible = !pants;
      L.wrist.visible = f.wrists === "wraps";
      L.sock.visible = f.feet === "socks" || f.feet === "shoes"; L.sole.visible = f.feet === "shoes"; L.foot.visible = f.feet !== "shoes"; L.foot.material = f.feet === "socks" ? mShoe : mSkin; });
    mShoe.color.set(f.feet === "shoes" ? "#2b2b29" : "#f2f0ea");
    hairShort.visible = f.hair === "short" || f.hair === "bun"; bun.visible = f.hair === "bun" && f.head !== "cap";
    headband.visible = f.head === "band"; capG.visible = f.head === "cap";
    belt.visible = f.extra === "belt"; medal.visible = f.extra === "medal";
  }
  function colors(){ const a = cssv("--acc") || "#ff5b2e"; mAcc.color.set(a); ringM.color.set(a); soft.color.set(cssv("--line") || "#2c2c29"); }

  let cur = flat("stand"), from = cur, to = cur, t = 1, yaw = -0.9, spin = true, scale = 1, jump = 0, extraYaw = 0;
  const box = new THREE.Box3(), hb = new THREE.Box3(), tmp = new THREE.Vector3();
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function apply(p, breath){
    root.rotation.set(p.pitch, 0, p.roll); neck.rotation.x = p.head;
    limbs.forEach((L, i) => {
      L.sh.rotation.set(p["arm" + i], 0, L.sx * p["armZ" + i]); L.el.rotation.x = p["elbow" + i];
      L.hip.rotation.set(p["hip" + i], 0, L.sx * p["hipZ" + i]); L.kn.rotation.x = p["knee" + i]; });
    torso.scale.set(1 + breath, 1, 1 + breath); chest.scale.set(1, 1 + breath, 1 + breath);
    root.position.set(0, 0, 0); pivot.position.y = 0; pivot.scale.setScalar(scale); pivot.rotation.y = yaw + extraYaw; pivot.updateMatrixWorld(true);
    box.setFromObject(root); let low = box.min.y;
    if (p.hands > 0.5) { low = Infinity; limbs.forEach(L => { if (L.sx > 0 || p.one < 0.5) low = Math.min(low, hb.setFromObject(L.hand).min.y); }); }
    tmp.set((box.min.x + box.max.x) / 2, 0, (box.min.z + box.max.z) / 2); pivot.worldToLocal(tmp);
    root.position.set(-tmp.x, -low / scale, -tmp.z);                         // l'appui touche le socle, le corps est centré dessus
    pivot.position.y = jump;
  }
  function size(){ const w = host.clientWidth || 300, h = host.clientHeight || 240; renderer.setSize(w, h, false); cam.aspect = w / h;
    cam.position.set(0, 1.3, 5.6); cam.lookAt(0, 0.98, 0); cam.updateProjectionMatrix(); }

  // célébration : flexion, saut bras levés avec un tour sur soi, confettis, puis retour à la posture
  let party = null, pending = false, restPose = "stand";
  function startParty(){
    pending = false; party = {t:0};
    cp.forEach(c => { const a = Math.random() * 2 * PI, r = 0.5 + Math.random() * 1.4;
      c.x = 0; c.y = 1.1 + Math.random() * 0.5; c.z = 0; c.vx = Math.cos(a) * r; c.vz = Math.sin(a) * r; c.vy = 2.2 + Math.random() * 2.4;
      c.rx = Math.random() * 6; c.ry = Math.random() * 6; c.sp = 3 + Math.random() * 6; });
    conf.visible = true; kick();
  }
  function partyStep(dt){
    const T = party.t += dt, D = 3.0, A = flat("crouch"), B = flat("cheer"), R = flat(restPose);
    if (T < 0.35) cur = mix(R, A, ease(T / 0.35));
    else if (T < 0.7) cur = mix(A, B, ease((T - 0.35) / 0.35));
    else if (T < 2.3) cur = B;
    else cur = mix(B, R, ease(Math.min(1, (T - 2.3) / 0.7)));
    const j = T < 0.5 ? 0 : T < 1.4 ? Math.sin((T - 0.5) / 0.9 * PI) * 0.42 : T < 2.0 ? Math.sin((T - 1.4) / 0.6 * PI) * 0.2 : 0; jump = j;
    extraYaw = T < 0.5 ? 0 : T < 1.4 ? ease((T - 0.5) / 0.9) * 2 * PI : 0;
    arc.scale.setScalar(1 + Math.sin(Math.min(1, T / 1.2) * PI) * 0.08); track.scale.copy(arc.scale);
    cp.forEach((c, i) => { c.vy -= 5.5 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; if (c.y < 0.02) { c.y = 0.02; c.vx *= 0.8; c.vz *= 0.8; c.vy = 0; }
      dummy.position.set(c.x, c.y, c.z); dummy.rotation.set(c.rx + T * c.sp, c.ry + T * c.sp * 0.7, 0); dummy.scale.setScalar(T > 2.4 ? Math.max(0, 1 - (T - 2.4) / 0.6) : 1); dummy.updateMatrix(); conf.setMatrixAt(i, dummy.matrix); });
    conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true;
    if (T >= D) { party = null; conf.visible = false; jump = 0; extraYaw = 0; arc.scale.setScalar(1); track.scale.setScalar(1); cur = R; from = R; to = R; t = 1; }
  }

  let last = performance.now(), visible = true, raf = 0, dirty = true, drag = null;
  function frame(now){
    raf = 0; const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (party) { partyStep(dt); dirty = true; }
    else if (t < 1) { t = Math.min(1, t + dt / 0.9); cur = mix(from, to, ease(t)); dirty = true; }
    if (spin && !reduce && !drag && !party) { yaw += dt * 0.25; dirty = true; }
    const breath = reduce ? 0 : Math.sin(now / 900) * 0.012;
    if (dirty || !reduce) { apply(cur, breath); renderer.render(scene, cam); dirty = false; }
    if (visible && (!reduce || t < 1 || party)) raf = requestAnimationFrame(frame);
  }
  const kick = () => { dirty = true; if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  canvas.addEventListener("pointerdown", e => { drag = {x:e.clientX, yaw, moved:false}; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", e => { if (drag) { if (Math.abs(e.clientX - drag.x) > 4) { drag.moved = true; spin = false; } yaw = drag.yaw + (e.clientX - drag.x) * 0.012; kick(); } });
  canvas.addEventListener("pointerup", () => { const tap = drag && !drag.moved; drag = null; canvas.style.cursor = "grab"; if (tap && !party) startParty(); });
  canvas.addEventListener("pointercancel", () => { drag = null; canvas.style.cursor = "grab"; });
  if (window.ResizeObserver) new ResizeObserver(() => { size(); kick(); }).observe(host);
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { if (pending) startParty(); kick(); } }).observe(host);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) kick(); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { colors(); kick(); });
  colors(); size(); setArc(0); dress({});

  return {
    // pose : clé de POSES · frac : progression vers le niveau suivant (0 à 1) · level : niveau · fit : tenue choisie
    set({pose, frac, level, fit, label}){
      restPose = POSES[pose] ? pose : "stand";
      const target = flat(restPose);
      if (!party && KEYS.some(k => Math.abs(target[k] - to[k]) > 1e-4)) { from = cur; to = target; t = 0; }
      setArc(frac || 0);
      scale = 0.9 + Math.min(10, (level || 1) - 1) * 0.012;                   // le personnage grandit légèrement avec le niveau
      dress(fit); if (label) canvas.setAttribute("aria-label", label);
      colors(); kick();
    },
    // joue la célébration dès que le personnage est à l'écran
    celebrate(){ const r = host.getBoundingClientRect(); if (visible && r.width && r.bottom > 0 && r.top < innerHeight && !document.hidden) startParty(); else pending = true; },
    poses: Object.keys(POSES),
  };
}
