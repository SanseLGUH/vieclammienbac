use argon2::password_hash::errors::Error;

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};

pub fn hash_password(password: &str) -> Result<String, Error> {
    let salt = SaltString::generate(&mut OsRng);
    
    let params = argon2::Params::new(
        65_536,
        3,
        2,
        None,
    )?;

    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id, 
        argon2::Version::V0x13,
        params
    );

    Ok( 
        argon2
            .hash_password(password.as_bytes(), &salt)?
            .to_string() 
    )
}

pub fn verify_hash(password: &str, hash: &str) -> Result<bool, Error> {
    let parsed_hash = PasswordHash::new(hash)?;

    let params = argon2::Params::new(
        65_536,
        3,
        2,
        None,
    )?;

    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id, 
        argon2::Version::V0x13,
        params
    );

    Ok( 
        argon2
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    )
}