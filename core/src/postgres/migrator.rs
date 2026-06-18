use sqlx::migrate::Migrator;

pub static MIGRATOR: Migrator = sqlx::migrate!("./migrations");

use crate::postgres::{Model, models::accounts::roles::{Roles, CreateRolesDto}};

pub async fn execute() {
    let pool = crate::postgres::db_pool().await;

    MIGRATOR.run(pool).await.expect("Migration failed");	

    let _ = Roles::create(pool, CreateRolesDto {
        id: 0,
        name: "admin".to_string()
    }).await;

    let _ = Roles::create(pool, CreateRolesDto {
        id: 1,
        name: "editor".to_string()
    }).await;

    let _ = Roles::create(pool, CreateRolesDto {
        id: 2,
        name: "user".to_string()
    }).await;
}