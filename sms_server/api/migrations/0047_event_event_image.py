# Generated by Django 4.2.4 on 2023-11-22 02:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0046_venue_venue_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='event_image',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]
