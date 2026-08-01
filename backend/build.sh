#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip, setuptools and wheel first
python -m pip install --upgrade pip setuptools wheel

# Install dependencies using pre-built binary wheels
pip install --prefer-binary -r requirements.txt

# Set production settings for collectstatic and migrate
export DJANGO_SETTINGS_MODULE=config.settings.production

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
