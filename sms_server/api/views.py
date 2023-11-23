"""Display stuff!"""
import datetime

from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import AllowAny

from api import models
from api import serializers
from api.constants import get_all, EventTypes, VenueTypes

class EventViewSet(viewsets.ModelViewSet):
  """List all events."""
  resource_name = "events"
  queryset = models.Event.objects.all()
  serializer_class = serializers.EventSerializer

  def get_queryset(self):
    return models.Event.objects.order_by("event_day").filter(event_day__gte=datetime.date.today())

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
    mics = models.OpenMic.objects.order_by("venue")
    return mics.filter(generate_events=True)
  
class VenueEventsView(ListCreateAPIView):
  """List all events for a particular venue."""
  serializer_class = serializers.EventSerializer

  def get_queryset(self):
    venue = models.Venue.objects.filter(id=self.kwargs["venue_id"]).first()
    return models.Event.objects.filter(venue=venue)
  
@api_view(["GET"])
@permission_classes([AllowAny])
def get_all_event_types(request):
  return JsonResponse(get_all(EventTypes), safe=False)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_all_venue_types(request):
  return JsonResponse(get_all(VenueTypes), safe=False)