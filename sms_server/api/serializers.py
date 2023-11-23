"""Convert DB models => JSON."""
from rest_framework import serializers

from api import models

class VenueSerializer(serializers.ModelSerializer):
  """Serialize Venue data."""
  venue_image = serializers.ImageField(max_length=None, use_url=True)
  venue_tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="venue_type")
  # venue_types = VenueTagSerializer(many=True, read_only=True)

  class Meta:
    model = models.Venue
    fields = ("id", "venue_image", "name", "latitude", "longitude", "address", "postal_code", "city", "venue_url", "description", "venue_tags")

class EventSerializer(serializers.ModelSerializer):
  """Serialize Event data."""
  event_image = serializers.ImageField(max_length=None, use_url=True)

  class Meta:
    model = models.Event
    fields = ("id", "event_image", "event_type", "title", "event_day", "signup_start_time", "cash_only", "start_time", "end_time", "doors_open", "is_ticketed", "ticket_price_min", "ticket_price_max", "event_api", "event_url", "description", "venue")

class OpenMicSerializer(serializers.ModelSerializer):
  """Serialize OpenMic data."""

  class Meta:
    model = models.OpenMic
    fields = "__all__"