# Generated by Django 4.2.4 on 2024-06-14 06:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0080_alter_venue_alias'),
    ]

    operations = [
        migrations.CreateModel(
            name='RawEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('venue_name', models.CharField(max_length=64)),
                ('venue_api_id', models.CharField(blank=True, max_length=64, null=True)),
                ('title', models.CharField(max_length=256)),
                ('event_day', models.DateField()),
                ('start_time', models.TimeField(blank=True, default=None, null=True)),
                ('event_api', models.CharField(choices=[('AXS', 'AXS'), ('Crawler', 'Crawler'), ('Dice', 'Dice'), ('Eventbrite', 'Eventbrite'), ('Manual', 'Manual'), ('Open Mic Generator', 'Open Mic Generator'), ('Ticketmaster', 'Ticketmaster'), ('TIXR', 'TIXR'), ('Venuepilot', 'Venuepilot')], default='Manual', max_length=20)),
                ('event_api_id', models.CharField(blank=True, max_length=64, null=True)),
                ('event_url', models.CharField(blank=True, max_length=512, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('event_image_url', models.CharField(blank=True, max_length=1024, null=True)),
                ('event_image', models.ImageField(blank=True, null=True, upload_to='event_images')),
            ],
        ),
    ]