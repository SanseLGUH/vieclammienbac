use std::future::{ready, Ready};
use actix_web::{
    Error, HttpResponse,
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    body::EitherBody,
};
use futures_util::future::LocalBoxFuture;
use crate::utils::token::verify_token;
use crate::utils::redis;

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
        // Extract token string before moving req
        let token = req
            .cookie("VMB_TOKEN")
            .map(|c| c.value().to_string());

        // Verify token signature + expiry, extract user_id
        let user_id = token.as_deref().and_then(verify_token);

        // Reject early if token invalid (sync check, no async needed)
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
            let session = redis::get("session", &user_id).await;

            match session {
                Ok(Some(stored_token)) if stored_token == token => {
                    // Valid session — proceed
                    let res = fut.await?;
                    Ok(res.map_into_left_body())
                }
                _ => {
                    // Session missing, expired, or token mismatch (stolen/logout)
                    // We need to drop fut to get req back — just return unauthorized
                    drop(fut);
                    Err(actix_web::error::ErrorUnauthorized(
                        serde_json::json!({
                            "error": "Unauthorized",
                            "message": "Session expired or invalid"
                        }).to_string()
                    ))
                }
            }
        })
    }
}