import os
from dotenv import load_dotenv

load_dotenv()

APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", "9000"))
DATABASE_URL = os.getenv("DATABASE_URL")
SCORING_API_BASE = os.getenv("SCORING_API_BASE", "http://localhost:8000")
JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MIN", "480"))
ADMIN_BOOTSTRAP_KEY = os.getenv("ADMIN_BOOTSTRAP_KEY", "")