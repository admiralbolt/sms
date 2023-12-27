# Generated by Django 4.2.4 on 2023-12-27 22:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0058_alter_event_event_image_url_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='venue',
            name='neighborhood',
            field=models.CharField(blank=True, choices=[('Ballard', 'Ballard'), ('Capitol Hill', 'Capitol Hill'), ('Fremont', 'Fremont'), ('Greenlake', 'Greenlake'), ('Phinney Ridge', 'Phinney Ridge'), ('University District', 'University District'), ('West Seattle', 'West Seattle')], max_length=64, null=True),
        ),
    ]
