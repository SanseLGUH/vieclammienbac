use crate::postgres::Model;
use serde::{Deserialize, Serialize};
use sqlx::{
    FromRow,
    types::{
        chrono::{DateTime, Utc},
        Uuid,
    },
};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct JobLocation {
    pub job_id: Uuid,
    pub label: Option<String>,
    pub lat: Option<f64>,
    pub lng: Option<f64>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJobLocationDto {
    pub job_id: Uuid,
    pub label: Option<String>,
    pub lat: Option<f64>,
    pub lng: Option<f64>,
}

impl Model for JobLocation {
    type CreateDto = CreateJobLocationDto;
    type Id = Uuid;

    fn id_column() -> &'static str {
        "job_id"
    }
    
    fn table_name() -> &'static str {
        "blog.job_locations"
    }

    fn fields() -> &'static [&'static str] {
        &["job_id", "label", "lat", "lng"]
    }
    
    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&self.job_id)
         .bind(&self.label)
         .bind(self.lat)
         .bind(self.lng)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&dto.job_id)
         .bind(&dto.label)
         .bind(dto.lat)
         .bind(dto.lng)
    }
}