# Generated by Django 4.2.4 on 2023-11-01 14:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0039_openmic_drums_alter_venue_venue_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='openmic',
            name='venue',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.venue'),
        ),
    ]