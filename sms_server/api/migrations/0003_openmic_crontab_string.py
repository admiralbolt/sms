# Generated by Django 4.2.4 on 2023-08-13 01:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_venue_latitude_alter_venue_longitude'),
    ]

    operations = [
        migrations.AddField(
            model_name='openmic',
            name='crontab_string',
            field=models.CharField(default=' ', max_length=64),
            preserve_default=False,
        ),
    ]
