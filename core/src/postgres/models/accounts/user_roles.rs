use crate::postgres::Model;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, types::Uuid};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct UserRoles {
    pub user_id: Uuid,
    pub role_id: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRolesDto {
    pub user_id: Uuid,
    pub role_id: i32,
}

#[async_trait]
impl Model for UserRoles {
    type Id = Uuid; // user_id as the primary lookup key
    type CreateDto = CreateUserRolesDto;

    fn table_name() -> &'static str {
        "accounts.user_roles"
    }

    fn fields() -> &'static [&'static str] {
        &["user_id", "role_id"]
    }

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(self.user_id).bind(self.role_id)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(dto.user_id).bind(dto.role_id)
    }
}

impl UserRoles {
    pub async fn by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>(
            "SELECT * FROM accounts.user_roles WHERE user_id = $1"
        )
        .bind(user_id)
        .fetch_all(pool)
        .await
    }

    pub async fn remove(pool: &PgPool, user_id: Uuid, role_id: i32) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM accounts.user_roles WHERE user_id = $1 AND role_id = $2")
            .bind(user_id)
            .bind(role_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}