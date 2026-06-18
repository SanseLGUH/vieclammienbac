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
pub struct News {
    pub id: Uuid,
    pub thumbnail: String,
    pub title: String,
    pub description: String,
    pub redirect: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateNewsDto {
    pub thumbnail: String,
    pub title: String,
    pub description: String,
    pub redirect: String,
}

impl Model for News {
    type CreateDto = CreateNewsDto;
    type Id = Uuid; 

    fn table_name() -> &'static str {
        "blog.news"
    }

    fn fields() -> &'static [&'static str] {
        &["thumbnail", "title", "description", "redirect"] 
    }

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&self.thumbnail) 
         .bind(&self.title)
         .bind(&self.description)
         .bind(&self.redirect)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(&dto.thumbnail) 
         .bind(&dto.title)
         .bind(&dto.description)
         .bind(&dto.redirect)
    }
}

impl News {
    pub async fn list(
        pool: &PgPool,
        limit: i32,
        offset: i32,
    ) -> Result<Vec<News>, sqlx::Error> {
        sqlx::query_as::<_, News>(
            "SELECT *
             FROM blog.news
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2" 
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}