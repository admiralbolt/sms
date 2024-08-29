"""Controls the admin part of the backend."""
from django.contrib import admin
from api.models import ADMIN_MODELS

class GenericAdminModel(admin.ModelAdmin):
  """Shared admin model used for all models."""
  readonly_fields = ("created_at",)

for model in ADMIN_MODELS:
  admin.site.register(model, admin_class=GenericAdminModel)
