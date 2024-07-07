# Generated by Django 4.2.4 on 2024-07-05 20:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0102_artist_artist_image_artist_artist_image_url_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='venue',
            name='latitude',
            field=models.DecimalField(decimal_places=5, max_digits=8),
        ),
        migrations.AlterField(
            model_name='venue',
            name='longitude',
            field=models.DecimalField(decimal_places=5, max_digits=8),
        ),
    ]
