const BASE = 'https://api.vieclammienbac.com';
const DB_NAME = 'vmb_keystore';
const STORE_NAME = 'keys';

const _openDB = () => new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME);
    req.onsuccess = e => res(e.target.result);
    req.onerror = () => rej(req.error);
});

const _getKP = async () => {
    const db = await _openDB();
    return new Promise((res, rej) => {
        const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get('keypair');
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    });
};

async function _sign(method, path) {
    const kp = await _getKP();
    if (!kp) return null;

    const timestamp = Date.now().toString();
    const message = `${method.toUpperCase()}:${path}:${timestamp}`;
    
    const sigBuffer = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        kp.privateKey,
        new TextEncoder().encode(message)
    );

    return {
        signature: btoa(String.fromCharCode(...new Uint8Array(sigBuffer))),
        timestamp
    };
}

export async function vmbFetch(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const auth = await _sign(method, path);

    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };

    if (auth) {
        headers['VMB-Signature'] = auth.signature;
        headers['VMB-Timestamp'] = auth.timestamp;
    }

    return fetch(BASE + path, {
        ...options,
        method,
        headers,
        credentials: 'include',
    });
}


export async function getPublicKeyForEnrollment() {
    const db = await _openDB();
    let kp = await _getKP();

    if (!kp) {
        kp = await crypto.subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            false,
            ["sign", "verify"]
        );
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(kp, "keypair");
    }

    const raw = await crypto.subtle.exportKey("raw", kp.publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
}