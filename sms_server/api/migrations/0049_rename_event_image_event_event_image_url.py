# Generated by Django 4.2.4 on 2023-11-22 02:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0048_venue_venue_image'),
    ]

    operations = [
        migrations.RenameField(
            model_name='event',
            old_name='event_image',
            new_name='event_image_url',
        ),
    ]