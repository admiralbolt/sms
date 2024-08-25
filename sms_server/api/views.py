"""Display stuff!"""
import datetime

from django_celery_beat.models import PeriodicTask
from django.http import HttpRequest, JsonResponse
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, SAFE_METHODS
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from api import models
from api import serializers
from api.constants import get_all, EventTypes, VenueTypes
from api.utils import venue_utils, search_utils
from sms_server.settings import IS_PROD

class EventViewSet(viewsets.ModelViewSet):
  """List all events."""
  resource_name = "events"
  queryset = models.Event.objects.all()
  serializer_class = serializers.EventSerializer
  
  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    models.Event.objects.prefetch_related("venue")
    return models.Event.objects.order_by("venue__name", "start_time").filter(venue__show_venue=True, show_event=True)

class VenueViewSet(viewsets.ModelViewSet):
  """List all venues."""
  resource_name = "venues"
  queryset = models.Venue.objects.all()
  serializer_class = serializers.VenueSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    models.Venue.objects.prefetch_related("venue_tags")
    venues = models.Venue.objects.order_by("name")
    return venues.filter(show_venue=True)

class OpenMicViewSet(viewsets.ModelViewSet):
  """List all open mics."""
  resource_name = "open_mics"
  queryset = models.OpenMic.objects.all()
  serializer_class = serializers.OpenMicSerializer
  
  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    mics = models.OpenMic.objects.order_by("venue__name")
    return mics.filter(generate_events=True)

class VenueEventsView(ListAPIView):
  """List all events for a particular venue."""
  serializer_class = serializers.EventSerializer
  schema = AutoSchema(operation_id_base="VenueEvents")

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    venue = models.Venue.objects.filter(id=self.kwargs.get("venue_id", None)).first()
    return models.Event.objects.filter(venue=venue).order_by("event_day")

class ArtistViewSet(viewsets.ModelViewSet):
  """List artists."""
  resource_name = "artists"
  queryset = models.Artist.objects.all()
  serializer_class = serializers.ArtistSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]
  
  def get_queryset(self):
    return models.Artist.objects.order_by("name")

class ArtistEventsView(ListAPIView):
  """List all events for a particular venue."""
  serializer_class = serializers.EventSerializer
  schema = AutoSchema(operation_id_base="ArtistEvents")

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    artist = models.Artist.objects.filter(id=self.kwargs.get("artist_id", None)).first()
    return models.Event.objects.filter(artists=artist).order_by("event_day")

class RawDataViewSet(viewsets.ModelViewSet):
  """List all raw data."""
  resource_name = "raw_datas"
  serializer_class = serializers.RawDataSerializer
  queryset = models.RawData.objects.all()

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]
  
  def get_queryset(self):
    return models.RawData.objects.order_by("created_at")
  
class PeriodicTaskViewSet(viewsets.ReadOnlyModelViewSet):
  """List periodic tasks!"""
  resource_name = "periodic_tasks"
  queryset = PeriodicTask.objects.all()
  serializer_class = serializers.PeriodicTaskSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]
  
class IngestionRunViewSet(viewsets.ReadOnlyModelViewSet):
  """List all ingestion runs."""
  resource_name = "ingestion_runs"
  queryset = models.IngestionRun.objects.all()
  serializer_class = serializers.IngestionRunSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    runs = models.IngestionRun.objects.order_by("-created_at")
    return runs
  
class IngestionRunRecordsView(ListAPIView):
  """List all ingestion records for a particular run."""
  serializer_class = serializers.IngestionRecordSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    models.IngestionRecord.objects.prefetch_related("event", "venue")
    ingestion_run = models.IngestionRun.objects.filter(id=self.kwargs.get("ingestion_run_id", None)).first()
    return models.IngestionRecord.objects.filter(ingestion_run=ingestion_run)
  
class CarpenterRunViewSet(viewsets.ReadOnlyModelViewSet):
  """List all carpenter runs."""
  resource_name = "carpenter_runs"
  queryset = models.CarpenterRun.objects.all()
  serializer_class = serializers.CarpenterRunSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    runs = models.CarpenterRun.objects.order_by("-created_at")
    return runs
  
class CarpenterRunRecordsView(ListAPIView):
  """List all carpenter records for a particular run."""
  serializer_class = serializers.CarpenterRecordSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    models.CarpenterRecord.objects.prefetch_related("event", "venue")
    carpenter_run = models.CarpenterRun.objects.filter(id=self.kwargs.get("carpenter_run_id", None)).first()
    return models.CarpenterRecord.objects.filter(carpenter_run=carpenter_run)
  
class JanitorRunViewSet(viewsets.ReadOnlyModelViewSet):
  """List all janitor runs."""
  resource_name = "janitor_runs"
  queryset = models.JanitorRun.objects.all()
  serializer_class = serializers.JanitorRunSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    runs = models.JanitorRun.objects.order_by("-created_at")
    return runs
  
class JanitorRunRecordsView(ListAPIView):
  """List all janitor records for a particular run."""
  serializer_class = serializers.JanitorRecordSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    models.JanitorRecord.objects.prefetch_related("event", "venue")
    janitor_run = models.JanitorRun.objects.filter(id=self.kwargs.get("janitor_run_id", None)).first()
    return models.JanitorRecord.objects.filter(janitor_run=janitor_run)

class LogoutView(APIView):
  """Logout!"""
  permission_classes = (IsAuthenticated,)

  def post(self, request):
    try:
      refresh_token = request.data["refresh_token"]
      token = RefreshToken(refresh_token)
      token.blacklist()
      return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
      return Response(status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["GET"])
@permission_classes([AllowAny])
def get_events_on_day(request):
  day = request.GET.get("day")
  if not day:
    return JsonResponse([], safe=False)
  
  events = models.Event.objects.filter(show_event=True, event_day=day).order_by("venue__name")
  return JsonResponse(serializers.EventSerializer(
    events,
    many=True
  ).data, safe=False)
    
@api_view(["GET"])
@permission_classes([AllowAny])
def get_all_event_types(request):
  """List all event types."""
  return JsonResponse(sorted(get_all(EventTypes)), safe=False)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_all_venue_types(request):
  """List all venue types."""
  return JsonResponse(sorted(get_all(VenueTypes)), safe=False)

@api_view(["GET"])
@permission_classes([AllowAny] if IS_PROD else [])
def search_events(request: HttpRequest):
  keyword = request.GET.get("keyword")
  if not keyword:
    return JsonResponse({
      "status": "error",
      "message": "No keyword supplied"
    })
  
  include_hidden = request.GET.get("include_hidden", False)
  
  return JsonResponse(serializers.EventSerializer(
    search_utils.search_all_events(keyword, include_hidden=include_hidden),
    many=True
  ).data, safe=False)

@api_view(["GET"])
@permission_classes([AllowAny] if IS_PROD else [])
def search_venues(request: HttpRequest):
  keyword = request.GET.get("keyword")
  if not keyword:
    return JsonResponse({
      "status": "error",
      "message": "No keyword supplied"
    })
  
  include_hidden = request.GET.get("include_hidden", False)
  
  return JsonResponse(serializers.VenueSerializer(
    search_utils.search_all_venues(keyword, include_hidden=include_hidden),
    many=True
  ).data, safe=False)

@api_view(["GET"])
@permission_classes([AllowAny] if IS_PROD else [])
def search_artists(request: HttpRequest):
  keyword = request.GET.get("keyword")
  if not keyword:
    return JsonResponse({
      "status": "error",
      "message": "No keyword supplied"
    })
  
  return JsonResponse(serializers.ArtistSerializer(
    search_utils.search_all_artists(keyword),
    many=True
  ).data, safe=False)

@api_view(["POST"])
@permission_classes([IsAdminUser] if IS_PROD else [])
def alias_and_merge_all_venues(request: HttpRequest):
  venue_utils.check_aliasing_and_merge_all()
  return Response(status=200)
