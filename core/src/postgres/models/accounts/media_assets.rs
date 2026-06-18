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
pub struct UserMediaAssets {
    pub owner_id: Uuid,
    pub avatar: Option<Uuid>,
    pub banner: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserAssetsMediaDto {
    pub owner_id: Uuid,
    pub avatar: Option<Uuid>,
    pub banner: Option<Uuid>,
}

impl Model for UserMediaAssets {
    type CreateDto = CreateUserAssetsMediaDto;
    type Id = Uuid;

    fn id_column() -> &'static str {
        "owner_id"
    }

    fn table_name() -> &'static str {
        "accounts.media_assets"
    }

    fn fields() -> &'static [&'static str] {
        &["avatar", "banner", "updated_at"]
    }

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(self.avatar).bind(self.banner).bind(self.updated_at)
    }

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments> {
        q.bind(dto.owner_id).bind(dto.avatar).bind(dto.banner)
    }
}

impl UserMediaAssets {
    pub async fn set_avatar(pool: &PgPool, owner_id: Uuid, avatar_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO accounts.media_assets (owner_id, avatar, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (owner_id)
            DO UPDATE SET avatar = EXCLUDED.avatar, updated_at = NOW()
            "#,
        )
        .bind(owner_id)
        .bind(avatar_id)
        .execute(pool)
        .await?;
        Ok(())
    }

    pub async fn set_banner(pool: &PgPool, owner_id: Uuid, banner_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO accounts.media_assets (owner_id, banner, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (owner_id)
            DO UPDATE SET banner = EXCLUDED.banner, updated_at = NOW()
            "#,
        )
        .bind(owner_id)
        .bind(banner_id)
        .execute(pool)
        .await?;
        Ok(())
    }
}