use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use crate::SECRET_KEY;

type HmacSha256 = Hmac<Sha256>;

pub fn generate_token(user_id: &str) -> String {
    let expires_at = chrono::Utc::now().timestamp() + 30 * 24 * 60 * 60;
    
    let part1 = URL_SAFE_NO_PAD.encode(user_id.to_string());
    let part2 = URL_SAFE_NO_PAD.encode(expires_at.to_string());
    let payload = format!("{}|VMB|{}", part1, part2);
    let mut mac = <HmacSha256>::new_from_slice(SECRET_KEY.as_bytes()).unwrap();
    mac.update(payload.as_bytes());
    let signature = URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());
    format!("{}|VMB|{}", payload, signature)
}

pub fn verify_token(token: &str) -> Option<String> {
    let parts: Vec<&str> = token.splitn(3, "|VMB|").collect();
    if parts.len() != 3 { return None; }
    let (part1, part2, sig) = (parts[0], parts[1], parts[2]);
    let payload = format!("{}|VMB|{}", part1, part2);
    let mut mac = <HmacSha256>::new_from_slice(SECRET_KEY.as_bytes()).unwrap();
    mac.update(payload.as_bytes());
    let expected = URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());
    if sig != expected { return None; }
    let expires_bytes = URL_SAFE_NO_PAD.decode(part2).ok()?;
    let expires_at: i64 = String::from_utf8(expires_bytes).ok()?.parse().ok()?;
    if chrono::Utc::now().timestamp() > expires_at { return None; }
    let user_id_bytes = URL_SAFE_NO_PAD.decode(part1).ok()?;
    let user_id = String::from_utf8(user_id_bytes).ok()?;
    Some(user_id)
}

use sqlx::types::Uuid;

pub fn extract_id(token: &str) -> Option<Uuid> {
    verify_token(token)
        .and_then(|id| Uuid::parse_str(&id).ok())
}