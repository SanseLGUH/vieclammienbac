use crate::postgres::Model;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Roles {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateRolesDto {
    pub id: i32,
    pub name: String,
}

impl Model for Roles {
    type CreateDto = CreateRolesDto;
    type Id = i32;

    fn table_name() -> &'static str {
        "accounts.roles"
    }

    fn fields() -> &'static [&'static str] {
        &["id", "name"]
    }

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q
            .bind(&self.id)
            .bind(&self.name)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q
            .bind(&dto.id)
            .bind(&dto.name)
    }
}