// Chiffre un fichier de programme (JSON) pour pouvoir le publier sans exposer son contenu.
// Usage : HS_PASS="phrase secrète" node tools/pack-program.mjs <programme.json> <version>
// Écrit programs/<id>.enc et met à jour programs/index.json. La phrase n'est jamais écrite dans le dépôt.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
const [src, ver] = process.argv.slice(2);
const pass = (process.env.HS_PASS || "").toLowerCase().replace(/[^a-z0-9]/g, "");
if (!src || !ver || pass.length < 12) { console.error("usage: HS_PASS=... node tools/pack-program.mjs <fichier.json> <version>"); process.exit(1); }
const prog = JSON.parse(readFileSync(src, "utf8"));
const iter = 300000, salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(prog))));
const b64 = u => Buffer.from(u).toString("base64");
writeFileSync(`programs/${prog.id}.enc`, JSON.stringify({ v: 1, iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
const idxPath = "programs/index.json", idx = existsSync(idxPath) ? JSON.parse(readFileSync(idxPath, "utf8")) : [];
const e = idx.find(x => x.id === prog.id) || (idx.push({ id: prog.id }), idx[idx.length - 1]);
e.file = `programs/${prog.id}.enc`; e.v = String(ver);
writeFileSync(idxPath, JSON.stringify(idx, null, 1) + "\n");
console.log("ok", prog.id, ver, ct.length, "octets");
