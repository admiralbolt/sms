"""Map URLs => views."""
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework import routers

from api import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"events", views.EventViewSet)
router.register(r"open_mics", views.OpenMicViewSet)
router.register(r"venues", views.VenueViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
  path("api/venues/<int:venue_id>/events", views.VenueEventsView.as_view(), name="venue_events"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
