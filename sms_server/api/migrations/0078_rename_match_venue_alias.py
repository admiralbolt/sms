# Generated by Django 4.2.4 on 2024-05-02 07:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0077_venue_match'),
    ]

    operations = [
        migrations.RenameField(
            model_name='venue',
            old_name='match',
            new_name='alias',
        ),
    ]