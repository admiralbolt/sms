# Generated by Django 4.2.4 on 2024-08-30 03:25

from django.db import migrations, models


class Migration(migrations.Migration):
  dependencies = [
    ("api", "0007_venue_slug"),
  ]

  operations = [
    migrations.AddField(
      model_name="ingestionrun",
      name="metadata",
      field=models.JSONField(blank=True, null=True),
    ),
  ]
