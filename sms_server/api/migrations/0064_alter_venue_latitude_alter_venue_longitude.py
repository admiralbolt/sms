# Generated by Django 4.2.4 on 2024-03-01 23:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0063_alter_venue_name_lower'),
    ]

    operations = [
        migrations.AlterField(
            model_name='venue',
            name='latitude',
            field=models.DecimalField(decimal_places=6, max_digits=11),
        ),
        migrations.AlterField(
            model_name='venue',
            name='longitude',
            field=models.DecimalField(decimal_places=6, max_digits=11),
        ),
    ]
