pub mod endpoints;

use vmb_core::{
    postgres::migrator::execute as ExecuteMigrator,
    utils::mail::EmailClient
};
use actix_web::{web, App, HttpServer, http};
use actix_cors::Cors;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::TRACE)
        .init();

    ExecuteMigrator().await;

    let email_client = web::Data::new(
        EmailClient::new(
            "support@vieclammienbac.com",
            "Metro170",
            "mail.vieclammienbac.com",
        ).expect("Failed to create email client")
    );

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("https://vieclammienbac.com")
            .allowed_origin("https://new.vieclammienbac.com")
            .allowed_origin_fn(|origin, _req_head| {
                origin.as_bytes().ends_with(b".vieclammienbac.com")
            })
            .allowed_methods(vec!["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                http::header::CONTENT_TYPE,
                http::header::COOKIE,
            ])
            .expose_headers(vec![http::header::SET_COOKIE])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(email_client.clone())
            .configure(vmb_core::auth::configure)
            .configure(endpoints::profile::configure)
            .configure(endpoints::news::configure)
            .configure(endpoints::jobs::configure)
    })
    .bind(("127.0.0.1", 9856))?
    .run()
    .await
}