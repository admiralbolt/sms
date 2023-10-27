# Generated by Django 4.2.4 on 2023-10-26 16:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_event_show_event_openmic_generate_events'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='signup_start_time',
            field=models.TimeField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='openmic',
            name='venue',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.venue'),
        ),
    ]