//#region node_modules/.nitro/vite/services/ssr/assets/webpush.server-CQNy3Aiq.js
/**
* Web Push (RFC 8291 aes128gcm + RFC 8292 VAPID) implemented on top of
* WebCrypto only — no Node-only dependency, so it runs unchanged on the
* Cloudflare Worker / Vercel edge runtime used by this project.
*
* Server-only: the private VAPID key never leaves this module.
*/
var enc = new TextEncoder();
function b64urlToBytes(s) {
	const pad = s.replace(/-/g, "+").replace(/_/g, "/");
	const bin = atob(pad + "=".repeat((4 - pad.length % 4) % 4));
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
function bytesToB64url(b) {
	let s = "";
	for (const byte of b) s += String.fromCharCode(byte);
	return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function concat(...parts) {
	const total = parts.reduce((n, p) => n + p.length, 0);
	const out = new Uint8Array(total);
	let off = 0;
	for (const p of parts) {
		out.set(p, off);
		off += p.length;
	}
	return out;
}
async function hmac(key, data) {
	const k = await crypto.subtle.importKey("raw", key, {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}
/** HKDF-Expand limited to a single block (all outputs here are <= 32 bytes). */
async function hkdfExpand(prk, info, length) {
	return (await hmac(prk, concat(info, new Uint8Array([1])))).slice(0, length);
}
function readVapidConfig() {
	const publicKey = process.env["VAPID_PUBLIC_KEY"];
	const privateKey = process.env["VAPID_PRIVATE_KEY"];
	const subject = process.env["VAPID_SUBJECT"] || "mailto:admin@rekomendify.com";
	if (!publicKey || !privateKey) return null;
	return {
		publicKey,
		privateKey,
		subject
	};
}
/** Signs the VAPID JWT (ES256) for one push-service origin. */
async function vapidAuthorization(audience, cfg) {
	const pub = b64urlToBytes(cfg.publicKey);
	const jwk = {
		kty: "EC",
		crv: "P-256",
		d: cfg.privateKey,
		x: bytesToB64url(pub.slice(1, 33)),
		y: bytesToB64url(pub.slice(33, 65)),
		ext: true
	};
	const key = await crypto.subtle.importKey("jwk", jwk, {
		name: "ECDSA",
		namedCurve: "P-256"
	}, false, ["sign"]);
	const header = bytesToB64url(enc.encode(JSON.stringify({
		typ: "JWT",
		alg: "ES256"
	})));
	const payload = bytesToB64url(enc.encode(JSON.stringify({
		aud: audience,
		exp: Math.floor(Date.now() / 1e3) + 720 * 60,
		sub: cfg.subject
	})));
	const signingInput = enc.encode(`${header}.${payload}`);
	return `vapid t=${header}.${payload}.${bytesToB64url(new Uint8Array(await crypto.subtle.sign({
		name: "ECDSA",
		hash: "SHA-256"
	}, key, signingInput)))}, k=${cfg.publicKey}`;
}
/** Encrypts the payload for one subscription using aes128gcm. */
async function encryptPayload(sub, plaintext) {
	const uaPublic = b64urlToBytes(sub.p256dh);
	const authSecret = b64urlToBytes(sub.auth);
	const ephemeral = await crypto.subtle.generateKey({
		name: "ECDH",
		namedCurve: "P-256"
	}, true, ["deriveBits"]);
	const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", ephemeral.publicKey));
	const uaKey = await crypto.subtle.importKey("raw", uaPublic, {
		name: "ECDH",
		namedCurve: "P-256"
	}, false, []);
	const ikm = await hkdfExpand(await hmac(authSecret, new Uint8Array(await crypto.subtle.deriveBits({
		name: "ECDH",
		public: uaKey
	}, ephemeral.privateKey, 256))), concat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
	const salt = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16));
	const prk = await hmac(salt, ikm);
	const cek = await hkdfExpand(prk, enc.encode("Content-Encoding: aes128gcm\0"), 16);
	const nonce = await hkdfExpand(prk, enc.encode("Content-Encoding: nonce\0"), 12);
	const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
	const record = concat(plaintext, new Uint8Array([2]));
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv: nonce
	}, aesKey, record));
	const rs = /* @__PURE__ */ new Uint8Array(4);
	new DataView(rs.buffer).setUint32(0, 4096);
	return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ciphertext);
}
/** Delivers one notification payload to a single subscription. */
async function sendWebPush(sub, payload, cfg, ttlSeconds = 3600 * 24) {
	try {
		const audience = new URL(sub.endpoint).origin;
		const [authorization, body] = await Promise.all([vapidAuthorization(audience, cfg), encryptPayload(sub, enc.encode(JSON.stringify(payload)))]);
		const res = await fetch(sub.endpoint, {
			method: "POST",
			headers: {
				Authorization: authorization,
				"Content-Encoding": "aes128gcm",
				"Content-Type": "application/octet-stream",
				TTL: String(ttlSeconds),
				Urgency: "normal"
			},
			body
		});
		return {
			endpoint: sub.endpoint,
			ok: res.ok,
			status: res.status,
			gone: res.status === 404 || res.status === 410
		};
	} catch {
		return {
			endpoint: sub.endpoint,
			ok: false,
			status: 0,
			gone: false
		};
	}
}
//#endregion
export { readVapidConfig, sendWebPush };
