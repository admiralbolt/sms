"""Convert DB models => JSON."""
from django_celery_beat.models import PeriodicTask
from rest_framework import serializers

from api import models

class VenueTagSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.VenueTag
    fields = ("id", "venue_type")

class VenueSerializer(serializers.ModelSerializer):
  """Serialize Venue data."""
  venue_image = serializers.ImageField(max_length=None, use_url=True)
  venue_tags = VenueTagSerializer(many=True, read_only=True)

  class Meta:
    model = models.Venue
    fields = ("id", "venue_image", "name", "latitude", "longitude", "address", "postal_code", "city", "venue_url", "description", "venue_tags")

class EventSerializer(serializers.ModelSerializer):
  """Serialize Event data."""
  event_image = serializers.ImageField(max_length=None, use_url=True, required=False)
  venue = serializers.PrimaryKeyRelatedField(queryset=models.Venue.objects.order_by("name"))

  class Meta:
    model = models.Event
    fields = ("id", "event_image", "event_image_url", "event_type", "title", "event_day", "signup_start_time", "cash_only", "start_time", "end_time", "doors_open", "is_ticketed", "ticket_price_min", "ticket_price_max", "event_api", "event_url", "description", "venue")

class OpenMicSerializer(serializers.ModelSerializer):
  """Serialize OpenMic data."""

  class Meta:
    model = models.OpenMic
    fields = "__all__"

class IngestionRunSerializer(serializers.ModelSerializer):
  """Serialize IngestionRun data."""

  class Meta:
    model = models.IngestionRun
    fields = "__all__"

class IngestionRecordSerializer(serializers.ModelSerializer):
  """Serialize Ingestion Records."""

  class Meta:
    model = models.IngestionRecord
    fields = "__all__"

class PeriodicTaskSerializer(serializers.ModelSerializer):
  """Serialize celery periodic tasks."""

  class Meta:
    model = PeriodicTask
    fields = "__all__"