"""Map URLs => views."""
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from rest_framework import routers
from rest_framework_simplejwt import views as jwt_views

from api import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"events", views.EventViewSet)
router.register(r"open_mics", views.OpenMicViewSet)
router.register(r"venues", views.VenueViewSet)
router.register(r"ingestion_runs", views.IngestionRunViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
  path("api/venues/<int:venue_id>/events", views.VenueEventsView.as_view(), name="venue_events"),
  path("api/ingestion_runs/<int:ingestion_run_id>/records", views.IngestionRunRecordsView.as_view(), name="ingestion_run_records"),
  path("api/get_all_event_types", views.get_all_event_types),
  path("api/get_all_venue_types", views.get_all_venue_types),
  path("api/logout/", views.LogoutView.as_view()),
  path("api/token/", jwt_views.TokenObtainPairView.as_view()),
  path("api/token/refresh/", jwt_views.TokenRefreshView.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
