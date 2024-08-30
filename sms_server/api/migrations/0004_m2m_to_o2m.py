# Generated by Django 4.2.4 on 2024-07-16 04:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
  dependencies = [
    ("api", "0003_alter_event_unique_together"),
  ]

  def move_raw_datas_to_one_to_many(apps, schema_editor):
    Event = apps.get_model("api", "Event")

    for event in Event.objects.all():
      for raw_data in event.raw_datas.all():
        raw_data.event = event

  operations = [
    migrations.AddField(
      model_name="rawdata",
      name="event",
      field=models.ForeignKey(
        blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="raw_datas", to="api.event"
      ),
    ),
    migrations.RunPython(move_raw_datas_to_one_to_many),
    migrations.RemoveField(
      model_name="event",
      name="raw_datas",
    ),
  ]
