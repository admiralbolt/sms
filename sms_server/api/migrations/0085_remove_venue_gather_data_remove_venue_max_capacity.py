# Generated by Django 4.2.4 on 2024-06-14 18:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0084_rawvenue'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='venue',
            name='gather_data',
        ),
        migrations.RemoveField(
            model_name='venue',
            name='max_capacity',
        ),
    ]
