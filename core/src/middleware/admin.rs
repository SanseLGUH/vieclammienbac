use std::future::{ready, Ready};
use actix_web::{
    Error, HttpResponse,
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    body::EitherBody,
};
use futures_util::future::LocalBoxFuture;
use crate::utils::token::verify_token;
use crate::utils::redis;
use crate::postgres::{db_pool, models::accounts::user_roles::UserRoles};

use sqlx::types::Uuid;

pub struct Sec;

impl<S, B> Transform<S, ServiceRequest> for Sec
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type InitError = ();
    type Transform = SecMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(SecMiddleware { service }))
    }
}

pub struct SecMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for SecMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let token = req
            .cookie("VMB_TOKEN")
            .map(|c| c.value().to_string());

        // verify_token returns String — parse it into Uuid here
        let user_id: Option<Uuid> = token
            .as_deref()
            .and_then(verify_token)                        // returns Option<String> or Option<Uuid>?
            .and_then(|id| Uuid::parse_str(&id).ok()); // 👈 if verify_token returns String

        let (user_id, token) = match (user_id, token) {
            (Some(uid), Some(tok)) => (uid, tok),
            _ => {
                let (req, _pl) = req.into_parts();
                let response = HttpResponse::Unauthorized()
                    .json(serde_json::json!({
                        "error": "Unauthorized",
                        "message": "Invalid or missing token"
                    }))
                    .map_into_right_body();
                return Box::pin(async move {
                    Ok(ServiceResponse::new(req, response))
                });
            }
        };

        let fut = self.service.call(req);

        Box::pin(async move {
            let pool = db_pool().await;

            let user_id_str = user_id.to_string();
            let session = redis::get("session", &user_id_str).await;
            
            match session {
                Ok(Some(stored_token)) if stored_token == token => {}
                _ => {
                    drop(fut);
                    return Err(actix_web::error::ErrorUnauthorized(
                        serde_json::json!({
                            "error": "Unauthorized",
                            "message": "Session expired or invalid"
                        }).to_string()
                    ));
                }
            }

            let user_roles = UserRoles::by_user(&pool, user_id).await
                .unwrap_or_default();

            let is_admin = user_roles.iter().any(|r| r.role_id == 0);

            if !is_admin {
                drop(fut);
                return Err(actix_web::error::ErrorForbidden(
                    serde_json::json!({
                        "error": "Forbidden",
                        "message": "Admin access required"
                    }).to_string()
                ));
            }

            let res = fut.await?;
            Ok(res.map_into_left_body())
        })
    }
}