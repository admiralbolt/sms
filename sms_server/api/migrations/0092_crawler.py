# Generated by Django 4.2.4 on 2024-06-16 22:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0091_rawdata'),
    ]

    operations = [
        migrations.CreateModel(
            name='Crawler',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('crawler_name', models.CharField(max_length=32, unique=True)),
                ('venue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.venue')),
            ],
        ),
    ]
