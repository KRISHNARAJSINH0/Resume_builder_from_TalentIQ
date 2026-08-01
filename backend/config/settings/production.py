from .base import *
import os

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Render provides the full hostname - allow it
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'talentiq-backend-fu05.onrender.com,localhost,127.0.0.1').split(',')

# CORS - explicitly allow Vercel frontend
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'https://resume-builder-from-talent-iq.vercel.app',
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]