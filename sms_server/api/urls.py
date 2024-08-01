"""Map URLs => views."""
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from rest_framework import routers
from rest_framework_simplejwt import views as jwt_views
from rest_framework.renderers import BrowsableAPIRenderer, CoreJSONRenderer, JSONRenderer, JSONOpenAPIRenderer
from rest_framework.schemas import get_schema_view

from api import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"artists", views.ArtistViewSet)
router.register(r"celery", views.PeriodicTaskViewSet)
router.register(r"events", views.EventViewSet)
router.register(r"open_mics", views.OpenMicViewSet)
router.register(r"raw_datas", views.RawDataViewSet)
router.register(r"venues", views.VenueViewSet)
router.register(r"ingestion_runs", views.IngestionRunViewSet)
router.register(r"carpenter_runs", views.CarpenterRunViewSet)
router.register(r"janitor_runs", views.JanitorRunViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
  path("api/artist_search", views.search_artists),
  path("api/event_search", views.search_events),
  path("api/venue_search", views.search_venues),
  path("api/venues/<int:venue_id>/venue_events", views.VenueEventsView.as_view(), name="venue_events"),
  path("api/ingestion_runs/<int:ingestion_run_id>/records", views.IngestionRunRecordsView.as_view(), name="ingestion_run_records"),
  path("api/carpenter_runs/<int:carpenter_run_id>/records", views.CarpenterRunRecordsView.as_view(), name="carpenter_run_records"),
  path("api/janitor_runs/<int:janitor_run_id>/records", views.JanitorRunRecordsView.as_view(), name="janitor_run_records"),
  path("api/get_events_on_day", views.get_events_on_day),
  path("api/get_all_event_types", views.get_all_event_types),
  path("api/get_all_venue_types", views.get_all_venue_types),
  path("api/logout", views.LogoutView.as_view()),
  path("api/token/", jwt_views.TokenObtainPairView.as_view()),
  path("api/token/refresh/", jwt_views.TokenRefreshView.as_view()),

  # Management commands triggered from the UI.
  path("api/commands/alias_and_merge_all_venues", views.alias_and_merge_all_venues),

  path("api/schema",
       get_schema_view(
        title="SMS",
        description="SMS API",
        version="1.0.0",
        renderer_classes=[JSONRenderer, BrowsableAPIRenderer],
       ), name="openapi-schema",
  ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
