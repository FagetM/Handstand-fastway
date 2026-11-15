// ---------- Le ciel : une carte d’étoiles, partagée par Apprendre et le Parcours ----------
// Le moteur ne sait rien des leçons ni des figures : on lui donne des étoiles, des fils, des secteurs ; il dessine, déplace et zoome.
// o = {key, W, sectors:[{name,col,a0,a1,nameR,arcR,neb:[x,y,r]}], seps:[{a,r0,r1}], rings:[{r,col,op,dash,name,at}], paths:[{d,col,lit}], links:[{d,col,lit}],
//      dots:[{x,y,r,col}], nodes:[{x,y,col,cls,html,name,side,aria,tap,bg}], labels:[{x,y,col,text,tap}], center:{big,small}, panel:{head,sub,rows:[{name,col,p,title}]},
//      view:{get,set}, kMin, focus:[x,y], k0, far}
const f0 = x => x.toFixed(0);
function skyMap(o){
  const W = o.W, C = W / 2, K = o.key, wrap = el("div","cst"), world = el("div","cstw"); world.style.width = world.style.height = W + "px"; wrap.append(world);
  const P = (r, t) => f0(C + Math.cos(t) * r) + " " + f0(C + Math.sin(t) * r);
  const arc = (r, a0, a1) => "M" + P(r, a0) + "A" + r + " " + r + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + P(r, a1);
  const arcBack = (r, a0, a1) => "M" + P(r, a1) + "A" + r + " " + r + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 0 " + P(r, a0);
  const defs = ['<filter id="' + K + 'g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>'], bg = [], glow = [], fg = [];
  // poussière d’étoiles, toujours la même (pseudo-hasard fixe), plus dense quand le ciel est grand
  let sd = 7; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  for (let i = 0, N = Math.min(600, Math.round(170 * (W / 1440) ** 2)); i < N; i++) bg.push('<circle cx="' + f0(rnd() * W) + '" cy="' + f0(rnd() * W) + '" r="' + (rnd() * 1.4 + 0.3).toFixed(1) + '" fill="#fff" opacity="' + (rnd() * 0.5 + 0.15).toFixed(2) + '"/>');
  // les secteurs : une nébuleuse, un arc, et le nom courbé le long du bord (toujours à l’endroit)
  (o.sectors || []).forEach((s, i) => { const am = (s.a0 + s.a1) / 2, id = K + "s" + i;
    if (s.neb) { defs.push('<radialGradient id="' + id + 'n"><stop offset="0" stop-color="' + s.col + '" stop-opacity=".22"/><stop offset="1" stop-color="' + s.col + '" stop-opacity="0"/></radialGradient>');
      bg.push('<circle cx="' + f0(s.neb[0]) + '" cy="' + f0(s.neb[1]) + '" r="' + f0(s.neb[2]) + '" fill="url(#' + id + 'n)"/>'); }
    fg.push('<path d="' + arc(s.arcR, s.a0, s.a1) + '" stroke="' + s.col + '" stroke-width="2" fill="none" opacity=".5"/>');
    const low = Math.sin(am) > 0.2; defs.push('<path id="' + id + '" d="' + (low ? arcBack(s.nameR + 24, s.a0, s.a1) : arc(s.nameR, s.a0, s.a1)) + '"/>');
    fg.push('<text class="csts" fill="' + s.col + '" text-anchor="middle"><textPath href="#' + id + '" startOffset="50%">' + s.name.toUpperCase() + '</textPath></text>'); });
  (o.seps || []).forEach(s => bg.push('<line x1="' + f0(C + Math.cos(s.a) * s.r0) + '" y1="' + f0(C + Math.sin(s.a) * s.r0) + '" x2="' + f0(C + Math.cos(s.a) * s.r1) + '" y2="' + f0(C + Math.sin(s.a) * s.r1) + '" stroke="#8a84a3" stroke-opacity=".22" stroke-width="1.5" stroke-dasharray="2 9"/>'));
  // les orbites (le cercle central, les étages) ; leur nom se pose dans le plus grand vide de l’orbite
  (o.rings || []).forEach((r, i) => { bg.push('<circle cx="' + C + '" cy="' + C + '" r="' + r.r + '" fill="none" stroke="' + (r.col || "#8a84a3") + '" stroke-opacity="' + (r.op || .2) + '" stroke-width="' + (r.w || 1.5) + '"' + (r.dash ? ' stroke-dasharray="' + r.dash + '"' : "") + '/>');
    if (r.name) { const id = K + "r" + i, t = r.at, low = Math.sin(t) > 0.2, d = 0.5 * 260 / r.r; defs.push('<path id="' + id + '" d="' + (low ? arcBack(r.r + 14, t - d, t + d) : arc(r.r - 6, t - d, t + d)) + '"/>');
      fg.push('<text class="cstr" fill="' + (r.col || "#c9c3dc") + '" text-anchor="middle"><textPath href="#' + id + '" startOffset="50%">' + r.name + '</textPath></text>'); } });
  (o.links || []).forEach(l => bg.push('<path d="' + l.d + '" stroke="' + (l.lit ? l.col : "#8a84a3") + '" stroke-width="1.2" fill="none" stroke-dasharray="2 5" opacity="' + (l.lit ? .8 : .35) + '"/>'));
  // les fils : allumés (avec un halo) quand le chemin est ouvert, en pointillé pâle sinon
  (o.paths || []).forEach(p => { if (p.lit) glow.push('<path d="' + p.d + '" stroke="' + p.col + '" stroke-width="7" fill="none" opacity=".5" filter="url(#' + K + 'g)"/>');
    fg.push('<path d="' + p.d + '" stroke="' + (p.lit ? p.col : "#6e6884") + '" stroke-width="' + (p.lit ? 2.6 : 1.6) + '" fill="none" stroke-linecap="round"' + (p.lit ? "" : ' stroke-dasharray="1 6" opacity=".8"') + '/>'); });
  (o.dots || []).forEach(d => fg.push('<circle cx="' + f0(d.x) + '" cy="' + f0(d.y) + '" r="' + d.r + '" fill="' + d.col + '"/>'));
  world.insertAdjacentHTML("beforeend", '<svg class="cste" viewBox="0 0 ' + W + ' ' + W + '" width="' + W + '" height="' + W + '" aria-hidden="true"><defs>' + defs.join("") + '</defs>' + bg.join("") + glow.join("") + fg.join("") + '</svg>');
  // le cœur
  if (o.center) { const h = el("div","csth"); h.style.left = h.style.top = C + "px"; h.append(el("b",null, o.center.big), el("span",null, o.center.small)); world.append(h); }
  (o.labels || []).forEach(l => { const t = el("button","cstv", l.text); t.style.left = l.x + "px"; t.style.top = l.y + "px"; t.style.color = l.col;
    t.onclick = () => { if (!wrap.dataset.moved) l.tap(); }; world.append(t); });
  (o.nodes || []).forEach(n => { const b = el("button","cstn " + n.cls); b.style.left = n.x + "px"; b.style.top = n.y + "px"; b.style.setProperty("--c", n.col);
    if (n.bg) b.style.backgroundImage = "url(" + n.bg + ")"; b.innerHTML = n.html || "";
    // le nom se pose du côté indiqué (l’extérieur du zigzag, ou sous l’étoile), jamais sur le fil
    const nm = el("i",null, n.name), R = (/\bmaj\b/.test(n.cls) ? 30 : 22) + 6, [sx, sy] = n.side || [0, 1], ax = sx > .35 ? 0 : sx < -.35 ? -100 : -50, ay = sy > .35 ? 0 : sy < -.35 ? -100 : -50;
    nm.style.left = "calc(50% + " + f0(sx * R) + "px)"; nm.style.top = "calc(50% + " + f0(sy * R) + "px)"; nm.style.transform = "translate(" + ax + "%," + ay + "%)"; nm.style.textAlign = ax === 0 ? "left" : ax === -100 ? "right" : "center"; b.append(nm);
    b.setAttribute("aria-label", n.aria || n.name); b.onclick = () => { if (!wrap.dataset.moved) n.tap(); }; world.append(b); });
  // le panneau de bord : le total, et une jauge par secteur
  if (o.panel) { const pn = el("div","cstp"), hd = el("div","cstph"); pn.setAttribute("aria-hidden","true"); hd.append(el("b",null, o.panel.head), el("span",null, o.panel.sub)); pn.append(hd);
    o.panel.rows.forEach(r => { const x = el("div","cstpr"), bar = el("i"); x.style.setProperty("--c", r.col); bar.style.setProperty("--p", r.p); x.title = r.title || r.name; x.append(el("span",null, r.name), bar); pn.append(x); });
    wrap.append(pn); }
  // déplacer au doigt, zoomer à deux doigts ou à la molette ; boutons + − ⤢ ; de loin, seuls les grands noms restent
  const kMin = o.kMin || 0.25, st0 = o.view.get(); let k = st0 ? st0.k : 0, tx = st0 ? st0.x : 0, ty = st0 ? st0.y : 0; const pts = new Map(); let base = null;
  const apply = () => { world.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + k + ")"; wrap.classList.toggle("far", k < (o.far || 0)); };
  const keep = () => o.view.set({k, x:tx, y:ty});
  const zoomAt = (f, cx, cy) => { const nk = Math.max(kMin, Math.min(1.6, k * f)); tx = cx - (cx - tx) * nk / k; ty = cy - (cy - ty) * nk / k; k = nk; apply(); keep(); };
  const fit = () => { const w = wrap.clientWidth || 360, h = wrap.clientHeight || 520; k = Math.max(kMin, Math.min(w, h) / W * 0.98); tx = (w - W * k) / 2; ty = (h - W * k) / 2; apply(); keep(); };
  wrap.addEventListener("pointerdown", e => { pts.set(e.pointerId, [e.clientX, e.clientY]); wrap.dataset.moved = ""; base = {tx, ty, k, p:[...pts.values()]}; });
  wrap.addEventListener("pointermove", e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]); const Q = [...pts.values()];
    if (Q.length === 1 && base.p.length === 1) { const dx = Q[0][0] - base.p[0][0], dy = Q[0][1] - base.p[0][1]; if (Math.hypot(dx, dy) > 6) { wrap.dataset.moved = "1"; wrap.setPointerCapture(e.pointerId); } if (wrap.dataset.moved) { tx = base.tx + dx; ty = base.ty + dy; apply(); } }
    else if (Q.length === 2 && base.p.length === 2) { wrap.dataset.moved = "1"; const d0 = Math.hypot(base.p[0][0] - base.p[1][0], base.p[0][1] - base.p[1][1]), d1 = Math.hypot(Q[0][0] - Q[1][0], Q[0][1] - Q[1][1]), r = wrap.getBoundingClientRect();
      const cx = (Q[0][0] + Q[1][0]) / 2 - r.left, cy = (Q[0][1] + Q[1][1]) / 2 - r.top; k = base.k; tx = base.tx; ty = base.ty; zoomAt(d1 / d0, cx, cy); } });
  const up = e => { pts.delete(e.pointerId); base = {tx, ty, k, p:[...pts.values()]}; keep(); if (!pts.size) setTimeout(() => { wrap.dataset.moved = ""; }, 30); };
  wrap.addEventListener("pointerup", up); wrap.addEventListener("pointercancel", up);
  wrap.addEventListener("wheel", e => { e.preventDefault(); const r = wrap.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, {passive:false});
  const zb = el("div","cstz"), zp = el("button",null,"+"), zm = el("button",null,"−"), zf = el("button",null,"⤢");
  zp.setAttribute("aria-label","Zoomer"); zm.setAttribute("aria-label","Dézoomer"); zf.setAttribute("aria-label","Tout voir");
  zp.onclick = () => zoomAt(1.25, wrap.clientWidth / 2, wrap.clientHeight / 2); zm.onclick = () => zoomAt(0.8, wrap.clientWidth / 2, wrap.clientHeight / 2); zf.onclick = fit;
  zb.append(zp, zm, zf); wrap.append(zb);
  // se poser sur un point du ciel (la prochaine étoile, par défaut)
  wrap.goTo = (x, y, nk) => { const w = wrap.clientWidth || 360, h = wrap.clientHeight || 520; k = nk || o.k0 || 0.62; tx = w / 2 - x * k; ty = h / 2 - y * k; apply(); keep(); };
  requestAnimationFrame(() => { if (st0 && st0.k) apply(); else wrap.goTo(o.focus ? o.focus[0] : C, o.focus ? o.focus[1] : C); });
  return wrap;
}
// le plein écran : un titre et une ligne qui flottent en haut, un bouton pour revenir à l’autre vue
function skyFull(w, title, sub, btn, flip){ const top = el("div","csttop"), t = el("div"), tg = el("button","cstl", btn); w.classList.add("full");
  t.append(el("h2",null,title), el("span",null, sub)); tg.onclick = flip; top.append(t, tg); w.append(top); return w; }

// ---------- Le Parcours en constellation ----------
// Analogie : une galaxie. Au centre, toi ; le tronc commun s’enroule autour en spirale (Fondations, Départ, Débutant 1 et 2, Intermédiaire) ;
// au-delà, chaque discipline est un secteur où ses figures serpentent vers l’extérieur ; tout autour, la couronne du combo ultime.
const SKY_COL = {trunk:"#efe3c6", onearm:"#e2b04a", planche:"#5cc2b3", press:"#a98be6", low:"#e8a0b0", ultime:"#ffd27a"};
const SKY_TRUNK = ["base","starter","b1","b2","inter"], SKY_HARD = ["onearm","planche","press","low"];
const SKY_MAJ = new Set(["fd_dips","st_bail30","b1_free5","in_str60","oa_oahs","oa_oahs10","pl_tuck","pl_straddle","pl_full","pr_lsit","pr_stalder","pr_manna","ul_full"]);
const cmean = as => Math.atan2(as.reduce((s, a) => s + Math.sin(a), 0), as.reduce((s, a) => s + Math.cos(a), 0));
// ordre de marche : l’ordre du parcours, chaque figure après ses prérequis
const skyOrder = ms => { const ids = ms.map(m => m.id), set = new Set(ids), out = [], seen = new Set(), go = id => { if (seen.has(id)) return; seen.add(id); (MS[id].req || []).filter(r => set.has(r)).forEach(go); out.push(id); }; ids.forEach(go); return out; };
function skyLayout(){
  if (skyLayout.v) return skyLayout.v;   // la forme du ciel ne dépend que de l’arbre : calculée une fois
  const ang = {}, rad = {}, secOf = {}, wedge = {}, order = []; TREE.forEach(s => s.ms.forEach(m => { secOf[m.id] = s.id; }));
  // le cœur : le tronc commun s’enroule en spirale depuis le centre, dans l’ordre du parcours (une étoile tous les 120 px)
  let t = -Math.PI / 2, r = 175; const B = 120 / (2 * Math.PI);
  SKY_TRUNK.forEach(sid => { skyOrder(SEC[sid].ms).forEach((id, i) => { order.push(id); ang[id] = t; rad[id] = r; const dt = 122 / r; t += dt; r += B * dt; }); });
  const R0 = r + 150, ROW = 150;
  // les disciplines : un secteur chacune, large selon son nombre de figures ; dedans, les figures serpentent rang après rang
  const wt = SKY_HARD.map(sid => Math.max(7, SEC[sid].ms.length)), tot = wt.reduce((x, y) => x + y, 0); let a = -Math.PI / 2 - Math.PI * wt[0] / tot;
  SKY_HARD.forEach((sid, i) => { const w = 2 * Math.PI * wt[i] / tot; wedge[sid] = [a, a + w]; a += w; });
  let rMax = R0;
  SKY_HARD.forEach(sid => { const [a0, a1] = wedge[sid], ids = skyOrder(SEC[sid].ms); order.push(...ids); let row = 0, k = 0;
    while (k < ids.length) { const rr = R0 + row * ROW, g = 128 / rr, cap = Math.max(1, Math.floor((a1 - a0 - 0.6 * g) / g) + 1), n = Math.min(cap, ids.length - k), span = (n - 1) * g, s0 = (a0 + a1) / 2 - span / 2;
      for (let j = 0; j < n; j++) { const id = ids[k + j], jj = row % 2 ? n - 1 - j : j; ang[id] = s0 + jj * g; rad[id] = rr + (j % 2 ? 18 : -18); }
      rMax = Math.max(rMax, rr); k += n; row++; } });
  // la couronne : le combo ultime, au-delà de tout, à l’angle moyen de ce qu’il réunit
  const RC = rMax + 200; skyOrder(SEC.ultime.ms).forEach(id => { order.push(id); const ps = (MS[id].req || []).filter(p => ang[p] != null); ang[id] = ps.length ? cmean(ps.map(p => ang[p])) : -Math.PI / 2; rad[id] = RC; });
  { const xs = SEC.ultime.ms.map(m => m.id).sort((p, q) => ang[p] - ang[q]), g = 150 / RC; for (let i = 1; i < xs.length; i++) if (ang[xs[i]] - ang[xs[i - 1]] < g) ang[xs[i]] = ang[xs[i - 1]] + g; }
  const W = 2 * (RC + 240), C = W / 2, pos = {}; Object.keys(ang).forEach(id => { pos[id] = [C + Math.cos(ang[id]) * rad[id], C + Math.sin(ang[id]) * rad[id]]; });
  return (skyLayout.v = {pos, ang, rad, secOf, wedge, order, W, C, R0, RC, rMax});
}
function figSky(nextId){
  const Y = skyLayout(), {pos, ang, rad, secOf, W, C} = Y, colOf = id => SKY_COL[SKY_TRUNK.includes(secOf[id]) ? "trunk" : secOf[id]] || "#ddd";
  const done = id => reqDone(id), open = id => !done(id) && !msLocked(MS[id]);
  // un fil par prérequis : une courbe qui suit le rayon (départ dans l’axe du parent, arrivée dans l’axe de l’enfant)
  // un fil principal par figure (vers son prérequis le plus récent) ; les autres prérequis, en fils pâles, pour ne pas emmêler le ciel
  const idx = {}; Y.order.forEach((id, i) => { idx[id] = i; });
  const curve = (A, Bp, f) => { const cx = C + ((A[0] + Bp[0]) / 2 - C) * f, cy = C + ((A[1] + Bp[1]) / 2 - C) * f; return "M" + f0(A[0]) + " " + f0(A[1]) + "Q" + f0(cx) + " " + f0(cy) + " " + f0(Bp[0]) + " " + f0(Bp[1]); };
  const paths = [], links = []; Object.keys(pos).forEach(id => { const rs = (MS[id].req || []).filter(r => pos[r]); if (!rs.length) return; const main = rs.reduce((x, y) => idx[y] > idx[x] ? y : x);
    rs.forEach(r => { const e = {d:curve(pos[r], pos[id], r === main ? 0.93 : 0.85), col:colOf(id), lit:done(r) && (done(id) || open(id))}; (r === main ? paths : links).push(e); }); });
  const nodes = Object.keys(pos).map(id => { const m = MS[id], d = done(id), cur = id === nextId, lk = !d && !open(id), maj = SKY_MAJ.has(id), ph = maj && PHOTOS.has("but-" + id);
    return {x:pos[id][0], y:pos[id][1], col:colOf(id), cls:(d ? "done" : cur ? "cur" : lk ? "lk" : "open") + (maj ? " maj" : "") + (m.alt ? " alt" : "") + (ph ? " ph" : ""), bg:ph ? photoUrl("but-" + id) : null,
      html:ph ? "" : maj ? lnIcon("hs", 26) : d ? lnIcon("check", 18) : lk ? lnIcon("lock", 16) : "", name:m.name, side:[0, 1],
      aria:m.name + (d ? ", validée" : lk ? ", verrouillée" : cur ? ", ta prochaine figure" : ", ouverte"), tap:() => quick(id)}; });
  const sectors = SKY_HARD.map(sid => { const [a0, a1] = Y.wedge[sid], am = (a0 + a1) / 2, rm = (Y.R0 + Y.rMax) / 2;
    return {name:sid === "low" ? "Sol" : SEC[sid].name, col:SKY_COL[sid], a0:a0 + 0.02, a1:a1 - 0.02, arcR:Y.RC - 50, nameR:Y.RC + 110, neb:[C + Math.cos(am) * rm, C + Math.sin(am) * rm, 380 + SEC[sid].ms.length * 12]}; });
  const seps = SKY_HARD.map(sid => ({a:Y.wedge[sid][0], r0:Y.R0 - 90, r1:Y.RC + 60}));
  const rings = [{r:110, col:"#e8a0b0", op:.45, w:2, dash:"3 7"}, {r:Y.R0 - 90, op:.14, dash:"2 6"}, {r:Y.RC, col:SKY_COL.ultime, op:.35, w:2, name:"Combo ultime", at:Math.PI / 2}];
  const goal = goalOf().ms, gd = goal.filter(done).length, row = (name, col, ids) => ({name, col, p:ids.filter(done).length / ids.length, title:name + " : " + ids.filter(done).length + "/" + ids.length});
  const ids = sid => SEC[sid].ms.filter(m => !m.alt).map(m => m.id);
  return skyMap({key:"fs", W, sectors, seps, rings, paths, links, nodes, kMin:0.12, far:0.5, k0:0.7,
    center:{big:gd + "/" + goal.length, small:"figures de ton but"},
    panel:{head:Object.keys(pos).filter(done).length + "/" + Object.keys(pos).length, sub:"figures", rows:[row("Tronc", SKY_COL.trunk, SKY_TRUNK.flatMap(ids)), row("Un bras", SKY_COL.onearm, ids("onearm")), row("Planche", SKY_COL.planche, ids("planche")), row("Force", SKY_COL.press, ids("press")), row("Combo", SKY_COL.ultime, ids("ultime"))]},
    view:{get:() => S.skyV, set:v => { S.skyV = v; }}, focus:nextId && pos[nextId] ? pos[nextId] : [C, C]});
}
