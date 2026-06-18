use crate::postgres::Model;
use serde::{Deserialize, Serialize};
use sqlx::{
    FromRow, PgPool,
    types::{
        chrono::{DateTime, Utc},
        Uuid,
    },
};
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Job {
    pub id: Uuid,
    pub title: String,
    pub company: String,
    pub image: String,
    pub description: String, 
    pub content: String,
    pub salary: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJobDto {
    pub title: String,
    pub company: String,
    pub image: String,
    pub description: String,
    pub content: String,
    pub salary: String,
}

impl Model for Job {
    type CreateDto = CreateJobDto;
    type Id = Uuid;

    fn table_name() -> &'static str {
        "blog.jobs"
    }

    fn fields() -> &'static [&'static str] {
        &["title", "company", "image", "description", "content", "salary"]
    }

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&self.title)
         .bind(&self.company)
         .bind(&self.image)
         .bind(&self.description)
         .bind(&self.content)
         .bind(&self.salary)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&dto.title)
         .bind(&dto.company)
         .bind(&dto.image)
         .bind(&dto.description)
         .bind(&dto.content)
         .bind(&dto.salary)
    }
}

// List page — no content
#[derive(Debug, Serialize, FromRow)]
pub struct JobPreview {
    pub id: Uuid,
    pub title: String,
    pub company: String,
    pub image: String,
    pub description: String,
    pub salary: String,
    pub created_at: DateTime<Utc>,
}

impl Job {
    pub async fn list_preview(
        pool: &PgPool,
        limit: i32,
        offset: i32,
    ) -> Result<Vec<JobPreview>, sqlx::Error> {
        sqlx::query_as::<_, JobPreview>(
            "SELECT id, title, company, image, description, salary, created_at
             FROM blog.jobs          -- ← changed
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}