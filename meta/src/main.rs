pub mod endpoints;

use vmb_core::postgres::migrator::execute as ExecuteMigrator;
use actix_web::{App, HttpServer, http};
use actix_cors::Cors;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    ExecuteMigrator().await;

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
            .configure(endpoints::configure)
    })
    .bind(("127.0.0.1", 5678))?
    .run()
    .await
}