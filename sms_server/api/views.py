"""Display stuff!"""
from rest_framework import viewsets

from api import models
from api import serializers

class EventViewSet(viewsets.ModelViewSet):
  """List all events."""
  resource_name = "events"
  queryset = models.Event.objects.all()
  serializer_class = serializers.EventSerializer

  def get_queryset(self):
    return models.Event.objects.order_by("event_day")

class VenueViewSet(viewsets.ModelViewSet):
  """List all venues."""
  resource_name = "venues"
  queryset = models.Venue.objects.all()
  serializer_class = serializers.VenueSerializer

  def get_queryset(self):
    venues = models.Venue.objects.order_by("name")
    return venues.filter(show_venue=True)

class OpenMicViewSet(viewsets.ModelViewSet):
  """List all open mics."""
  resource_name = "open_mics"
  queryset = models.OpenMic.objects.all()
  serializer_class = serializers.OpenMicSerializer

  def get_queryset(self):
    mics = models.OpenMic.objects.order_by("name")
    return mics.filter(generate_events=True)