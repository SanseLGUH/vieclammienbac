use actix_web::web::{self, ServiceConfig, Json, Path};
use actix_web::HttpResponse;
use vmb_core::{
    postgres::{db_pool, Model},
    postgres::models::meta::{Metadata, CreateMetadataDto},
    middleware::admin::Sec,
};

pub fn configure(cfg: &mut ServiceConfig) {
    cfg.service(
        web::scope("/")
            .route("",          web::get().to(get_all))
            .route("/{name}",   web::get().to(get_one))
            .service(
                web::scope("/admin")
                    .wrap(Sec)
                    .route("",          web::post().to(create))
                    .route("/{name}",   web::put().to(edit))
                    .route("/{name}",   web::delete().to(delete)),
            ),
    );
}

async fn get_all() -> HttpResponse {
    let pool = db_pool().await;
    match Metadata::all(pool).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(e)   => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_one(path: Path<String>) -> HttpResponse {
    let pool = db_pool().await;
    match Metadata::get(pool, path.into_inner()).await {
        Ok(Some(m)) => HttpResponse::Ok().json(m),
        Ok(None)    => HttpResponse::NotFound().finish(),
        Err(e)      => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn create(body: Json<CreateMetadataDto>) -> HttpResponse {
    let pool = db_pool().await;
    match Metadata::create(pool, body.into_inner()).await {
        Ok(m)  => HttpResponse::Created().json(m),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn edit(path: Path<String>, body: Json<CreateMetadataDto>) -> HttpResponse {
    let pool = db_pool().await;
    match Metadata::edit_with_dto(pool, path.into_inner(), body.into_inner()).await {
        Ok(_)  => HttpResponse::Ok().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn delete(path: Path<String>) -> HttpResponse {
    let pool = db_pool().await;
    match Metadata::delete(pool, path.into_inner()).await {
        Ok(_)  => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}