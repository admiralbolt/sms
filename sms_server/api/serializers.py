from rest_framework import serializers

from api import models

class VenueSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = models.Venue
    fields = "__all__"

class EventSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.Event
    fields = "__all__"

class OpenMicGeneratorSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.OpenMicGenerator
    fields = "__all__"