#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip, setuptools and wheel to get pre-built wheels
python -m pip install --upgrade pip setuptools wheel

# Install dependencies
pip install --prefer-binary -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
