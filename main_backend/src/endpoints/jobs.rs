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
struct SearchQuery {
    limit: Option<i32>,
    start: Option<i32>,
    d: String
}

#[get("/search")]
async fn search(query: web::Query<SearchQuery>) -> impl Responder {
    let pool = db_pool().await;

    let limit = query.limit.unwrap_or(10);
    let offset = query.start.unwrap_or(0);

    match Job::search(pool, &query.d, limit, offset).await {
        Ok(r) => HttpResponse::Ok().json(r),
        Err(_) => HttpResponse::BadRequest().finish()
    }
}

#[derive(Deserialize)]
struct ListQuery {
    limit: Option<i32>,
    start: Option<i32>,
    /// "lat,lng,radius_km" e.g. "21.0285,105.8542,20"
    geo: Option<String>,
}

struct GeoFilter {
    lat: f64,
    lng: f64,
    radius_km: f64,
}

impl GeoFilter {
    fn parse(raw: &str) -> Result<Self, String> {
        let parts: Vec<&str> = raw.split(',').map(str::trim).collect();
        if parts.len() != 3 {
            return Err("geo must be in the form 'lat,lng,radius_km'".into());
        }

        let lat = parts[0]
            .parse::<f64>()
            .map_err(|_| "invalid lat in geo param".to_string())?;
        let lng = parts[1]
            .parse::<f64>()
            .map_err(|_| "invalid lng in geo param".to_string())?;
        let radius_km = parts[2]
            .parse::<f64>()
            .map_err(|_| "invalid radius_km in geo param".to_string())?;

        if !(-90.0..=90.0).contains(&lat) {
            return Err("lat must be between -90 and 90".into());
        }
        if !(-180.0..=180.0).contains(&lng) {
            return Err("lng must be between -180 and 180".into());
        }
        if radius_km <= 0.0 {
            return Err("radius_km must be positive".into());
        }

        Ok(GeoFilter { lat, lng, radius_km })
    }
}

#[get("")]
async fn all_jobs(query: web::Query<ListQuery>) -> impl Responder {
    let pool = db_pool().await;

    let limit = query.limit.unwrap_or(10);
    let offset = query.start.unwrap_or(0);

    match &query.geo {
        Some(raw) => match GeoFilter::parse(raw) {
            Ok(geo) => {
                match Job::find_by_location_range(pool, geo.lat, geo.lng, geo.radius_km, limit, offset).await {
                    Ok(jobs) => HttpResponse::Ok().json(jobs),
                    Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
                }
            }
            Err(msg) => HttpResponse::BadRequest().body(msg),
        },
        None => match Job::list_preview(pool, limit, offset).await {
            Ok(jobs) => HttpResponse::Ok().json(jobs),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        },
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
            .service(search)
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