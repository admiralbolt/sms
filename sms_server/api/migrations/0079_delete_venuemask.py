# Generated by Django 4.2.4 on 2024-05-02 07:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0078_rename_match_venue_alias'),
    ]

    operations = [
        migrations.DeleteModel(
            name='VenueMask',
        ),
    ]