# Generated by Django 4.2.4 on 2024-06-20 08:49

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0098_artist_name_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='rawdata',
            name='event_day',
            field=models.DateField(default=datetime.datetime(2024, 6, 20, 1, 49, 22, 377601)),
            preserve_default=False,
        ),
    ]
