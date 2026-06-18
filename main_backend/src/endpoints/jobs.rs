use vmb_core::postgres::{
    db_pool, models::blog::jobs::{Job, CreateJobDto}, Model
};
use actix_web::{
    get,
    web::{self, ServiceConfig, Path, Json}, 
    HttpResponse, Responder
};
use serde::Deserialize;
use sqlx::types::Uuid;
use std::str::FromStr;

#[derive(Deserialize)]
struct ListQuery {
    limit: Option<i32>,
    start: Option<i32>
}

#[get("")]
async fn all_jobs(query: web::Query<ListQuery>) -> impl Responder {
    let pool = db_pool().await;
    let limit = query.limit.unwrap_or(10);
    let offset = query.start.unwrap_or(0);
    match Job::list_preview(pool, limit, offset).await {
        Ok(jobs) => HttpResponse::Ok().json(jobs),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[get("/{id}")]
pub async fn job_details(path: Path<String>) -> impl Responder {
    let id = match Uuid::from_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };
    let pool = db_pool().await;
    match Job::get(pool, id).await {
        Ok(Some(job)) => HttpResponse::Ok().json(job),
        Ok(None) => HttpResponse::NotFound().body("Job not found"),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn create_job(body: Json<CreateJobDto>) -> impl Responder {
    let pool = db_pool().await;
    let job_data = body.into_inner();
    match Job::create(pool, job_data).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({ "status": "success", "message": "Job created successfully" })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn edit_job(path: Path<String>, body: Json<CreateJobDto>) -> impl Responder {
    let id = match Uuid::from_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };
    let pool = db_pool().await;
    let job_data = body.into_inner();
    match Job::edit_with_dto(pool, id, job_data).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({ "status": "success", "message": "Job updated successfully" })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn delete_job(path: Path<String>) -> impl Responder {
    let id = match Uuid::from_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };
    let pool = db_pool().await;
    match Job::delete(pool, id).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({ "status": "success", "message": "Job deleted successfully" })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

use vmb_core::middleware::admin::Sec;

pub fn configure(cfg: &mut ServiceConfig) {
    cfg.service(
        web::scope("/jobs")
            .service(all_jobs)
            .service(job_details)
            .service(
                web::resource("")
                    .wrap(Sec)
                    .route(web::post().to(create_job))
            )
            .service(
                web::resource("/{id}")
                    .wrap(Sec)
                    .route(web::put().to(edit_job))
                    .route(web::delete().to(delete_job))
            )
    );
}