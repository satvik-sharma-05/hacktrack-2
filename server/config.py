import os

DEBUG = os.getenv("DEBUG", "False") == "True"
CORS_ORIGINS = [os.getenv("FRONTEND_URL", "*")]
