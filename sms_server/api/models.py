"""Database models."""
import re

from django.db import models

INGESTION_APIS = [
    ("Ticketmaster", "Ticketmaster"),
    ("Venuepilot", "Venuepilot"),
    ("Eventbrite", "Eventbrite"),
    ("TIXR", "TIXR"),
    ("Crawler", "Crawler"),
    ("AXS", "AXS"),
    ("Manual", "Manual"),
]

class Venue(models.Model):
  """Places to go!"""
  name = models.CharField(max_length=128, unique=True)
  latitude = models.DecimalField(max_digits=11, decimal_places=8)
  longitude = models.DecimalField(max_digits=11, decimal_places=8)
  address = models.CharField(max_length=256)
  postal_code = models.CharField(max_length=8)
  city = models.CharField(max_length=64)

  # Optional.
  description = models.TextField(default="", blank=True, null=True)
  max_capacity = models.IntegerField(default=-1)

  # In general we don't want to delete data, we just want to hide it.
  # We add two controls for this:
  # 1) Hiding / showing the venue.
  # 2) Turning off / on data gathering for the venue.
  show_venue = models.BooleanField(default=True)
  gather_data = models.BooleanField(default=True)

  def __str__(self):
    return self.name

  class Meta:
    unique_together = [["latitude", "longitude"]]

class VenueApi(models.Model):
  """API information for a venue.

  Venues can potentially use multiple apis, so this is done as a separate model
  instead of as a field.
  """
  venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
  api_name = models.CharField(max_length=20, choices=INGESTION_APIS, default="Manual")
  api_id = models.CharField(max_length=32, blank=True, null=True)

  def __str__(self):
    return f"{self.venue.name} - {self.api_name}"

  class Meta:
    unique_together = [["venue", "api_name"]]


class VenueMask(models.Model):
  """Venue Masks.

  A mask that gets applied to ingested venue data. This happens when the input
  data is not the cleaniest. We can get duplicate venue venues with very similar
  names e.g. "Tractor" vs. "Tractor Tavern". Additionally there can be missing
  fields, we create the mask to clean all the information when we import it.
  """
  proper_name = models.CharField(max_length=128, unique=True)
  # Match is a complicated regex-ish field that controls when we apply a venue
  # mask. Regexes are keyed by the field are they are applied to, for example:
  #
  # {"name": "^(The Funhouse|El Corazon)$"}
  match = models.JSONField(max_length=256)
  latitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
  longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
  address = models.CharField(max_length=256, blank=True, null=True)
  postal_code = models.CharField(max_length=8, blank=True, null=True)
  city = models.CharField(max_length=64, blank=True, null=True)

  venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, blank=True, null=True)

  def __str__(self):
    return f"{self.proper_name}"

  def should_apply(self, venue: Venue) -> bool:
    """Check to see if a mask should apply to a particular venue."""
    for key, regex in self.match.items():
      if not re.match(regex, getattr(venue, key)):
        return False

    return True


class Event(models.Model):
  """Shows to be had!"""
  EVENT_TYPES = [
    ("Open Mic", "Open Mic"),
    ("Show", "Show")
  ]

  venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
  event_type = models.CharField(max_length=16, choices=EVENT_TYPES, default="Show")
  # I think eventually this could get replaced by linking to artists
  # participating in the show, but for a rough draft this is good enough.
  title = models.CharField(max_length=256)
  event_day = models.DateField()
  start_time = models.TimeField(default=None, null=True)
  doors_open = models.TimeField(default=None, blank=True, null=True)
  ticket_price_min = models.DecimalField(max_digits=8, decimal_places=2, default=0)
  ticket_price_max = models.DecimalField(max_digits=8, decimal_places=2)
  event_api = models.CharField(max_length=20, choices=INGESTION_APIS, default="Manual")
  event_url = models.CharField(max_length=512, blank=True, null=True)

  def __str__(self):
    return self.title

  class Meta:
    unique_together = [["venue", "title"]]


class OpenMicGenerator(models.Model):
  """Showcase yourself!"""
  venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, blank=True, null=True)
  # A lot of open mic nights are just venue name + open mic i.e.
  # Connor Byrne Open Mic, Hidden Door Open Mic. There are some exceptions like
  # Mojam, so we'll add an optional title field just in case.
  title = models.CharField(max_length=256, default="", blank=True, null=True)
  description = models.TextField()
  crontab_string = models.CharField(max_length=64)

  def __str__(self):
    return self.title

ADMIN_MODELS = [
  Event,
  OpenMicGenerator,
  Venue,
  VenueMask,
  VenueApi
]
