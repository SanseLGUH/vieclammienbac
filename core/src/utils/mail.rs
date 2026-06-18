use crate::EmailError;

use lettre::{
    message::{header, MultiPart, SinglePart},
    transport::smtp::authentication::Credentials,
    Message, SmtpTransport, Transport,
};

pub struct EmailClient {
    mailer: SmtpTransport,
    from_email: String,
}

pub struct EmailMessage {
    pub to_email: String,
    pub subject: String,
    pub preview: String,
    pub html: String,
}

impl EmailClient {
    pub fn new(from_email: &str, password: &str, relay: &str) -> Result<Self, EmailError> {
        let creds = Credentials::new(
            from_email.to_string(),
            password.to_string(),
        );
        let mailer = SmtpTransport::relay(relay)
            .map_err(EmailError::RelayFailed)?
            .credentials(creds)
            .build();

        Ok(Self {
            mailer,
            from_email: from_email.to_string(),
        })
    }

    pub fn send(&self, msg: EmailMessage) -> Result<(), EmailError> {
        let email = Message::builder()
            .from(self.from_email.parse()?)
            .to(msg.to_email.parse()?)
            .subject(&msg.subject)
            .multipart(
                MultiPart::alternative()
                    .singlepart(
                        SinglePart::builder()
                            .header(header::ContentType::TEXT_PLAIN)
                            .body(msg.preview),
                    )
                    .singlepart(
                        SinglePart::builder()
                            .header(header::ContentType::TEXT_HTML)
                            .body(msg.html),
                    ),
            )?;

        self.mailer.send(&email).map_err(EmailError::SendFailed)?;
        Ok(())
    }
}