# Generated by Django 4.2.4 on 2023-11-23 02:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0052_alter_event_description'),
    ]

    operations = [
        migrations.CreateModel(
            name='VenueTags',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('venue_type', models.CharField(choices=[('Bar', 'Bar'), ('Coffee Shop', 'Coffee Shop'), ('Event Space', 'Event Space')], max_length=32)),
                ('venue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.venue')),
            ],
            options={
                'unique_together': {('venue', 'venue_type')},
            },
        ),
        migrations.CreateModel(
            name='EventTags',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('Open Mic', 'Open Mic'), ('Show', 'Show')], max_length=32)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.event')),
            ],
            options={
                'unique_together': {('event', 'event_type')},
            },
        ),
    ]