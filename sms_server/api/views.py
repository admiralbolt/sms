from django.shortcuts import render
from rest_framework import viewsets

from api import models
from api import serializers

class ShowViewSet(viewsets.ModelViewSet):
  resource_name = "shows"
  queryset = models.Show.objects.all()
  serializer_class = serializers.ShowSerializer

  def get_queryset(self):
    return models.Show.objects.order_by("show_start")
  
class VenueViewSet(viewsets.ModelViewSet):
  resource_name = "venues"
  queryset = models.Venue.objects.all()
  serializer_class = serializers.VenueSerializer

  def get_queryset(self):
    venues = models.Venue.objects.order_by("name")
    return venues.filter(exists=True)

