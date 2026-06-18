use p256::{EncodedPoint, ecdsa::{VerifyingKey, Signature, signature::Verifier}};
use base64::{Engine, engine::general_purpose::STANDARD};

use std::time::{SystemTime, UNIX_EPOCH};

pub fn verify_signature(
    public_key_b64: &str,
    signature_b64: &str,
    timestamp: &str,
    method: &str,
    path: &str,
) -> bool {
    let ts: u64 = match timestamp.parse() {
        Ok(t) => t,
        Err(_) => return false,
    };
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    if now.saturating_sub(ts) > 30_000 {
        return false;
    }

    let pub_bytes = match STANDARD.decode(public_key_b64) {
        Ok(b) => b,
        Err(_) => return false,
    };
    let point = match EncodedPoint::from_bytes(&pub_bytes) {
        Ok(p) => p,
        Err(_) => return false,
    };
    let verifying_key = match VerifyingKey::from_encoded_point(&point) {
        Ok(k) => k,
        Err(_) => return false,
    };

    let sig_bytes = match STANDARD.decode(signature_b64) {
        Ok(b) => b,
        Err(_) => return false,
    };
    let signature = match Signature::from_slice(&sig_bytes) {
        Ok(s) => s,
        Err(_) => return false,
    };

    let message = format!("{}:{}:{}", method, path, timestamp);

    verifying_key.verify(message.as_bytes(), &signature).is_ok()
}

