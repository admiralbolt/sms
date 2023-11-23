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
    fields = ("venue_image", "name", "latitude", "longitude", "address", "postal_code", "city", "venue_url", "description", "venue_tags")

class EventSerializer(serializers.ModelSerializer):
  """Serialize Event data."""
  event_image = serializers.ImageField(max_length=None, use_url=True)

  class Meta:
    model = models.Event
    fields = "__all__"

class OpenMicSerializer(serializers.ModelSerializer):
  """Serialize OpenMic data."""

  class Meta:
    model = models.OpenMic
    fields = "__all__"