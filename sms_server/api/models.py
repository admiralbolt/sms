"""Database models."""
import re
import requests

from django.core.files.base import ContentFile
from django.db import models

from api.constants import get_choices, EventTypes, IngestionApis, OpenMicTypes, VenueTypes

class APISample(models.Model):
  """Raw data dumps from the api."""
  name = models.CharField(max_length=256)
  created_at = models.DateTimeField(auto_now_add=True)
  api_name = models.CharField(max_length=20, choices=get_choices(IngestionApis), default="Manual")
  data = models.JSONField()

  def __str__(self):
    return f"[{self.api_name}] ({self.created_at}) {self.name}"

class Venue(models.Model):
  """Places to go!"""
  name = models.CharField(max_length=128, unique=True)
  created_at = models.DateTimeField(auto_now_add=True)
  latitude = models.DecimalField(max_digits=11, decimal_places=8)
  longitude = models.DecimalField(max_digits=11, decimal_places=8)
  address = models.CharField(max_length=256)
  postal_code = models.CharField(max_length=8)
  city = models.CharField(max_length=64)
  venue_type = models.CharField(max_length=32, choices=get_choices(VenueTypes), default="Bar")
  venue_url = models.CharField(max_length=256, blank=True, null=True)
  venue_image_url = models.CharField(max_length=256, blank=True, null=True)
  venue_image = models.ImageField(upload_to="venue_images", blank=True)

  # Optional.
  description = models.TextField(default="", blank=True, null=True)
  max_capacity = models.IntegerField(default=-1)

  # In general we don't want to delete data, we just want to hide it.
  # We add two controls for this:
  # 1) Hiding / showing the venue.
  # 2) Turning off / on data gathering for the venue.
  show_venue = models.BooleanField(default=True)
  gather_data = models.BooleanField(default=True)

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_venue_image_url = self.venue_image_url

  def save(self, force_insert=False, force_update=False, *args, **kwargs):
    super().save(force_insert, force_update, *args, **kwargs)
    if self.venue_image_url:
      if self.venue_image_url != self._original_venue_image_url or not self.venue_image:
        image_request = requests.get(self.venue_image_url)
        file_extension = image_request.headers["Content-Type"].split("/")[1]
        content_file = ContentFile(image_request.content)
        self._original_venue_image_url = self.venue_image_url
        self.venue_image.save(f"{self.name}.{file_extension}", content_file)

  def __str__(self):
    return self.name

  class Meta:
    unique_together = [["latitude", "longitude"]]

class VenueTags(models.Model):
  """Tags for venue types."""
  venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)
  venue_type = models.CharField(max_length=32, choices=get_choices(VenueTypes))

  class Meta:
    unique_together = [["venue", "venue_type"]]

class VenueApi(models.Model):
  """API information for a venue.

  Venues can potentially use multiple apis, so this is done as a separate model
  instead of as a field.
  """
  venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)
  api_name = models.CharField(max_length=20, choices=get_choices(IngestionApis), default="Manual")
  api_id = models.CharField(max_length=32, blank=True, null=True)
  crawler_name = models.CharField(max_length=32, blank=True, null=True)

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
  created_at = models.DateTimeField(auto_now_add=True)
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
  venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)
  event_type = models.CharField(max_length=16, choices=get_choices(EventTypes), default="Show")
  # I think eventually this could get replaced by linking to artists
  # participating in the show, but for a rough draft this is good enough.
  title = models.CharField(max_length=256)
  event_day = models.DateField()
  # Only applicable if an open mic.
  signup_start_time = models.TimeField(default=None, blank=True, null=True)

  cash_only = models.BooleanField(default=False)
  start_time = models.TimeField(default=None, blank=True, null=True)
  end_time = models.TimeField(default=None, blank=True, null=True)
  doors_open = models.TimeField(default=None, blank=True, null=True)
  is_ticketed = models.BooleanField(default=False)
  ticket_price_min = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
  ticket_price_max = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
  event_api = models.CharField(max_length=20, choices=get_choices(IngestionApis), default="Manual")
  event_url = models.CharField(max_length=512, blank=True, null=True)
  description = models.TextField(blank=True, null=True)
  event_image_url = models.CharField(max_length=256, blank=True, null=True)
  event_image = models.ImageField(upload_to="event_images", blank=True)

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_event_image_url = self.event_image_url

  def save(self, force_insert=False, force_update=False, *args, **kwargs):
    super().save(force_insert, force_update, *args, **kwargs)
    if self.event_image_url:
      if self.event_image_url != self._original_event_image_url or not self.event_image:
        image_request = requests.get(self.event_image_url)
        file_extension = image_request.headers["Content-Type"].split("/")[1]
        content_file = ContentFile(image_request.content)
        self._original_event_image_url = self.event_image_url
        self.event_image.save(f"{self.title.replace(' ', '_').replace('/', '')}.{file_extension}", content_file)
  
  # Meta control for display of events.
  show_event = models.BooleanField(default=True)

  def __str__(self):
    return f"[{self.venue}] ({self.event_day}) {self.title}"

  class Meta:
    unique_together = [["venue", "event_day", "start_time"]]


class OpenMic(models.Model):
  """Generic information about an open mic."""
  venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True)
  created_at = models.DateTimeField(auto_now_add=True)
  # A lot of open mic nights are just venue name + open mic i.e.
  # Connor Byrne Open Mic, Hidden Door Open Mic. There are some exceptions like
  # Mojam, so we'll add an optional title field just in case.
  title = models.CharField(max_length=256, default="", blank=True, null=True)
  event_mic_type = models.CharField(max_length=32, choices=get_choices(EventTypes), default=EventTypes.OPEN_MIC)
  open_mic_type = models.CharField(max_length=16, choices=get_choices(OpenMicTypes), default=OpenMicTypes.MUSIC)
  description = models.TextField()

  # Timing details.
  signup_start_time = models.TimeField()
  event_start_time = models.TimeField()
  event_end_time = models.TimeField()

  # Additional information fields.
  all_ages = models.BooleanField(default=False)
  house_piano = models.BooleanField(default=False)
  house_pa = models.BooleanField(default=True)
  drums = models.BooleanField(default=False)

  # The crontab string that represents the cadence of the open mic.
  cadence_crontab = models.CharField(max_length=64)
  # The human readable version of the open mic cadence.
  cadence_readable = models.CharField(max_length=128)

  # Should we display / generate events for this open mic?
  generate_events = models.BooleanField(default=True)

  def __str__(self):
    return self.name()
  
  def name(self):
    if self.title:
      return self.title

    return "UNKNOWN_VENUE" if not self.venue else f"{self.venue.name} Open Mic"
  
ADMIN_MODELS = [
  APISample,
  Event,
  OpenMic,
  Venue,
  VenueApi,
  VenueMask,
  VenueTags,
]
