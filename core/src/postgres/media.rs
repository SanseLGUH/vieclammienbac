use sqlx::types::Uuid;

pub const ALLOWED_MEDIA_HOST: &str = "drive.vieclammienbac.com";

pub fn create_media_url(id: Uuid) -> String {
    format!("https://{}/{}", ALLOWED_MEDIA_HOST, id)
}