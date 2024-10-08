# Generated by Django 4.2.4 on 2024-08-25 22:54

from django.db import migrations, models

from api.models import Venue


class Migration(migrations.Migration):
  dependencies = [
    ("api", "0006_carpenterrecord_open_mic_and_more"),
  ]

  def undo(apps, schema_editor):
    # Don't need to do anything, this field will get dropped when we
    # apply the reverse operation.
    pass

  def update_venue_slugs(apps, schema_editor):
    for venue in Venue.objects.all():
      venue.make_pretty()
      venue.save()

  operations = [
    migrations.AddField(
      model_name="venue",
      name="slug",
      field=models.CharField(blank=True, null=True, max_length=128),
    ),
    migrations.RunPython(update_venue_slugs, undo),
    migrations.AlterField(model_name="venue", name="slug", field=models.CharField(max_length=128, unique=True), preserve_default=False),
  ]
