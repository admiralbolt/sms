# Generated by Django 4.2.4 on 2024-07-15 03:27

from django.db import migrations


class Migration(migrations.Migration):
  dependencies = [
    ("api", "0002_janitorapplyartistrecord_janitormergeeventrecord_and_more"),
  ]

  operations = [
    migrations.AlterUniqueTogether(
      name="event",
      unique_together=set(),
    ),
  ]
