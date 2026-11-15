// ---------- Le ciel : une carte d’étoiles, partagée par Apprendre et le Parcours ----------
// Le moteur ne sait rien des leçons ni des figures : on lui donne des étoiles, des fils, des secteurs ; il dessine, déplace et zoome.
// o = {key, W, H, nebs:[{x,y,rx,ry,col}], tags:[{x,y,text,col,big}], sectors:[{name,col,a0,a1,nameR,arcR,neb:[x,y,r]}], seps:[{a,r0,r1}], rings:[{r,col,op,dash,name,at}], paths:[{d,col,lit}], links:[{d,col,lit}],
//      dots:[{x,y,r,col}], nodes:[{x,y,col,cls,html,name,side,aria,tap,bg}], labels:[{x,y,col,text,tap}], center:{big,small}, panel:{head,sub,rows:[{name,col,p,title}]},
//      view:{get,set}, kMin, focus:[x,y], k0, far}
const f0 = x => x.toFixed(0);
function skyMap(o){
  const W = o.W, H = o.H || W, C = W / 2, K = o.key, wrap = el("div","cst"), world = el("div","cstw"); world.style.width = W + "px"; world.style.height = H + "px"; wrap.append(world);
  const P = (r, t) => f0(C + Math.cos(t) * r) + " " + f0(C + Math.sin(t) * r);
  const arc = (r, a0, a1) => "M" + P(r, a0) + "A" + r + " " + r + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + P(r, a1);
  const arcBack = (r, a0, a1) => "M" + P(r, a1) + "A" + r + " " + r + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 0 " + P(r, a0);
  const defs = ['<filter id="' + K + 'g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>'], bg = [], glow = [], fg = [];
  // poussière d’étoiles, toujours la même (pseudo-hasard fixe), plus dense quand le ciel est grand
  let sd = 7; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  for (let i = 0, N = Math.min(600, Math.round(170 * W * H / 1440 / 1440)); i < N; i++) bg.push('<circle cx="' + f0(rnd() * W) + '" cy="' + f0(rnd() * H) + '" r="' + (rnd() * 1.4 + 0.3).toFixed(1) + '" fill="#fff" opacity="' + (rnd() * 0.5 + 0.15).toFixed(2) + '"/>');
  // les secteurs : une nébuleuse, un arc, et le nom courbé le long du bord (toujours à l’endroit)
  (o.sectors || []).forEach((s, i) => { const am = (s.a0 + s.a1) / 2, id = K + "s" + i;
    if (s.neb) { defs.push('<radialGradient id="' + id + 'n"><stop offset="0" stop-color="' + s.col + '" stop-opacity=".22"/><stop offset="1" stop-color="' + s.col + '" stop-opacity="0"/></radialGradient>');
      bg.push('<circle cx="' + f0(s.neb[0]) + '" cy="' + f0(s.neb[1]) + '" r="' + f0(s.neb[2]) + '" fill="url(#' + id + 'n)"/>'); }
    fg.push('<path d="' + arc(s.arcR, s.a0, s.a1) + '" stroke="' + s.col + '" stroke-width="2" fill="none" opacity=".5"/>');
    const low = Math.sin(am) > 0.2; defs.push('<path id="' + id + '" d="' + (low ? arcBack(s.nameR + 24, s.a0, s.a1) : arc(s.nameR, s.a0, s.a1)) + '"/>');
    fg.push('<text class="csts" fill="' + s.col + '" text-anchor="middle"><textPath href="#' + id + '" startOffset="50%">' + s.name.toUpperCase() + '</textPath></text>'); });
  (o.nebs || []).forEach((n, i) => { const id = K + "n" + i; defs.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + n.col + '" stop-opacity=".2"/><stop offset="1" stop-color="' + n.col + '" stop-opacity="0"/></radialGradient>');
    bg.push('<ellipse cx="' + f0(n.x) + '" cy="' + f0(n.y) + '" rx="' + f0(n.rx) + '" ry="' + f0(n.ry) + '" fill="url(#' + id + ')"/>'); });
  (o.seps || []).forEach(s => bg.push('<line x1="' + f0(C + Math.cos(s.a) * s.r0) + '" y1="' + f0(C + Math.sin(s.a) * s.r0) + '" x2="' + f0(C + Math.cos(s.a) * s.r1) + '" y2="' + f0(C + Math.sin(s.a) * s.r1) + '" stroke="#8a84a3" stroke-opacity=".22" stroke-width="1.5" stroke-dasharray="2 9"/>'));
  // les orbites (le cercle central, les étages) ; leur nom se pose dans le plus grand vide de l’orbite
  (o.rings || []).forEach((r, i) => { bg.push('<circle cx="' + C + '" cy="' + C + '" r="' + r.r + '" fill="none" stroke="' + (r.col || "#8a84a3") + '" stroke-opacity="' + (r.op || .2) + '" stroke-width="' + (r.w || 1.5) + '"' + (r.dash ? ' stroke-dasharray="' + r.dash + '"' : "") + '/>');
    if (r.name) { const id = K + "r" + i, t = r.at, low = Math.sin(t) > 0.2, d = 0.5 * 260 / r.r; defs.push('<path id="' + id + '" d="' + (low ? arcBack(r.r + 14, t - d, t + d) : arc(r.r - 6, t - d, t + d)) + '"/>');
      fg.push('<text class="cstr" fill="' + (r.col || "#c9c3dc") + '" text-anchor="middle"><textPath href="#' + id + '" startOffset="50%">' + r.name + '</textPath></text>'); } });
  (o.links || []).forEach(l => bg.push('<path d="' + l.d + '" stroke="' + (l.lit ? l.col : "#8a84a3") + '" stroke-width="1.2" fill="none" stroke-dasharray="2 5" opacity="' + (l.lit ? .8 : .35) + '"/>'));
  // les fils : allumés (avec un halo) quand le chemin est ouvert, en pointillé pâle sinon
  (o.paths || []).forEach(p => { if (p.lit) glow.push('<path d="' + p.d + '" stroke="' + p.col + '" stroke-width="7" fill="none" opacity=".5" filter="url(#' + K + 'g)"/>');
    fg.push('<path d="' + p.d + '" stroke="' + (p.lit ? p.col : "#6e6884") + '" stroke-width="' + (p.lit ? 2.6 : 1.6) + '" fill="none" stroke-linecap="round"' + (p.lit ? "" : ' stroke-dasharray="1 6" opacity=".8"') + '/>'); });
  // des mots couchés le long d’un chemin (le nom d’une ligne, au pied de son rayon)
  (o.texts || []).forEach((x, i) => { const id = K + "t" + i; defs.push('<path id="' + id + '" d="' + x.d + '"/>');
    fg.push('<text class="cstt" fill="' + x.col + '" text-anchor="' + (x.anchor || "middle") + '"><textPath href="#' + id + '" startOffset="' + (x.off || "50%") + '">' + x.text + '</textPath></text>'); });
  (o.dots || []).forEach(d => fg.push('<circle cx="' + f0(d.x) + '" cy="' + f0(d.y) + '" r="' + d.r + '" fill="' + d.col + '"/>'));
  world.insertAdjacentHTML("beforeend", '<svg class="cste" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true"><defs>' + defs.join("") + '</defs>' + bg.join("") + glow.join("") + fg.join("") + '</svg>');
  // le cœur
  // « Toi » : une épingle posée sur ta prochaine étoile, qui garde sa taille à tous les zooms (comme « vous êtes ici » sur un plan)
  if (o.pin) { const pn = el("div","cstpin", o.pin.text); pn.style.left = o.pin.x + "px"; pn.style.top = o.pin.y + "px"; if (!o.panel.rows.some(r => r.go)) pn.setAttribute("aria-hidden","true"); world.append(pn); }
  if (o.center) { const h = el("div","csth"); h.style.left = (o.center.x != null ? o.center.x : C) + "px"; h.style.top = (o.center.y != null ? o.center.y : C) + "px"; h.append(el("b",null, o.center.big), el("span",null, o.center.small)); world.append(h); }
  // des noms posés dans le ciel (sommets des lignes, titres des massifs), qui ne captent pas le doigt
  (o.tags || []).forEach(g => { const t = el("span","cstg" + (g.big ? " big" : ""), g.text); t.style.left = g.x + "px"; t.style.top = g.y + "px"; t.style.color = g.col; world.append(t); });
  (o.labels || []).forEach(l => { const t = el("button","cstv", l.text); t.style.left = l.x + "px"; t.style.top = l.y + "px"; t.style.color = l.col;
    t.onclick = () => { if (!wrap.dataset.moved) l.tap(); }; world.append(t); });
  const btn = {}, sel = document.createElementNS("http://www.w3.org/2000/svg","svg"); sel.setAttribute("class","cstsel"); sel.setAttribute("width", W); sel.setAttribute("height", H); sel.setAttribute("aria-hidden","true"); world.append(sel);
  (o.nodes || []).forEach(n => { const b = el("button","cstn " + n.cls); if (n.id) { btn[n.id] = {b, n}; b.dataset.id = n.id; } b.style.left = n.x + "px"; b.style.top = n.y + "px"; b.style.setProperty("--c", n.col);
    if (n.bg) b.style.backgroundImage = "url(" + n.bg + ")"; b.innerHTML = n.html || "";
    // le nom se pose du côté indiqué (l’extérieur du zigzag, ou sous l’étoile), jamais sur le fil
    const nm = el("i",null, n.name), R = n.r || (/\bmaj\b/.test(n.cls) ? 30 : 22) + 6, [sx, sy] = n.side || [0, 1], ax = sx > .35 ? 0 : sx < -.35 ? -100 : -50, ay = sy > .35 ? 0 : sy < -.35 ? -100 : -50;
    nm.style.left = "calc(50% + " + f0(sx * R) + "px)"; nm.style.top = "calc(50% + " + f0(sy * R) + "px)"; nm.style.transform = "translate(" + ax + "%," + ay + "%)"; nm.style.textAlign = ax === 0 ? "left" : ax === -100 ? "right" : "center"; b.append(nm);
    if (n.fill) n.fill(b);   // un contenu vivant (le personnage animé), posé par l’appelant
    b.setAttribute("aria-label", n.aria || n.name); b.onclick = e => { if (wrap.dataset.moved) return; e.stopPropagation(); if (o.pick) pick(n.id); else n.tap(); }; world.append(b); });
  // toucher une étoile (mode « pick ») : ses fils vers ce qu’il manque et ce qu’elle ouvre s’allument, le reste du ciel s’efface, une carte s’ouvre en bas
  let card = null, bar = null; const dock = () => { if (bar) bar.remove(); bar = o.bar ? o.bar(pick) : null; if (bar) { bar.classList.add("cstbar"); wrap.append(bar); } };
  const clear = () => { wrap.classList.remove("sel"); sel.textContent = ""; Object.values(btn).forEach(x => x.b.classList.remove("hot")); if (card) { card.remove(); card = null; } dock(); };
  const line = (a, c, col, lit) => { const l = document.createElementNS("http://www.w3.org/2000/svg","line"); [["x1",a.x],["y1",a.y],["x2",c.x],["y2",c.y]].forEach(([k2, v]) => l.setAttribute(k2, f0(v)));
    l.setAttribute("stroke", lit ? col : "#cfc8e6"); l.setAttribute("stroke-width", lit ? 3 : 2); if (!lit) l.setAttribute("stroke-dasharray","4 6"); sel.append(l); };
  const pick = id => { const x = btn[id]; if (!x) return; clear(); wrap.classList.add("sel"); x.b.classList.add("hot");
    (x.n.rel || []).forEach(r => { const y = btn[r]; if (y) { y.b.classList.add("hot"); line(y.n, x.n, x.n.col, y.n.done); } });
    (x.n.unl || []).forEach(r => { const y = btn[r]; if (y) { y.b.classList.add("hot"); line(x.n, y.n, y.n.col, false); } });
    if (bar) { bar.remove(); bar = null; } card = o.card(x.n, pick, clear); card.classList.add("cstcard"); wrap.append(card);
    // l’étoile touchée vient au-dessus de la carte, sans changer le zoom
    requestAnimationFrame(() => { const w = wrap.clientWidth || 360, h = wrap.clientHeight || 520, ch = card.offsetHeight || 200; tx = w / 2 - x.n.x * k; ty = (h - ch) / 2 + 40 - x.n.y * k; apply(); keep(); }); };
  if (o.pick) { wrap.addEventListener("click", e => { if (!wrap.dataset.moved && wrap.classList.contains("sel") && !e.target.closest(".cstcard,.cstz,.csttop,.cstn")) clear(); }); dock(); wrap.pick = id => { if (k < 0.6) { const x = btn[id]; if (x) wrap.goTo(x.n.x, x.n.y, 0.8); } pick(id); }; }
  // le panneau de bord : le total, et une jauge par secteur
  if (o.panel) { const pn = el("div","cstp"), hd = el("div","cstph"); if (!o.panel.rows.some(r => r.go)) pn.setAttribute("aria-hidden","true"); hd.append(el("b",null, o.panel.head), el("span",null, o.panel.sub)); pn.append(hd);
    o.panel.rows.forEach(r => { const x = el(r.go ? "button" : "div","cstpr"), bar = el("i"); if (r.go) { x.onclick = e => { e.stopPropagation(); r.go(); }; x.setAttribute("aria-label", r.title); } x.style.setProperty("--c", r.col); bar.style.setProperty("--p", r.p); x.title = r.title || r.name; x.append(el("span",null, r.name), bar); pn.append(x); });
    wrap.append(pn); }
  // déplacer au doigt, zoomer à deux doigts ou à la molette ; boutons + − ⤢ ; de loin, seuls les grands noms restent
  const kMin = o.kMin || 0.25, st0 = o.view.get(); let k = st0 ? st0.k : 0, tx = st0 ? st0.x : 0, ty = st0 ? st0.y : 0; const pts = new Map(); let base = null;
  const apply = () => { world.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + k + ")"; wrap.style.setProperty("--k", k); wrap.classList.toggle("far", k < (o.far || 0)); wrap.classList.toggle("close", k >= (o.close || 9)); };
  const keep = () => o.view.set({k, x:tx, y:ty});
  const zoomAt = (f, cx, cy) => { const nk = Math.max(kMin, Math.min(1.6, k * f)); tx = cx - (cx - tx) * nk / k; ty = cy - (cy - ty) * nk / k; k = nk; apply(); keep(); };
  const fit = () => { const w = wrap.clientWidth || 360, h = wrap.clientHeight || 520; k = Math.max(kMin, Math.min(w / W, h / H) * 0.98); tx = (w - W * k) / 2; ty = (h - H * k) / 2; apply(); keep(); };
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
  // la légende : ce que veulent dire les étoiles et les fils ; elle s’ouvre seule la première fois
  if (o.legend) { const q = el("button",null,"?"); q.setAttribute("aria-label","Que veulent dire les étoiles ?"); zb.append(q);
    const showLegend = () => { if (o.pick) { wrap.classList.remove("sel"); Object.values(btn).forEach(x => x.b.classList.remove("hot")); sel.textContent = ""; }
      if (card) card.remove(); if (bar) { bar.remove(); bar = null; } card = o.legend(() => { card.remove(); card = null; if (o.pick) dock(); }); card.classList.add("cstcard"); wrap.append(card); };
    q.onclick = e => { e.stopPropagation(); showLegend(); }; if (o.legendFirst && o.legendFirst()) requestAnimationFrame(showLegend); }
  // se poser sur un point du ciel (la prochaine étoile, par défaut)
  wrap.goTo = (x, y, nk) => { const w = wrap.clientWidth || 360, h = wrap.clientHeight || 520; k = nk || o.k0 || 0.62; tx = w / 2 - x * k; ty = h / 2 - y * k; apply(); keep(); };
  requestAnimationFrame(() => { if (st0 && st0.k) apply(); else wrap.goTo(o.focus ? o.focus[0] : C, o.focus ? o.focus[1] : C); });
  return wrap;
}
// le plein écran : un titre et une ligne qui flottent en haut, un bouton pour revenir à l’autre vue
function skyFull(w, title, sub, btn, flip){ const top = el("div","csttop"), t = el("div"), tg = el("button","cstl", btn); w.classList.add("full");
  t.append(el("h2",null,title), el("span",null, sub)); tg.onclick = flip; top.append(t, tg); w.append(top); return w; }

// ---------- Le Parcours en constellation ----------
// Analogie : une montée en montagne, vue de nuit. Tu pars d’en bas ; le tronc commun est le sentier d’approche (quatre brins côte à côte) ;
// au carrefour, trois massifs (un bras, planche, force), chacun fait de lignes de progression qui montent ; tout en haut, le sommet : le combo.
// Les grandes étoiles sont les figures phares, les petites, les étapes ; ce qui est loin de toi reste dans la brume.
const SKY_COL = {trunk:"#efe3c6", onearm:"#e2b04a", planche:"#5cc2b3", ultime:"#ffd27a", press:"#a98be6", low:"#e8a0b0"};
const SKY_LINES = [
  ["trunk","Tronc commun",[["Force de base",["fd_plank","fd_pushInc","fd_push","fd_support","fd_dips"]],["Mur et sortie",["fd_roue","fd_pike","fd_c2w","st_bail30","st_bailc2w"]],
    ["Équilibre",["st_split","b1_free5","b2_str15","in_str40","in_str60"]],["Formes",["in_holds","in_changes","in_tuck","in_7s","in_7d","in_toes","in_toes7"]]]],
  ["onearm","Équilibre un bras",[["Drapeaux",["oa_strad30","oa_tuckflag","oa_flaghoriz","oa_flagfloor"]],["Transfert",["oa_wall","oa_shrug","oa_shift","oa_sidehold"]],
    ["Doigts",["oa_finger","oa_finger3","oa_finger2","oa_finger1"]],["Un bras",["oa_strarm","oa_lift","oa_oahs","oa_oahsw","oa_oahs10"]],["Formes à un bras",["oa_shTuck","oa_shStrad","oa_switch"]]]],
  ["planche","Full planche",[["Lean",["pl_lean","pl_ppp","pl_protr","pl_lean2"]],["Tuck",["pl_tuckP","pl_tuck","pl_tuckPu","pl_tuckO","pl_adv"]],
    ["Straddle",["pl_frog","pl_1leg","pl_strElev","pl_t2s","pl_strBand","pl_strBandL","pl_straddle"]],["Full",["pl_strNar","pl_half","pl_fullElev","pl_fullBand","pl_fullNeg","pl_full"]],
    ["Vers l’équilibre",["pl_strHs","pl_hsDown","pl_halfPress","pl_press"]]]],
  ["ultime","Combo",[["Combo ultime",["ul_c1","ul_c2","ul_c3","ul_c12","ul_full"]]]],
  ["press","Équilibre en force",[["Compression",["pr_lift1","pr_pikeLift","pr_stradLift"]],["Montées",["pr_wallNeg","pr_walk","pr_float","pr_negS","pr_wallPress","pr_1leg","pr_elev","pr_elevLow","pr_straddle","pr_negP","pr_pike"]],
    ["Équerres",["pr_lsit","pr_stradL","pr_vsit","pr_vsitC"]],["Stalder",["pr_halfSt","pr_tuckUp","pr_stalPart","pr_stalder","pr_lsitNeg","pr_lsitHs"]],["Manna",["pr_extSup","pr_mannaP","pr_vsitH","pr_manna"]]]],
  ["low","Sol",[["Au sol",["lo_elbow","lo_croc","lo_qdr"]]]],
];
// les figures phares : celles que tout gymnaste nomme, les portes vers une autre ligne, et le bout de chaque ligne
const SKY_MAJ = new Set(["fd_dips","st_bail30","b1_free5","in_str60","in_tuck","in_toes7","oa_flaghoriz","oa_sidehold","oa_finger1","oa_oahs","oa_oahs10","oa_switch","pl_lean2","pl_tuck","pl_adv",
  "pl_straddle","pl_half","pl_full","pl_press","pr_stradLift","pr_straddle","pr_pike","pr_lsit","pr_vsitC","pr_stalder","pr_lsitHs","pr_manna","lo_qdr","ul_c1","ul_c2","ul_c3","ul_full"]);
// ordre de marche dans une ligne : chaque figure après ses prérequis de la même ligne
const skyOrder = ids => { const set = new Set(ids), out = [], seen = new Set(), go = id => { if (seen.has(id)) return; seen.add(id); (MS[id].req || []).filter(r => set.has(r)).forEach(go); out.push(id); }; ids.forEach(go); return out; };
function skyLayout(){
  if (skyLayout.v) return skyLayout.v;   // la forme du ciel ne dépend que de l’arbre : calculée une fois
  const pos = {}, line = {}, strands = [], groups = {}, sats = {}, GAP = 86, G = Object.fromEntries(SKY_LINES.map(x => [x[0], x]));
  const placed = new Set(SKY_LINES.flatMap(x => x[2].flatMap(l => l[1])));
  // les variantes (et toute figure qu’aucune ligne ne nomme) deviennent des satellites de leur prérequis
  Object.values(MS).forEach(m => { if (!placed.has(m.id)) { const p = (m.req || []).find(r => placed.has(r)) || "fd_plank"; (sats[p] || (sats[p] = [])).push(m.id); } });
  // un brin : les figures d’une ligne, de bas en haut, plus serrées pour les petites étapes
  const strand = (sid, lname, ids0, bx, by, fan) => { const ids = skyOrder(ids0); let y = by;
    ids.forEach((id, k) => { if (k) y -= SKY_MAJ.has(id) || SKY_MAJ.has(ids[k - 1]) ? 106 : 86; const x = bx + fan * k + (k % 2 ? 7 : -7); pos[id] = [x, y]; line[id] = {sid, lname, k, ids};
      (sats[id] || []).forEach((sId, j) => { pos[sId] = [x + 46 + j * 26, y - 22 - j * 8]; line[sId] = {sid, lname, sat:id}; }); });   // les variantes, en lunes sur le côté
    strands.push({sid, lname, ids, x:pos[ids[ids.length - 1]][0], top:y}); return y; };
  // un massif : ses brins côte à côte, qui s’écartent un peu en montant
  const group = (sid, cx, by, fan) => { const ls = G[sid][2], n = ls.length; let top = by;
    ls.forEach(([lname, ids], i) => { const off = i - (n - 1) / 2; top = Math.min(top, strand(sid, lname, ids, cx + off * GAP, by, off * fan)); });
    return (groups[sid] = {sid, name:G[sid][1], cx, by, top, half:(n - 1) / 2 * GAP + 60}); };
  // en bas le tronc commun et le sol à côté ; au-dessus du carrefour, les trois disciplines ; au sommet, le combo
  const T = group("trunk", 0, 0, 0); group("low", -T.half - 120, 0, 0);
  const gate = [0, T.top - 120], dB = gate[1] - 150;
  const A = group("onearm", -470, dB, 3), B = group("planche", 0, dB - 40, 3), D = group("press", 470, dB, 3);
  const U = group("ultime", 0, Math.min(A.top, B.top, D.top) - 230, 0);
  // le cadre : tout décalé pour laisser une marge autour
  const xs = Object.values(pos).map(p => p[0]), ys = Object.values(pos).map(p => p[1]), x0 = Math.min(...xs) - 150, y0 = Math.min(...ys) - 190;
  const W = Math.max(...xs) - x0 + 150, H = Math.max(...ys) - y0 + 260, sh = p => [p[0] - x0, p[1] - y0];
  Object.keys(pos).forEach(id => { pos[id] = sh(pos[id]); }); strands.forEach(x => { x.x -= x0; x.top -= y0; });
  Object.values(groups).forEach(g => { g.cx -= x0; g.by -= y0; g.top -= y0; });
  return (skyLayout.v = {pos, line, strands, groups, gate:sh(gate), W, H, toi:sh([0, 150])});
}
const figState = id => st(id).done ? "done" : eqSkip(id) ? "skip" : reqDone(id) ? "done" : !msLocked(MS[id]) ? "open" : (MS[id].req || []).every(r => reqDone(r) || !msLocked(MS[r])) ? "near" : "far";
// la légende d’un ciel : un titre, une phrase pour le sens de lecture, les symboles ; « lue » une fois fermée
const skyLegend = (title, sub, items, foot, read) => close => { const c = el("div"), hd = el("div","cstch0"), x = el("button","cstx","×"); x.setAttribute("aria-label","Fermer");
  x.onclick = e => { e.stopPropagation(); read(); close(); }; hd.append(el("b",null,title), el("span",null,sub), x); c.append(hd);
  const L = el("div","cstleg"); items.forEach(([k, t]) => { const r = el("div"); r.append(el("i","lg-" + k), el("span",null,t)); L.append(r); }); c.append(L, el("p","cstlegp", foot)); return c; };
function figSky(nextId){
  const Y = skyLayout(), {pos, line, W, H} = Y, colOf = id => SKY_COL[line[id] ? line[id].sid : "trunk"] || "#ddd", stOf = {}, unl = {};
  Object.keys(pos).forEach(id => { stOf[id] = figState(id); (MS[id].req || []).forEach(r => (unl[r] || (unl[r] = [])).push(id)); });
  const M = p => f0(p[0]) + " " + f0(p[1]), pass = id => stOf[id] === "done" || stOf[id] === "skip", lit = id => pass(id) || stOf[id] === "open";
  // les fils : le long de chaque brin, d’étoile en étoile ; du tronc au carrefour ; du carrefour au pied de chaque ligne des disciplines
  const paths = [], dots = [{x:Y.gate[0], y:Y.gate[1], r:7, col:SKY_COL.trunk}], tags = [], nebs = [];
  const curve = (a, b, col, on) => paths.push({d:"M" + M(a) + "C" + M([a[0], (a[1] + b[1]) / 2]) + " " + M([b[0], (a[1] + b[1]) / 2]) + " " + M(b), col, lit:on});
  Y.strands.forEach(R => { const col = SKY_COL[R.sid];
    for (let k = 1; k < R.ids.length; k++) curve(pos[R.ids[k - 1]], pos[R.ids[k]], col, pass(R.ids[k - 1]) && lit(R.ids[k]));
    if (R.sid === "trunk") curve(pos[R.ids[R.ids.length - 1]], Y.gate, col, pass(R.ids[R.ids.length - 1]));
    else if (R.sid !== "low" && R.sid !== "ultime") curve(Y.gate, pos[R.ids[0]], col, lit(R.ids[0]));
    // le nom de la ligne, au sommet de son brin, comme un fanion
    tags.push({x:R.x, y:R.top - 44, text:R.lname, col}); });
  // le combo part du sommet de la planche
  { const U = Y.strands.find(x => x.sid === "ultime"), Bp = Y.groups.planche; curve([Bp.cx, Bp.top - 80], pos[U.ids[0]], SKY_COL.ultime, lit(U.ids[0])); dots.push({x:Bp.cx, y:Bp.top - 80, r:5, col:SKY_COL.ultime}); }
  // chaque massif : une nébuleuse et son nom en grand (au pied pour le tronc et le sol, au-dessus des fanions pour les autres)
  Object.values(Y.groups).forEach(g => { const col = SKY_COL[g.sid], foot = g.sid === "trunk" || g.sid === "low";
    nebs.push({x:g.cx, y:(g.by + g.top) / 2, rx:g.half + 120, ry:(g.by - g.top) / 2 + 160, col});
    tags.push({x:g.cx, y:foot ? g.by + 70 : g.top - 100, text:g.name, col, big:true}); });
  // les étoiles vivantes : les figures phares, ta prochaine figure et celles qui sont ouvertes montrent le personnage en mouvement ;
  // les étapes faites restent de petits points cochés, ce qui est loin reste de la poussière
  const nodes = Object.keys(pos).map(id => { const m = MS[id], L = line[id], s = stOf[id], cur = id === nextId, maj = SKY_MAJ.has(id), live = maj || cur || (s === "open" && !L.sat);
    const size = maj ? 56 : cur ? 52 : 42, lk = s === "near" || s === "far";
    return {id, x:pos[id][0], y:pos[id][1], col:colOf(id), done:s === "done", rel:(m.req || []).filter(r => pos[r]), unl:(unl[id] || []).filter(r => pos[r]),
      cls:(cur ? "cur" : s) + (maj ? " maj" : " mn") + (L.sat ? " sat" : "") + (live ? " anim" : ""), r:live ? size / 2 + 4 : null,
      html:live ? (s === "done" ? '<b class="cstok">' + lnIcon("check", 12) + '</b>' : "") : s === "done" ? lnIcon("check", 12) : "",
      fill:live ? b => { const sp = el("span","sp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = lk ? 1 : ""; b.prepend(sp); sprPaint(sp, size); } : null,
      name:m.name, side:[0, 1], aria:m.name + (s === "done" ? ", validée" : s === "skip" ? ", passée : pas besoin avec ton matériel" : cur ? ", ta prochaine figure" : s === "open" ? ", ouverte" : ", pas encore ouverte"), tap:() => quick(id)}; });
  // la carte d’une étoile : où elle en est, ce qu’il manque (à toucher), ce qu’elle ouvre, et la fiche
  const chip = (id, go) => { const b = el("button","cstch", MS[id].name); b.style.setProperty("--c", colOf(id)); if (stOf[id] === "done") b.classList.add("done"); b.onclick = e => { e.stopPropagation(); go(id); }; return b; };
  const card = (n, go, close) => { const id = n.id, s = stOf[id], c = el("div"), hd = el("div","cstch0"), miss = (MS[id].req || []).filter(r => !reqDone(r)), op = (unl[id] || []).filter(r => !reqDone(r));
    // la figure en mouvement, son nom, et où tu en es : niveau atteint et prochain palier, ou la cible
    const m = MS[id], Lv = lvls(m), kk = lvlOf(m), nx = nextStep(m), sp = el("span","sp cstsp"); sp.dataset.pose = poseId(id); sp.dataset.anim = id; sp.dataset.lk = s === "far" || s === "near" ? 1 : ""; sprPaint(sp, 64);
    const where = s === "done" ? "Validée" : s === "skip" ? "Passée : avec ton matériel, l’autre chemin suffit" : (id === nextId ? "Ta prochaine figure" : s === "open" ? "Ouverte" : "Pas encore ouverte") + (s !== "done" && Lv.length > 1 && nx ? " · niveau " + kk + "/" + Lv.length + ", prochain palier " + unitTxt(m, nx) : m.target && s !== "done" ? " · cible " + goalTxt(m) : "");
    hd.append(sp, el("b",null, m.name), el("span",null, where));
    const x = el("button","cstx","×"); x.setAttribute("aria-label","Fermer"); x.onclick = e => { e.stopPropagation(); close(); }; hd.append(x); c.append(hd);
    if (miss.length) { const r = el("div","cstrow"), all = [...reqsOf(id)].filter(r2 => !reqDone(r2) && !MS[r2].alt).length; r.append(el("span",null,"Il te manque")); miss.forEach(m => r.append(chip(m, go))); c.append(r);
      if (all > miss.length) c.append(el("p","cstlegp", "En tout, " + all + " étapes avant celle-ci : touche « Il te manque » pour remonter le chemin.")); }
    if (op.length) { const r = el("div","cstrow"); r.append(el("span",null,"Elle ouvre")); op.slice(0, 4).forEach(m => r.append(chip(m, go))); c.append(r); }
    const f = el("button","btn","Voir la fiche"); f.onclick = e => { e.stopPropagation(); quick(id); }; c.append(f); return c; };
  // en bas, quand rien n’est touché : ta prochaine figure, à un geste
  const bar = go => { if (!nextId) return null; const b = el("button"); b.append(el("span",null,"Prochaine"), el("b",null, MS[nextId].name)); b.onclick = e => { e.stopPropagation(); wrap.pick(nextId); }; return b; };
  const ids = sid => SKY_LINES.find(x => x[0] === sid)[2].flatMap(l => l[1]), row = (name, sid) => { const xs = ids(sid), d = xs.filter(id => st(id).done).length, g = Y.groups[sid]; return {name, col:SKY_COL[sid], p:d / xs.length, title:name + " : " + d + "/" + xs.length, go:g ? () => wrap.goTo(g.cx, (g.by + g.top) / 2, 0.42) : null}; };   // toucher une jauge : on survole son massif
  const all = Object.keys(pos), wrap = skyMap({key:"fs", W, H, nebs, paths, dots, tags, nodes, pick:true, card, bar, kMin:0.12, far:0.42, close:1.05, k0:0.8,
    center:{big:"Départ", small:"", x:Y.toi[0], y:Y.toi[1]}, pin:nextId && pos[nextId] ? {x:pos[nextId][0], y:pos[nextId][1] - 34, text:"Toi"} : null,
    legend:skyLegend("Lire le ciel", "De bas en haut : plus on monte, plus c’est dur.", [["maj","Une figure phare"],["ok","Validée"],["op","Ouverte : tu peux la travailler"],["cur","Toi : ta prochaine figure"],["nr","À un pas"],["far","Plus tard, dans la brume"],["th","Fil lumineux : chemin ouvert"]],
      "Touche une étoile : ce qu’il te manque, ce qu’elle ouvre. Mots de gym : tuck = groupé, straddle = jambes écartées, pike = jambes serrées tendues, lean = penché en avant, planche = le corps à l’horizontale sur les mains (pas la planche du yoga).", () => { S.skyHelp = 1; save(); }),
    legendFirst:() => !S.skyHelp,
    panel:{head:all.filter(id => !MS[id].alt && st(id).done).length + "/" + all.filter(id => !MS[id].alt).length, sub:"validées", rows:[row("Tronc","trunk"), row("Un bras","onearm"), row("Planche","planche"), row("Force","press"), row("Combo","ultime")]},
    view:{get:() => S.skyV, set:v => { S.skyV = v; }}, focus:nextId && pos[nextId] ? [pos[nextId][0], pos[nextId][1] - 110] : Y.toi});
  return wrap;
}
