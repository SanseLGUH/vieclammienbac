pub mod migrator;
pub mod media;
pub mod models;

use sqlx::{types::Uuid, PgPool, postgres::PgRow, Error, FromRow};
use tokio::sync::OnceCell;

static DB_POOL: OnceCell<PgPool> = OnceCell::const_new();

pub async fn db_pool() -> &'static PgPool {
    DB_POOL.get_or_init(|| async {
        // postgresql://postgres:NewBerry170@localhost:5432/vieclammienbac
        PgPool::connect("postgresql://postgres:NewBerry170@localhost:5432/vieclammienbac")
            .await
            .expect("Failed to create pool")
    }).await
}

use async_trait::async_trait;

pub trait ModelId:
    Send + Sync + Clone +
    for<'q> sqlx::Encode<'q, sqlx::Postgres> +
    sqlx::Type<sqlx::Postgres> +
    'static
{}

impl ModelId for String {}
impl ModelId for i32 {}
impl ModelId for i64 {}
impl ModelId for Uuid {}

pub enum OrderDir { Asc, Desc }

impl OrderDir {
    fn as_str(&self) -> &str {
        match self { Self::Asc => "ASC", Self::Desc => "DESC" }
    }
}

#[async_trait]
pub trait Model: Sized + Send + Sync + Unpin + for<'r> FromRow<'r, PgRow> {
    type Id: ModelId;
    type CreateDto: Send;

    fn table_name() -> &'static str;

    fn id_column() -> &'static str {
        "id"
    }

    fn fields() -> &'static [&'static str];

    fn bind_fields<'q>(
        &'q self,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>;

    fn bind_create<'q>(
        dto: &'q Self::CreateDto,
        q: sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, sqlx::Postgres, sqlx::postgres::PgArguments>;

    async fn get(pool: &PgPool, id: Self::Id) -> Result<Option<Self>, Error> {
        let query = format!(
            "SELECT * FROM {} WHERE {} = $1",
            Self::table_name(),
            Self::id_column(),
        );
        sqlx::query_as::<_, Self>(&query)
            .bind(id)
            .fetch_optional(pool)
            .await
    }

    async fn edit(pool: &PgPool, id: Self::Id, d: Self) -> Result<(), Error> {
        let set = Self::fields()
            .iter()
            .enumerate()
            .map(|(i, f)| format!("{} = ${}", f, i + 1))
            .collect::<Vec<_>>()
            .join(", ");
        let query = format!(
            "UPDATE {} SET {} WHERE {} = ${}",
            Self::table_name(),
            set,
            Self::id_column(),
            Self::fields().len() + 1,
        );
        let q = sqlx::query(&query);
        let q = d.bind_fields(q);
        q.bind(id).execute(pool).await?;
        Ok(())
    }

    async fn edit_with_dto(pool: &PgPool, id: Self::Id, dto: Self::CreateDto) -> Result<(), Error> {
        let set = Self::fields()
            .iter()
            .enumerate()
            .map(|(i, f)| format!("{} = ${}", f, i + 1))
            .collect::<Vec<_>>()
            .join(", ");
        let query = format!(
            "UPDATE {} SET {} WHERE {} = ${}",
            Self::table_name(),
            set,
            Self::id_column(),
            Self::fields().len() + 1,
        );
        let q = sqlx::query(&query);
        let q = Self::bind_create(&dto, q);
        q.bind(id).execute(pool).await?;
        Ok(())
    }

    async fn delete(pool: &PgPool, id: Self::Id) -> Result<(), Error> {
        let query = format!(
            "DELETE FROM {} WHERE {} = $1",
            Self::table_name(),
            Self::id_column(),
        );
        sqlx::query(&query).bind(id).execute(pool).await?;
        Ok(())
    }

    async fn create(pool: &PgPool, dto: Self::CreateDto) -> Result<Self, Error> {
        let placeholders = Self::fields()
            .iter()
            .enumerate()
            .map(|(i, _)| format!("${}", i + 1))
            .collect::<Vec<_>>()
            .join(", ");
        let query = format!(
            "INSERT INTO {} ({}) VALUES ({}) RETURNING *",
            Self::table_name(),
            Self::fields().join(", "),
            placeholders,
        );
        let q = sqlx::query(&query);
        let q = Self::bind_create(&dto, q);
        Ok(q.fetch_one(pool).await.and_then(|row| Self::from_row(&row))?)
    }

    async fn all(pool: &PgPool) -> Result<Vec<Self>, Error> {
        let query = format!("SELECT * FROM {}", Self::table_name());
        sqlx::query_as::<_, Self>(&query).fetch_all(pool).await
    }

    async fn list(
        pool: &PgPool,
        limit: i32,
        offset: i32,
        order_by: &str,
        order_dir: OrderDir,
    ) -> Result<Vec<Self>, Error> {
        let query = format!(
            "SELECT * FROM {} ORDER BY {} {} LIMIT $1 OFFSET $2",
            Self::table_name(),
            order_by,
            order_dir.as_str(),
        );
        sqlx::query_as::<_, Self>(&query)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await
    }

    async fn count(pool: &PgPool) -> Result<i64, Error> {
        let query = format!("SELECT COUNT(*) FROM {}", Self::table_name());
        let row: (i64,) = sqlx::query_as(&query).fetch_one(pool).await?;
        Ok(row.0)
    }
}