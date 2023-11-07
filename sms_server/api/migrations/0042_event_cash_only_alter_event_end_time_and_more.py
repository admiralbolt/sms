# Generated by Django 4.2.4 on 2023-11-07 07:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0041_venueapi_crawler_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='cash_only',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='event',
            name='end_time',
            field=models.TimeField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='event',
            name='signup_start_time',
            field=models.TimeField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='event',
            name='ticket_price_min',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True),
        ),
    ]
