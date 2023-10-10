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

class OpenMicSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.OpenMic
    fields = "__all__"