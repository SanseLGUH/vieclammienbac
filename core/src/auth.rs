use crate::{
    utils::{
        token::generate_token,
        mail::{EmailClient, EmailMessage},
        password::{hash_password, verify_hash} 
    },
    postgres::{db_pool, Model, models::accounts::users::{User, CreateUserDto}},
};

use actix_web::{ 
    cookie::{time::Duration, Cookie, SameSite}, 
    post, delete, Responder, HttpResponse, 
    web::{self, ServiceConfig, Json} 
};

use serde::Deserialize;

#[derive(Deserialize)]
struct RegisterRequest {
    email: String,
    username: String,
    password: String,
}

#[post("/auth/register")]
pub async fn register(body: Json<RegisterRequest>, email_client: web::Data<EmailClient>) -> impl Responder {
    let pool = db_pool().await;
    
    if let Ok(_found) = User::get_by_email(pool, &body.email).await {
        return HttpResponse::Conflict().json(serde_json::json!({
            "error": "Email already registered"
        }));
    }

    let code = rand::random::<u32>() % 1_000_000;
    let code_str = format!("{:06}", code);
    
    let password = body.password.clone();
    let hpassword = match actix_web::web::block(move || hash_password(&password)).await {
        Ok(Ok(h)) => h,
        _ => return HttpResponse::InternalServerError().finish(),
    };
    
    let results = futures::try_join!(
        crate::utils::redis::set("register:code", &body.email, &code_str, Some(300)),
        crate::utils::redis::set("register:username", &body.email, &body.username, Some(300)),
        crate::utils::redis::set("register:password", &body.email, &hpassword, Some(300)),
    );

    let email_clone = body.email.clone();
    let code_clone = code_str.clone();
    actix_web::rt::spawn(async move {
        email_client.send(EmailMessage {
            to_email: email_clone.clone(),
            subject: "Welcome!".to_string(),
            preview: "Welcome to our platform".to_string(),
            html: format!("<h1>Welcome! {}</h1>", code_clone),
        }).ok();
    });

    match results {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[derive(Deserialize)]
pub struct VerifyRequest {
    email: String,
    code: String,
}

#[post("/auth/register/verify")]
pub async fn register_verify(
    body: Json<VerifyRequest>,
) -> impl Responder {
    // fetch all pending data from redis
    let results = futures::try_join!(
        crate::utils::redis::get("register:code", &body.email),
        crate::utils::redis::get("register:username", &body.email),
        crate::utils::redis::get("register:password", &body.email),
    );

    let (stored_code, username, hpassword) = match results {
        Ok((Some(c), Some(u), Some(p))) => (c, u, p),
        Ok(_) => return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Code expired or not found"
        })),
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    if stored_code != body.code {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid code"
        }));
    }

    let pool = db_pool().await;

    match User::create(pool, CreateUserDto {
        email: body.email.clone(),
        username,
        password_hash: hpassword
    }).await {
        Ok(user) => {
            let token = generate_token(&user.id.to_string());
            let user_id_str = user.id.to_string();            
            
            let _ = futures::try_join!(
                crate::utils::redis::delete("register:code", &body.email),
                crate::utils::redis::delete("register:username", &body.email),
                crate::utils::redis::delete("register:password", &body.email),
                crate::utils::redis::set("session", &user_id_str, &token, Some(30 * 24 * 60 * 60)) 
            );

            HttpResponse::Ok()
                .cookie(
                    Cookie::build("VMB_TOKEN", token)
                        .domain(".vieclammienbac.com")
                        .http_only(true)
                        .secure(true)
                        .same_site(SameSite::None)
                        .max_age(Duration::hours(24))
                        .path("/")
                        .finish(),
                )
                .json(serde_json::json!({ "status": "success" }))
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[post("/auth/login")]
pub async fn login(body: Json<LoginRequest>, email_client: web::Data<EmailClient>) -> impl Responder {
    let pool = db_pool().await;

    let user = match User::get_by_email(pool, &body.email).await {
        Ok(result) => result,
        Err(_) => return HttpResponse::NotFound().finish()
    };
    
    let password = body.password.clone();
    let hash = user.password_hash.clone();
    let verified = match actix_web::web::block(move || verify_hash(&password, &hash)).await {
        Ok(Ok(r)) => r,
        _ => return HttpResponse::InternalServerError().finish(),
    };

    if !verified {
        return HttpResponse::Unauthorized().finish();
    }

    let code = rand::random::<u32>() % 1_000_000;
    let code_str = format!("{:06}", code);

    if crate::utils::redis::set("login:code", &body.email, &code_str, Some(300)).await.is_err() {
        return HttpResponse::InternalServerError().finish();
    }

    let email_clone = body.email.clone();
    let code_clone = code_str.clone();
    actix_web::rt::spawn(async move {
        email_client.send(EmailMessage {
            to_email: email_clone.clone(),
            subject: "Welcome!".to_string(),
            preview: "Welcome to our platform".to_string(),
            html: format!("<h1>Welcome! {}</h1>", code_clone),
        }).ok();
    });

    HttpResponse::Ok().finish()
}

#[post("/auth/login/verify")]
pub async fn login_verify(body: Json<VerifyRequest>) -> impl Responder {
    let stored_code = match crate::utils::redis::get("login:code", &body.email).await {
        Ok(Some(c)) => c,
        Ok(None) => return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Code expired or not found"
        })),
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    if stored_code != body.code {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid code"
        }));
    }

    let pool = db_pool().await;
    let user = match User::get_by_email(pool, &body.email).await {
        Ok(u) => u,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let token = generate_token(&user.id.to_string());
    let user_id_str = user.id.to_string();

    let _ = futures::try_join!(
        crate::utils::redis::delete("login:code", &body.email),
        crate::utils::redis::set("session", &user_id_str, &token, Some(30 * 24 * 60 * 60))
    );

    HttpResponse::Ok()
        .cookie(
            Cookie::build("VMB_TOKEN", token)
                .domain(".vieclammienbac.com")
                .http_only(true)
                .secure(true)
                .same_site(SameSite::None)
                .max_age(Duration::days(30))
                .path("/")
                .finish(),
        )
        .json(serde_json::json!({ "status": "success" }))
}

#[delete("/auth/logout")]
pub async fn logout() -> impl Responder {
    HttpResponse::Ok()
        .cookie(
            Cookie::build("VMB_TOKEN", "")
                .domain(".vieclammienbac.com")
                .http_only(true)
                .secure(true)
                .same_site(SameSite::None)
                .max_age(Duration::ZERO)
                .path("/")
                .finish(),
        )
        .finish()
}

use crate::middleware::user::Sec;

pub async fn validate() -> impl Responder {
    HttpResponse::Ok().finish()
}

pub fn configure(cfg: &mut ServiceConfig) {
    cfg
        .service(register)
        .service(register_verify)
        .service(login)
        .service(login_verify)
        .service(logout)
        .service(
            web::resource("/auth/validate")
                .wrap(Sec)
                .route(web::get().to(validate))
        );
}