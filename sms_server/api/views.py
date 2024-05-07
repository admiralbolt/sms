"""Display stuff!"""
import datetime

from django_celery_beat.models import PeriodicTask
from django.http import HttpRequest, JsonResponse
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, SAFE_METHODS
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
    return models.Event.objects.order_by("event_day", "venue__name", "start_time").filter(event_day__gte=datetime.date.today(), venue__show_venue=True, show_event=True)

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

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]

  def get_queryset(self):
    venue = models.Venue.objects.filter(id=self.kwargs.get("venue_id", None)).first()
    return models.Event.objects.filter(venue=venue)
  
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
  
class PeriodicTaskViewSet(viewsets.ReadOnlyModelViewSet):
  """List periodic tasks!"""
  resource_name = "periodic_tasks"
  queryset = PeriodicTask.objects.all()
  serializer_class = serializers.PeriodicTaskSerializer

  def get_permissions(self):
    permission_classes = [IsAuthenticatedOrReadOnly] if IS_PROD else []
    return [permission() for permission in permission_classes]
  
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
def get_all_event_types(request):
  """List all event types."""
  return JsonResponse(sorted(get_all(EventTypes)), safe=False)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_all_venue_types(request):
  """List all venue types."""
  return JsonResponse(sorted(get_all(VenueTypes)), safe=False)

@api_view(["GET"])
@permission_classes([IsAdminUser] if IS_PROD else [])
def search_events(request: HttpRequest):
  keyword = request.GET.get("keyword")
  if not keyword:
    return JsonResponse({
      "status": "error",
      "message": "No keyword supplied"
    })
  
  return JsonResponse(serializers.EventSerializer(
    search_utils.search_all_events(keyword),
    many=True
  ).data, safe=False)

@api_view(["POST"])
@permission_classes([IsAdminUser] if IS_PROD else [])
def alias_and_merge_all_venues(request: HttpRequest):
  venue_utils.check_aliasing_and_merge_all()
  return Response(status=200)
