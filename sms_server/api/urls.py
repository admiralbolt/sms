"""Map URLs => views."""
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework import routers

from api import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"events", views.EventViewSet)
router.register(r"venues", views.VenueViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
