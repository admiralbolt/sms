"""Some django specific thing, IDK."""

from django.apps import AppConfig


class ApiConfig(AppConfig):
  """Config for the API app."""

  default_auto_field = "django.db.models.BigAutoField"
  name = "api"
