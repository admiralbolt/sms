"""Convert DB models => JSON."""
import datetime

import croniter
import pytz
from django.db.models import Count
from django_celery_beat.models import CrontabSchedule, PeriodicTask
from rest_framework import serializers

from api import models
from api.utils import artist_utils
from sms_server.settings import TIME_ZONE

class RoundingDecimalField(serializers.DecimalField):
  """Custom rounding decimal field.

  Wholesale from:
  https://stackoverflow.com/questions/46949544/how-do-i-get-django-rest-framework-to-round-decimals-to-the-maximum-precision
  """
  def validate_precision(self, value):
    """Don't validate anything!"""
    return value

class VenueTagSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.VenueTag
    fields = ("id", "venue_type")

class VenueSerializer(serializers.ModelSerializer):
  """Serialize Venue data."""
  venue_image = serializers.ImageField(max_length=None, use_url=True, required=False)
  venue_tags = VenueTagSerializer(many=True, read_only=True)
  latitude = RoundingDecimalField(max_digits=8, decimal_places=5)
  longitude = RoundingDecimalField(max_digits=8, decimal_places=5)

  class Meta:
    model = models.Venue
    fields = ("id", "venue_image_url", "venue_image", "name", "latitude", "longitude", "address", "postal_code", "city", "venue_url", "description", "venue_tags", "alias", "show_venue")

class SocialLink(serializers.ModelSerializer):
  """Serialize social links."""

  class Meta:
    model = models.SocialLink
    fields = ("id", "created_at", "platform", "url")

class ArtistSerializer(serializers.ModelSerializer):
  """Serialize artists."""
  social_links = SocialLink(many=True)
  
  class Meta:
    model = models.Artist
    fields = ("id", "created_at", "name", "name_slug", "bio", "artist_image_url", "artist_image", "social_links")

  def update(self, instance: models.Artist, validated_data: dict):
    artist_utils.update_socials(artist=instance, social_links=validated_data["social_links"])
    del validated_data["social_links"]
    return super().update(instance, validated_data)
  
class RawDataSerializer(serializers.ModelSerializer):
  """Serialize Raw Data."""

  class Meta:
    model = models.RawData
    fields = "__all__"

class EventSerializer(serializers.ModelSerializer):
  """Serialize Event data."""
  event_image = serializers.ImageField(max_length=None, use_url=True, required=False)
  venue = VenueSerializer(read_only=True)
  artists = ArtistSerializer(read_only=True, many=True)
  raw_datas = RawDataSerializer(read_only=True, many=True)

  class Meta:
    model = models.Event
    fields = ("id", "event_image", "event_image_url", "event_type", "title", "event_day", "signup_start_time", "start_time", "event_url", "description", "venue", "artists", "raw_datas")

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
  run_time = serializers.SerializerMethodField()

  def get_summary(self, ingestion_run: models.IngestionRun) -> list[dict]:
    """Render a summary of the run for easy use.

    We also include the index to use as an ID in the react data table view.
    """
    data = list(models.IngestionRecord.objects.filter(ingestion_run=ingestion_run).values("api_name", "change_type").annotate(total=Count("id")))
    for i, agg in enumerate(data):
      agg["index"] = i
    return data
  
  def get_run_time(self, ingestion_run: models.IngestionRun) -> float:
    """Return the total runtime of the run in seconds."""
    if not ingestion_run.finished_at:
      return -1

    return ingestion_run.finished_at - ingestion_run.created_at

  class Meta:
    model = models.IngestionRun
    fields = "__all__"

class IngestionRecordSerializer(serializers.ModelSerializer):
  """Serialize Ingestion Records."""
  raw_data = RawDataSerializer()

  class Meta:
    model = models.IngestionRecord
    fields = "__all__"

class CarpenterRunSerializer(serializers.ModelSerializer):
  """Serialize CarpenterRun data."""
  summary = serializers.SerializerMethodField()
  run_time = serializers.SerializerMethodField()

  def get_summary(self, carpenter_run: models.CarpenterRun) -> list[dict]:
    """Render a summary of the run for easy use.

    We also include the index to use as an ID in the react data table view.
    """
    data = list(models.CarpenterRecord.objects.filter(carpenter_run=carpenter_run).values("api_name", "field_changed", "change_type").annotate(total=Count("id")))
    for i, agg in enumerate(data):
      agg["index"] = i
    return data
  
  def get_run_time(self, carpenter_run: models.CarpenterRun) -> float:
    """Return the total runtime of the run in seconds."""
    if not carpenter_run.finished_at:
      return -1
    
    return carpenter_run.finished_at - carpenter_run.created_at

  class Meta:
    model = models.CarpenterRun
    fields = "__all__"

class CarpenterRecordSerializer(serializers.ModelSerializer):
  """Serialize Carpenter Records."""
  raw_data = RawDataSerializer()
  event = EventSerializer()
  venue = VenueSerializer()
  artist = ArtistSerializer()

  class Meta:
    model = models.CarpenterRecord
    fields = "__all__"

class JanitorRunSerializer(serializers.ModelSerializer):
  """Serialize JanitorRun data."""
  summary = serializers.SerializerMethodField()
  run_time = serializers.SerializerMethodField()

  def get_summary(self, janitor_run: models.JanitorRun) -> list[dict]:
    """Render a summary of the run for easy use."""
    return list(models.JanitorRecord.objects.filter(janitor_run=janitor_run).values("operation").annotate(total=Count("id")))
  
  def get_run_time(self, janitor_run: models.JanitorRun) -> float:
    """Return the total runtime of the run in seconds."""
    if not janitor_run.finished_at:
      return -1
    
    return janitor_run.finished_at - janitor_run.created_at

  class Meta:
    model = models.JanitorRun
    fields = "__all__"

class JanitorMergeEventRecordSerializer(serializers.ModelSerializer):
  """Serialize merge event records."""
  to_event = EventSerializer()

  class Meta:
    model = models.JanitorMergeEventRecord
    fields = "__all__"

class JanitorApplyArtistsRecordSerializer(serializers.ModelSerializer):
  """Serialize apply artists records."""
  event = EventSerializer()
  artists = ArtistSerializer(many=True)

  class Meta:
    model = models.JanitorApplyArtistRecord
    fields = "__all__"

class JanitorRecordSerializer(serializers.ModelSerializer):
  """Serialize Janitor Records."""
  merge_event_record = JanitorMergeEventRecordSerializer()
  apply_artists_record = JanitorApplyArtistsRecordSerializer()

  class Meta:
    model = models.JanitorRecord
    fields = "__all__"

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
    healthy_last_run = itr.get_prev(datetime.datetime).replace(tzinfo=pytz.timezone(TIME_ZONE)) - datetime.timedelta(hours=1)
    return task.last_run_at > healthy_last_run

  class Meta:
    model = PeriodicTask
    fields = "__all__"