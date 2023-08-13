from rest_framework import serializers

from api import models

class VenueSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = models.Venue
    fields = "__all__"

class ShowSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.Show
    fields = "__all__"

class OpenMicSerializer(serializers.ModelSerializer):

  class Meta:
    model = models.OpenMic
    fields = "__all__"