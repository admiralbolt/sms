# Generated by Django 4.2.4 on 2023-11-22 02:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0047_event_event_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='venue',
            name='venue_image',
            field=models.ImageField(blank=True, upload_to='venue_images'),
        ),
    ]