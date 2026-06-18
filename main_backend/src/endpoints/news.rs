use vmb_core::postgres::{
    db_pool, models::blog::news::{News, CreateNewsDto}, Model
};
use actix_web::{
    web::{self, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder,
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PaginationQuery {
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

pub async fn list(
    query: Query<PaginationQuery>,
) -> impl Responder {
    let pool = db_pool().await;

    let limit = query.limit.unwrap_or(10);
    let offset = query.offset.unwrap_or(0);

    match News::list(&pool, limit, offset).await {
        Ok(news) => HttpResponse::Ok().json(news),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn create(
    body: Json<CreateNewsDto>,
) -> impl Responder {
    let pool = db_pool().await;

    match News::create(&pool, body.into_inner()).await {
        Ok(news) => HttpResponse::Created().json(news),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn edit(id: Path<String>, body: Json<CreateNewsDto>) -> impl Responder {
    let uuid = match id.parse::<sqlx::types::Uuid>() {
        Ok(u) => u,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };

    let pool = db_pool().await;
    let dto = body.into_inner();

    match News::edit_with_dto(&pool, uuid, dto).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({ "status": "success", "message": "Job updated successfully" })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn delete(
    id: Path<String>,
) -> impl Responder {
    let pool = db_pool().await;

    let uuid = match id.parse::<sqlx::types::Uuid>() {
        Ok(u) => u,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };

    match News::delete(&pool, uuid).await {
        Ok(()) => HttpResponse::Ok().body("Deleted"),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

use vmb_core::middleware::admin::Sec;

pub fn configure(cfg: &mut ServiceConfig) {
    cfg.service(
        web::scope("/news")
            .route("", web::get().to(list))
            .service(
                web::resource("")
                    .wrap(Sec)
                    .route(web::post().to(create))
            )
            .service(
                web::resource("/{id}")
                    .wrap(Sec)
                    .route(web::put().to(edit))
                    .route(web::delete().to(delete))
            )
    );
}