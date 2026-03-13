import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv


class Email:
    _instance = None
    _config = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        BASE_DIR = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        env_file = os.path.join(BASE_DIR, ".env")

        load_dotenv(env_file)

        self._config = {
            "smtp_host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
            "smtp_port": int(os.getenv("SMTP_PORT", "587")),
            "smtp_user": os.getenv("SMTP_USER", ""),
            "smtp_password": os.getenv("SMTP_PASSWORD", ""),
            "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() == "true",
            "from_name": os.getenv("SMTP_FROM_NAME", "Password Generator"),
        }

    def send(self, to_email: str, subject: str, body: str, html: bool = False) -> dict:
        if not self._config["smtp_user"] or not self._config["smtp_password"]:
            return {"ok": False, "msg": "Email não configurado"}

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{self._config['from_name']} <{self._config['smtp_user']}>"
            msg["To"] = to_email
            msg["Subject"] = subject

            if html:
                msg.attach(MIMEText(body, "html"))
            else:
                msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(
                self._config["smtp_host"], self._config["smtp_port"]
            ) as server:
                if self._config["use_tls"]:
                    server.starttls()
                server.login(self._config["smtp_user"], self._config["smtp_password"])
                server.sendmail(self._config["smtp_user"], to_email, msg.as_string())

            return {"ok": True, "msg": "Email enviado"}

        except Exception as e:
            return {"ok": False, "msg": str(e)}


email = Email()
