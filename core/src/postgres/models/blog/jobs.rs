use crate::postgres::Model;
use serde::{Deserialize, Serialize};
use sqlx::{
    FromRow, PgPool, QueryBuilder, Postgres,
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

#[derive(Debug, Serialize, FromRow)]
pub struct JobNearby {
    pub id: Uuid,
    pub title: String,
    pub company: String,
    pub image: String,
    pub description: String,
    pub salary: String,
    pub created_at: DateTime<Utc>,
    pub distance_km: f64,
    pub lat: f64,
    pub lng: f64,
}


impl Job {
    pub async fn list_preview(
        pool: &PgPool,
        limit: i32,
        offset: i32,
    ) -> Result<Vec<JobPreview>, sqlx::Error> {
        sqlx::query_as::<_, JobPreview>(
            "SELECT id, title, company, image, description, salary, created_at
             FROM blog.jobs
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }

    pub async fn search(
        pool: &PgPool,
        d: &str,
        limit: i32,
        offset: i32,
    ) -> Result<Vec<JobPreview>, sqlx::Error> {
        let mut qb: QueryBuilder<Postgres> = QueryBuilder::new(
            "SELECT id, title, company, image, description, salary, created_at
             FROM blog.jobs"
        );
     
        let term = d.trim();
     
        if !term.is_empty() {
            let pattern = format!("%{}%", term);
     
            qb.push(" WHERE (");
            qb.push("title ILIKE ").push_bind(pattern.clone());
            qb.push(" OR company ILIKE ").push_bind(pattern.clone());
            qb.push(" OR description ILIKE ").push_bind(pattern);
            qb.push(")");
        }
     
        qb.push(" ORDER BY created_at DESC");
        qb.push(" LIMIT ").push_bind(limit);
        qb.push(" OFFSET ").push_bind(offset);
     
        qb.build_query_as::<JobPreview>()
            .fetch_all(pool)
            .await
    }

    pub async fn find_by_location_range(
        pool: &PgPool,
        lat: f64,
        lng: f64,
        radius_km: f64,
        limit: i32,
        offset: i32,
    ) -> Result<Vec<JobNearby>, sqlx::Error> {
        sqlx::query_as::<_, JobNearby>(
            r#"
            SELECT
                j.id,
                j.title,
                j.company,
                j.image,
                j.description,
                j.salary,
                j.created_at,
                dist.distance_km,
                dist.lat,
                dist.lng
            FROM blog.jobs j
            JOIN (
                SELECT DISTINCT ON (jl.job_id)
                    jl.job_id,
                    jl.lat,
                    jl.lng,
                    6371 * acos(
                        LEAST(1.0, GREATEST(-1.0,
                            cos(radians($1)) * cos(radians(jl.lat)) *
                            cos(radians(jl.lng) - radians($2)) +
                            sin(radians($1)) * sin(radians(jl.lat))
                        ))
                    ) AS distance_km
                FROM blog.job_locations jl
                WHERE jl.lat IS NOT NULL AND jl.lng IS NOT NULL
                ORDER BY jl.job_id, distance_km ASC
            ) dist ON dist.job_id = j.id
            WHERE dist.distance_km <= $3
            ORDER BY dist.distance_km ASC
            LIMIT $4 OFFSET $5
            "#,
        )
        .bind(lat)
        .bind(lng)
        .bind(radius_km)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
    }
}