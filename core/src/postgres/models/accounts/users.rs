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
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserDto {
    pub email: String,
    pub username: String,
    pub password_hash: String,
}

impl Model for User {
    type CreateDto = CreateUserDto;
    type Id = Uuid;

    fn table_name() -> &'static str {
        "accounts.users"
    }

    fn fields() -> &'static [&'static str] {
        &["email", "username", "password_hash"]
    }

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q
            .bind(&self.email)
            .bind(&self.username)
            .bind(&self.password_hash)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q
            .bind(&dto.email)
            .bind(&dto.username)
            .bind(&dto.password_hash)
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct UserProfile {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub avatar: Uuid,
    pub banner: Uuid,
    pub created_at: DateTime<Utc>,
}

impl User {
    pub async fn get_by_email(pool: &PgPool, email: &str) -> Result<Self, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM accounts.users WHERE email = $1"
        )
        .bind(email)
        .fetch_one(pool)
        .await
    }
    
    pub async fn get_profile(pool: &PgPool, id: Uuid) -> Result<Option<UserProfile>, sqlx::Error> {
        sqlx::query_as::<_, UserProfile>(
            r#"
            SELECT
            u.id,
            u.username,
            u.email,
            COALESCE(m.avatar, '4dedc6a2-1a0b-434e-b76a-982f037267dc') AS avatar,
            COALESCE(m.banner, '4dedc6a2-1a0b-434e-b76a-982f037267dc') AS banner,
            u.created_at
            FROM accounts.users u
            LEFT JOIN accounts.media_assets m ON m.owner_id = u.id
            WHERE u.id = $1            
        "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await
    }
}