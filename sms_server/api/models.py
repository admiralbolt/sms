"""Database models."""
import json
import logging
import re
import requests

from django.core.files.base import ContentFile
from django.db import models

from api.constants import get_choices, ChangeTypes, EventTypes, IngestionApis, Neighborhoods, OpenMicTypes, VenueTypes

logger = logging.getLogger(__name__)

class Venue(models.Model):
  """Places to go!"""
  created_at = models.DateTimeField(auto_now_add=True)
  name = models.CharField(max_length=128, unique=True)
  name_lower = models.CharField(max_length=128, unique=True)
  latitude = models.DecimalField(max_digits=9, decimal_places=6)
  longitude = models.DecimalField(max_digits=9, decimal_places=6)
  address = models.CharField(max_length=256)
  postal_code = models.CharField(max_length=8)
  city = models.CharField(max_length=64)
  venue_url = models.CharField(max_length=256, blank=True, null=True)
  venue_image_url = models.CharField(max_length=1024, blank=True, null=True)
  venue_image = models.ImageField(upload_to="venue_images", blank=True, null=True)
  description = models.TextField(default="", blank=True, null=True)

  neighborhood = models.CharField(max_length=64, blank=True, null=True, choices=get_choices(Neighborhoods))
  # Alias is a complicated regex-ish field that helps conditional match venues
  # based on slightly different naming. The regexes are keyed by the field
  # that they are applied to, for example:
  #
  # {"name": "^(The Tractor|Tractor Tavern)$"}
  alias = models.TextField(max_length=1024, blank=True, null=True)

  # In general we don't want to delete data, we just want to hide it.
  # We add two controls for this:
  # 1) Hiding / showing the venue.
  # 2) Turning off / on data gathering for the venue.
  show_venue = models.BooleanField(default=True)

  def alias_matches(self, other_venue: object) -> bool:
    """Check to see if another venue matches based on our aliasing."""
    try:
      alias_obj = json.loads(self.alias)
    except:
      logger.error(f"Alias field on venue {self.id} is not a json object.")
      return False

    for key, regex in alias_obj.items():
      if not re.match(regex, getattr(other_venue, key)):
        return False
    return True
  
  def __str__(self):
    return self.name
  
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_venue_image_url = self.venue_image_url

  def make_pretty(self):
    # Helper method for cleaning venue information.
    # Ideally I'd just trigger whatever black magic is happening in pre_save(),
    # but judging from: https://code.djangoproject.com/ticket/27825#comment:9
    # seems unlikely.
    self.name_lower = self.name.lower()
    self.latitude = round(float(self.latitude), 6)
    self.longitude = round(float(self.longitude), 6)

  def save(self, *args, **kwargs):
    self.make_pretty()
    super().save(*args, **kwargs)
    if self.venue_image_url:
      if self.venue_image_url != self._original_venue_image_url or not self.venue_image:
        image_request = requests.get(self.venue_image_url, timeout=15)
        file_extension = image_request.headers["Content-Type"].split("/")[1]
        content_file = ContentFile(image_request.content)
        self._original_venue_image_url = self.venue_image_url
        self.venue_image.save(f"{self.name}.{file_extension}", content_file)

  class Meta:
    unique_together = [["latitude", "longitude"]]


class VenueTag(models.Model):
  """Tags for venue types."""
  venue = models.ForeignKey(Venue, related_name="venue_tags", on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)
  venue_type = models.CharField(max_length=32, choices=get_choices(VenueTypes))

  def __str__(self):
    return f"{self.venue.name} - {self.venue_type}"

  class Meta:
    unique_together = [["venue", "venue_type"]]

class Crawler(models.Model):
  """Information about a crawler."""
  created_at = models.DateTimeField(auto_now_add=True)
  crawler_name = models.CharField(max_length=32, unique=True)
  venue = models.ForeignKey(Venue, on_delete=models.CASCADE)

  def __str__(self):
    return self.crawler_name


class Artist(models.Model):
  """Artists!"""
  created_at = models.DateTimeField(auto_now_add=True)
  name = models.CharField(max_length=64, unique=True)
  bio = models.TextField(max_length=256, blank=True, null=True)


class SocialLink(models.Model):
  """Social Links for artists."""
  created_at = models.DateTimeField(auto_now_add=True)
  artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
  platform = models.CharField(max_length=32)
  url = models.CharField(max_length=128)

  class Meta:
    unique_together = [["artist", "platform"]]


class Event(models.Model):
  """Finalized list of events."""
  created_at = models.DateTimeField(auto_now_add=True)
  title = models.CharField(max_length=256)
  event_day = models.DateField()
  start_time = models.TimeField(default=None, blank=True, null=True)
  event_url = models.CharField(max_length=512, blank=True, null=True)
  description = models.TextField(blank=True, null=True)
  event_image_url = models.CharField(max_length=1024, blank=True, null=True)
  event_image = models.ImageField(upload_to="event_images", blank=True, null=True)
  venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
  artists = models.ManyToManyField(Artist)
  event_type = models.CharField(max_length=16, choices=get_choices(EventTypes), default="Show")
  # Only applicable if an open mic.
  signup_start_time = models.TimeField(default=None, blank=True, null=True)
  # Meta control for display of events.
  show_event = models.BooleanField(default=True)

  def __str__(self):
    return f"{self.title} ({self.venue.name}, {self.event_day}, {self.title})"
  
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_event_image_url = self.event_image_url

  def save(self, *args, **kwargs):
    super().save(*args, **kwargs)
    if self.event_image_url:
      if self.event_image_url != self._original_event_image_url or not self.event_image:
        image_request = requests.get(self.event_image_url, timeout=15)
        file_extension = image_request.headers["Content-Type"].split("/")[1]
        content_file = ContentFile(image_request.content)
        self._original_event_image_url = self.event_image_url
        self.event_image.save(f"{self.title.replace(' ', '_').replace('/', '')}.{file_extension}", content_file)

  class Meta:
    unique_together = [["venue", "event_day", "start_time"]]


class RawData(models.Model):
  """Raw data from an api request.

  We save data from api requests in a staging table before it becomes finalized
  data. This will require some duplication of fields / code, but will provide
  some nice benefits:

  1) Better debugging, and we won't need to re-poll APIs to see where data
     comes from.
  2) The ability to link finalized events to the raw data where they come from.
  3) The ability to change merging/deduping rules and immediately see results.
  4) We can edit finalized venues / events, without losing the underlying data
     that they come from. 
  """
  created_at = models.DateTimeField(auto_now_add=True)
  api_name = models.CharField(max_length=20, choices=get_choices(IngestionApis), default="Manual")
  event_api_id = models.CharField(max_length=64)
  # We include event and venue name for sanity purposes.
  event_name = models.CharField(max_length=256)
  venue_name = models.CharField(max_length=128)
  data = models.JSONField()

  def __str__(self):
    return f"[{self.api_name}] ({self.venue_name}, {self.event_name})"

  class Meta:
    unique_together = [["api_name", "event_api_id"]]


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
    """Get the name of the open mic!"""
    if self.title:
      return self.title

    return "UNKNOWN_VENUE" if not self.venue else f"{self.venue.name} {self.event_mic_type}"
  
class JanitorRun(models.Model):
  """Logs for runs from the janitor."""
  created_at = models.DateTimeField(auto_now_add=True)
  name = models.CharField(max_length=64)

  def __str__(self):
    return f"{self.name} ({self.created_at})"
  
class JanitorRecord(models.Model):
  created_at = models.DateTimeField(auto_now_add=True)
  janitor_run = models.ForeignKey(JanitorRun, on_delete=models.CASCADE)
  api_name = models.CharField(max_length=32, default="Manual")
  raw_data = models.ForeignKey(RawData, on_delete=models.CASCADE)
  change_type = models.CharField(max_length=16, choices=get_choices(ChangeTypes))
  change_log = models.TextField(blank=True, null=True)
  
  # Helper field for seeing what got added/changed/deleted -> either an event,
  # a venue, or an artist.
  field_changed = models.CharField(max_length=32)
  # In some cases we are avoiding adding data, so these may be blank.
  event = models.ForeignKey(Event, on_delete=models.SET_NULL, blank=True, null=True)
  venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, blank=True, null=True)
  artist = models.ForeignKey(Artist, on_delete=models.SET_NULL, blank=True, null=True)

  def name_of_object_changed(self):
    obj = getattr(self, self.field_changed)
    return getattr(obj, "name", getattr(obj, "title", "None"))

  def __str__(self):
    return f"{self.janitor_run} - {self.api_name}: ({self.name_of_object_changed()}, {self.change_type})"

class IngestionRun(models.Model):
  """Logs for runs from the ingester."""
  created_at = models.DateTimeField(auto_now_add=True)
  name = models.CharField(max_length=64)

  def __str__(self):
    return f"{self.name} ({self.created_at})"

class IngestionRecord(models.Model):
  """Parent class for tracking individual changes from ingester run."""
  created_at = models.DateTimeField(auto_now_add=True)
  ingestion_run = models.ForeignKey(IngestionRun, on_delete=models.CASCADE)
  api_name = models.CharField(max_length=32, default="Manual")
  change_type = models.CharField(max_length=16, choices=get_choices(ChangeTypes))
  change_log = models.TextField(blank=True, null=True)
  # Helper field for which one of event / venue has been changed.
  field_changed = models.CharField(max_length=32)
  # In some cases we are avoiding adding an event or venue, so these fields may
  # be blank.
  event = models.ForeignKey(Event, on_delete=models.SET_NULL, blank=True, null=True)
  venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, blank=True, null=True)

  def __str__(self):
    return f"{self.ingestion_run} - {self.api_name}: ({self.venue}, {self.change_type})"

ADMIN_MODELS = [
  Artist,
  Crawler,
  Event,
  IngestionRun,
  IngestionRecord,
  JanitorRun,
  JanitorRecord,
  OpenMic,
  SocialLink,
  Venue,
  VenueTag,
]
