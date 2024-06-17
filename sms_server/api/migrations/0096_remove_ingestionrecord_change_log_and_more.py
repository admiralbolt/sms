# Generated by Django 4.2.4 on 2024-06-17 03:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0095_janitorrun_janitorrecord'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ingestionrecord',
            name='change_log',
        ),
        migrations.RemoveField(
            model_name='ingestionrecord',
            name='change_type',
        ),
        migrations.RemoveField(
            model_name='ingestionrecord',
            name='event',
        ),
        migrations.RemoveField(
            model_name='ingestionrecord',
            name='field_changed',
        ),
        migrations.RemoveField(
            model_name='ingestionrecord',
            name='venue',
        ),
        migrations.AddField(
            model_name='ingestionrecord',
            name='raw_data',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='api.rawdata'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='rawdata',
            name='api_name',
            field=models.CharField(choices=[('AXS', 'AXS'), ('Crawler - Blue Moon', 'Crawler - Blue Moon'), ("Crawler - Darrell's Tavern", "Crawler - Darrell's Tavern"), ('Crawler - Little Red Hen', 'Crawler - Little Red Hen'), ('Crawler - Sea Monster Lounge', 'Crawler - Sea Monster Lounge'), ('Crawler - Skylark', 'Crawler - Skylark'), ('Crawler - The Royal Room', 'Crawler - The Royal Room'), ('Dice', 'Dice'), ('Eventbrite', 'Eventbrite'), ('Manual', 'Manual'), ('Open Mic Generator', 'Open Mic Generator'), ('Ticketmaster', 'Ticketmaster'), ('TIXR', 'TIXR'), ('Venuepilot', 'Venuepilot')], default='Manual', max_length=32),
        ),
    ]
