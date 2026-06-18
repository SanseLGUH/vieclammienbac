use crate::postgres::Model;
use serde::{Deserialize, Serialize};
use sqlx::{
    FromRow,
    types::chrono::{DateTime, Utc},
};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Metadata {
    pub name: String,
    pub json: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMetadataDto {
    pub json: serde_json::Value,
}

impl Model for Metadata {
    type CreateDto = CreateMetadataDto;
    type Id = String;

    fn table_name() -> &'static str {
        "metadatas"
    }

    fn id_column() -> &'static str {
        "name"
    }

    fn fields() -> &'static [&'static str] {
        &["json"]
    }

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&self.json)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&dto.json)
    }
}