# Generated by Django 4.2.4 on 2024-06-20 20:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0100_event_raw_datas'),
    ]

    operations = [
        migrations.AlterField(
            model_name='janitorrecord',
            name='field_changed',
            field=models.CharField(choices=[('event', 'event'), ('venue', 'venue'), ('artist', 'artist'), ('none', 'none')], max_length=32),
        ),
    ]