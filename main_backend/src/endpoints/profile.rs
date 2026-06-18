use actix_web::{
    web::{self, ServiceConfig}, Responder, HttpResponse, HttpRequest,
};
use serde::Deserialize;
use sqlx::types::Uuid;
use vmb_core::postgres::{
    db_pool, Model, models::accounts::{media_assets::UserMediaAssets, users::User},
};
use vmb_core::{
    middleware::user::Sec, utils::token::extract_id
};

#[derive(Deserialize)]
struct ChangeMediaDto {
    id: Uuid,
}

fn authenticated_user_id(req: &HttpRequest) -> Option<Uuid> {
    req.cookie("VMB_TOKEN")
        .map(|c| c.value().to_string())
        .and_then(|t| extract_id(&t))
}

async fn get(req: HttpRequest) -> impl Responder {
    let user_id = match authenticated_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let pool = db_pool().await;

    match User::get_profile(&pool, user_id).await {
        Ok(Some(user)) => HttpResponse::Ok().json(user),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn change_avatar(req: HttpRequest, body: web::Json<ChangeMediaDto>) -> impl Responder {
    let user_id = match authenticated_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().finish(),
    };
    let pool = db_pool().await;
    match UserMediaAssets::set_avatar(&pool, user_id, body.id).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn change_banner(req: HttpRequest, body: web::Json<ChangeMediaDto>) -> impl Responder {
    let user_id = match authenticated_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let pool = db_pool().await;
    
    match UserMediaAssets::set_banner(&pool, user_id, body.id).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub fn configure(cfg: &mut ServiceConfig) {
    cfg.service(
        web::scope("/profile")
            .wrap(Sec)
            .route("", web::get().to(get))
            .route("/avatar", web::put().to(change_avatar))
            .route("/banner", web::put().to(change_banner))
    );
}