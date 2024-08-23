"""
Django settings for sms_server project.

Generated by 'django-admin startproject' using Django 4.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""
import os
from datetime import timedelta

from pathlib import Path

# LOCAL SETTINGS!
# Put these in a file called `local_settings.py` so they can be loaded.
# API Keys to include are:
#  * BANDSINTOWN_APP_ID
#  * EVENTBRITE_TOKEN
#  * TICKET_MASTER_API_KEY
#  * TIXR_CLIENTS - This should be a list of tuples of the form (name, venue_id, client_key)
# Other important settings:
#  * MEDIA_ROOT
#  * IS_PROD
from .local_settings import *  # pylint: disable=wildcard-import,unused-wildcard-import

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

LOGGING = {
  "version": 1,
  "disable_existing_loggers": False,
  "formatters": {
    "pretty": {
      "format": "[{levelname}] {asctime} ({pathname}:{lineno}) {message}",
      "style": "{",
    }
  },
  "handlers": {
    "debug_file": {
      "level": "DEBUG",
      "class": "logging.FileHandler",
      "filename": os.path.join(BASE_DIR, "logs", "debug.log"),
      "formatter": "pretty",
    },
    "info_file": {
      "level": "INFO",
      "class": "logging.FileHandler",
      "filename": os.path.join(BASE_DIR, "logs", "info.log"),
      "formatter": "pretty"
    },
    "warning_file": {
      "level": "WARNING",
      "class": "logging.FileHandler",
      "filename": os.path.join(BASE_DIR, "logs", "warning.log"),
      "formatter": "pretty"
    },
    "error_file": {
      "level": "ERROR",
      "class": "logging.FileHandler",
      "filename": os.path.join(BASE_DIR, "logs", "error.log"),
      "formatter": "pretty",
    },
  },
  "loggers": {
    "django": {
      "handlers": ["debug_file", "info_file", "warning_file", "error_file"],
      "propagate": True,
    },
  },
  "root": {
    "handlers": ["debug_file", "info_file", "warning_file", "error_file"],
    "level": "INFO",
  }
}


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-p$95w)svi6dn3yw04zq0ggwl1w=t+xw#1lpr!tbr21=3smu5&8'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = not IS_PROD

# Eventually I will need to figure out reasonable settings here.
# For now, just let everyone and their mom come hang out in the server.
ALLOWED_HOSTS = [
  '*',
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
  'accept',
  'accept-encoding',
  'authorization',
  'cache-control',
  'content-type',
  'dnt',
  'expires',
  'origin',
  'pragma',
  'user-agent',
  'x-csrftoken',
  'x-requested-with',
]
CORS_ORIGIN_ALLOW_ALL = True

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api',
    'corsheaders',
    'django_celery_beat',
    'django_extensions',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sms_server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sms_server.wsgi.application'

CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"
CELERY_TIMEZONE = "America/Los_Angeles"
CELERY_TASK_TRACK_STARTED = True
# Set the task limit to 10 hours since bandsintown ingestion takes so long.
CELERY_TASK_TIME_LIMIT = 10 * 60 * 60

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
  'DEFAULT_PERMISSION_CLASSES': [
    'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
  ],
  'DEFAULT_PARSER_CLASSES': (
    'rest_framework.parsers.JSONParser',
    'rest_framework.parsers.FormParser',
    'rest_framework.parsers.MultiPartParser'
  ),
  'DEFAULT_RENDERER_CLASSES': (
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
  ),
  'DEFAULT_FILTER_BACKENDS': (
    'rest_framework.filters.OrderingFilter',
  ),
  'DEFAULT_AUTHENTICATION_CLASSES': (
    'rest_framework_simplejwt.authentication.JWTAuthentication',
  )
}

SIMPLE_JWT = {
  'ACCESS_TOKEN_LIFETIME': timedelta(minutes=10),
  'REFRESH_TOKEN_LIFTIME': timedelta(days=1),
  'ROTATE_REFRESH_TOKENS': True,
  'BLACKLIST_AFTER_ROTATION': True
}


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/Los_Angeles'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/uploads/'
MEDIA_ROOT = MEDIA_ROOT

# Should be specified in local settings!
IS_PROD = IS_PROD