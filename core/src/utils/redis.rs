use deadpool_redis::{redis::AsyncTypedCommands, Config, Pool, Runtime, Connection};
use tokio::sync::OnceCell;
// use std::env;

static POOL: OnceCell<Pool> = OnceCell::const_new();

use crate::DatabaseError;

pub async fn get_pool() -> &'static Pool {
    POOL.get_or_init(|| async {
/*        let url = env::var("RDATABASE_URL")
            .expect("RDATABASE_URL not set");
*/        Config::from_url("redis://127.0.0.1:6379")
            .create_pool(Some(Runtime::Tokio1))
            .expect("Failed to create Redis pool")
    }).await
}

async fn connect() -> Connection {
    get_pool().await
        .get().await
        .expect("Failed to get Redis connection from pool")
}

pub async fn set(name: &str, key: &str, value: &str, ttl: Option<u64>) -> Result<(), DatabaseError> {
    let mut conn = connect().await;
    let redis_key = format!("{}:{}", name, key);
    match ttl {
        Some(secs) => conn.set_ex(&redis_key, value, secs).await?,
        None => conn.set(&redis_key, value).await?,
    }
    Ok(())
}

pub async fn get(name: &str, key: &str) -> Result<Option<String>, DatabaseError> {
    let mut conn = connect().await;
    let redis_key = format!("{}:{}", name, key);
    Ok(conn.get(&redis_key).await?)
}

pub async fn delete(name: &str, key: &str) -> Result<(), DatabaseError> {
    let mut conn = connect().await;
    let redis_key = format!("{}:{}", name, key);
    let _: usize = conn.del(&redis_key).await?;
    Ok(())
}