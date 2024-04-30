"""Convert DB models => JSON."""
import datetime

import croniter
import pytz
from django.db.models import Count
from django_celery_beat.models import CrontabSchedule, PeriodicTask
from rest_framework import serializers

from api import models
from sms_server.settings import TIME_ZONE

class VenueTagSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.VenueTag
    fields = ("id", "venue_type")

class VenueSerializer(serializers.ModelSerializer):
  """Serialize Venue data."""
  venue_image = serializers.ImageField(max_length=None, use_url=True, required=False)
  venue_tags = VenueTagSerializer(many=True, read_only=True)

  class Meta:
    model = models.Venue
    fields = ("id", "venue_image_url", "venue_image", "name", "latitude", "longitude", "address", "postal_code", "city", "venue_url", "description", "venue_tags", "show_venue", "gather_data")

class EventSerializer(serializers.ModelSerializer):
  """Serialize Event data."""
  event_image = serializers.ImageField(max_length=None, use_url=True, required=False)
  venue = serializers.PrimaryKeyRelatedField(queryset=models.Venue.objects.order_by("name"))

  class Meta:
    model = models.Event
    fields = ("id", "event_image", "event_image_url", "event_type", "title", "event_day", "signup_start_time", "cash_only", "start_time", "end_time", "doors_open", "is_ticketed", "ticket_price_min", "ticket_price_max", "event_api", "event_url", "description", "venue")

class OpenMicSerializer(serializers.ModelSerializer):
  """Serialize OpenMic data."""
  name = serializers.SerializerMethodField

  def get_name(self, open_mic: models.OpenMic):
    return open_mic.name()

  class Meta:
    model = models.OpenMic
    fields = ("id", "name", "open_mic_type", "description", "signup_start_time", "event_start_time", "event_end_time", "all_ages", "house_piano", "house_pa", "drums", "cadence_crontab", "cadence_readable", "generate_events", "venue")

class IngestionRunSerializer(serializers.ModelSerializer):
  """Serialize IngestionRun data."""
  summary = serializers.SerializerMethodField()

  def get_summary(self, ingestion_run: models.IngestionRun) -> list[dict]:
    """Render a summary of the run for easy use.

    We also include the index to use as an ID in the react data table view.
    """
    data = list(models.IngestionRecord.objects.filter(ingestion_run=ingestion_run).values("api_name", "change_type", "field_changed").annotate(total=Count("id")))
    for i, agg in enumerate(data):
      agg["index"] = i
    return data

  class Meta:
    model = models.IngestionRun
    fields = "__all__"

class IngestionRecordSerializer(serializers.ModelSerializer):
  """Serialize Ingestion Records."""

  # For ease of use, we want to get the name of the object that was changed.
  # Staring at a bunch of event / venue ids makes it much harder to look at.
  event_name = serializers.SerializerMethodField()
  venue_name = serializers.SerializerMethodField()

  def get_event_name(self, record: models.IngestionRecord):
    return "" if record.event == None else record.event.title
  
  def get_venue_name(self, record: models.IngestionRecord):
    return "" if record.venue == None else record.venue.name

  class Meta:
    model = models.IngestionRecord
    fields = ("id", "api_name", "change_type", "change_log", "field_changed", "ingestion_run", "event", "event_name", "venue", "venue_name")

class CrontabScheduleSerializer(serializers.ModelSerializer):
  schedule = serializers.SerializerMethodField()
  healthy_last_run = serializers.SerializerMethodField()

  def get_schedule(self, crontab: CrontabSchedule) -> str:
    return f"{crontab.minute} {crontab.hour} {crontab.day_of_month} {crontab.month_of_year} {crontab.day_of_week}"
  
  def get_healthy_last_run(self, crontab: CrontabSchedule) -> datetime:
    schedule = self.get_schedule(crontab)
    now = datetime.datetime.now()
    itr = croniter.croniter(schedule, now)
    return itr.get_prev(datetime.datetime).replace(tzinfo=pytz.timezone(TIME_ZONE))

  class Meta:
    model = CrontabSchedule
    fields = ("schedule", "healthy_last_run")

class PeriodicTaskSerializer(serializers.ModelSerializer):
  """Serialize celery periodic tasks."""
  crontab = CrontabScheduleSerializer()
  healthy = serializers.SerializerMethodField()

  def get_healthy(self, task: PeriodicTask):
    # Ugly copy paste job here.
    schedule = f"{task.crontab.minute} {task.crontab.hour} {task.crontab.day_of_month} {task.crontab.month_of_year} {task.crontab.day_of_week}"
    now = datetime.datetime.now()
    itr = croniter.croniter(schedule, now)
    healthy_last_run = itr.get_prev(datetime.datetime).replace(tzinfo=pytz.timezone(TIME_ZONE))
    return task.last_run_at > healthy_last_run

  class Meta:
    model = PeriodicTask
    fields = "__all__"