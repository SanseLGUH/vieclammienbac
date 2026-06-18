pub mod postgres;

pub mod auth;
pub mod middleware;

pub mod utils;

pub const SECRET_KEY: &str = "!SanseLIsAbsoluteMonster!OrHeJUSTHAVEBC";

use thiserror::Error;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("{0}")]
    Email(#[from] EmailError ),

    #[error("{0}")]
    Database(#[from] DatabaseError)
}

#[derive(Debug, Error)]
pub enum DatabaseError {
    #[error("{0}")]
    Redis( #[from] deadpool_redis::redis::RedisError )
}

#[derive(Debug, Error)]
pub enum EmailError {
    #[error("Invalid email address: {0}")]
    InvalidAddress(#[from] lettre::address::AddressError),
    #[error("Failed to build email: {0}")]
    BuildFailed(#[from] lettre::error::Error),
    #[error("SMTP relay setup failed: {0}")]
    RelayFailed(lettre::transport::smtp::Error),
    #[error("Failed to send email: {0}")]
    SendFailed(lettre::transport::smtp::Error),
}