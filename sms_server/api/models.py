"""Database models."""

import logging
import re

import filetype
import requests
from django.core.files.base import ContentFile
from django.db import models

from api.constants import ChangeTypes, EventTypes, IngestionApis, JanitorOperations, Neighborhoods, OpenMicTypes, VenueTypes, get_choices

logger = logging.getLogger(__name__)


class Venue(models.Model):
  """Places to go!"""

  created_at = models.DateTimeField(auto_now_add=True)
  name = models.CharField(max_length=128, unique=True)
  name_lower = models.CharField(max_length=128, unique=True)
  slug = models.CharField(max_length=128, unique=True)
  latitude = models.DecimalField(max_digits=8, decimal_places=5)
  longitude = models.DecimalField(max_digits=8, decimal_places=5)
  address = models.CharField(max_length=256)
  postal_code = models.CharField(max_length=8)
  city = models.CharField(max_length=64)
  venue_url = models.CharField(max_length=256, blank=True, null=True)
  venue_image_url = models.CharField(max_length=1024, blank=True, null=True)
  venue_image = models.ImageField(upload_to="venue_images", blank=True, null=True)
  description = models.TextField(default="", blank=True, null=True)

  neighborhood = models.CharField(max_length=64, blank=True, null=True, choices=get_choices(Neighborhoods))
  # Alias is a complicated regex field that helps conditional match venues
  # based on slightly different naming. For example:
  #
  # "(The Tractor|Tractor Tavern)$"
  alias = models.TextField(max_length=1024, blank=True, null=True)

  # In general we don't want to delete data, we just want to hide it.
  # We add two controls for this:
  # 1) Hiding / showing the venue.
  # 2) Turning off / on data gathering for the venue.
  show_venue = models.BooleanField(default=True)

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
    self.slug = re.sub("[^a-z0-9 ]+", "", self.name_lower).replace(" ", "-")
    self.latitude = round(float(self.latitude), 5)
    self.longitude = round(float(self.longitude), 5)

  def save(self, *args, **kwargs):
    self.make_pretty()
    super().save(*args, **kwargs)
    if self.venue_image_url:
      if self.venue_image_url != self._original_venue_image_url or not self.venue_image:
        image_request = requests.get(self.venue_image_url, timeout=15)
        file_extension = ""
        parts = image_request.headers["Content-Type"].split("/")
        if len(parts) == 2:
          file_extension = parts[1]
        kind = filetype.guess(image_request.content)
        if kind is not None:
          file_extension = kind.extension
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
  name_slug = models.CharField(max_length=128, unique=True)
  bio = models.TextField(max_length=256, blank=True, null=True)
  artist_image_url = models.CharField(max_length=1024, blank=True, null=True)
  artist_image = models.ImageField(upload_to="event_images", blank=True, null=True)

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_artist_image_url = self.artist_image_url

  def save(self, *args, **kwargs):
    self.name_slug = self.name.lower().replace(" ", "-")
    super().save(*args, **kwargs)
    if self.artist_image_url:
      if self.artist_image_url != self._original_artist_image_url or not self.artist_image:
        image_request = requests.get(self.artist_image_url, timeout=15)
        file_extension = ""
        parts = image_request.headers["Content-Type"].split("/")
        if len(parts) == 2:
          file_extension = parts[1]
        kind = filetype.guess(image_request.content)
        if kind is not None:
          file_extension = kind.extension
        content_file = ContentFile(image_request.content)
        self._original_artist_image_url = self.artist_image_url
        self.artist_image.save(f"{self.name_slug.replace(' ', '_').replace('/', '')}.{file_extension}", content_file)

  def __str__(self):
    return f"|{self.id}| {self.name}"


class SocialLink(models.Model):
  """Social Links for artists."""

  created_at = models.DateTimeField(auto_now_add=True)
  artist = models.ForeignKey(Artist, related_name="social_links", on_delete=models.CASCADE)
  platform = models.CharField(max_length=32)
  url = models.CharField(max_length=128)

  class Meta:
    unique_together = [["artist", "platform"]]

    def __str__(self):
      return f"|{self.id}| [{self.artist}, {self.platform}]"


class Event(models.Model):
  """List of events."""

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

  finalized = models.BooleanField(default=False)

  def __str__(self):
    return f"|{self.id}| {self.title} ({self.venue.name}, {self.event_day}, {self.title})"

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._original_event_image_url = self.event_image_url

  def save(self, *args, **kwargs):
    super().save(*args, **kwargs)
    if self.event_image_url:
      if self.event_image_url != self._original_event_image_url or not self.event_image:
        image_request = requests.get(self.event_image_url, timeout=15)
        file_extension = ""
        parts = image_request.headers["Content-Type"].split("/")
        if len(parts) == 2:
          file_extension = parts[1]
        kind = filetype.guess(image_request.content)
        if kind is not None:
          file_extension = kind.extension
        content_file = ContentFile(image_request.content)
        self._original_event_image_url = self.event_image_url
        self.event_image.save(f"{self.title.replace(' ', '_').replace('/', '')}.{file_extension}", content_file)


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
  api_name = models.CharField(max_length=32, choices=get_choices(IngestionApis), default="Manual")
  event_api_id = models.CharField(max_length=64)
  # We include event and venue name for sanity purposes.
  event_name = models.CharField(max_length=256)
  venue_name = models.CharField(max_length=128)
  event_day = models.DateField()
  data = models.JSONField()
  processed = models.BooleanField(default=False)

  event = models.ForeignKey(Event, related_name="raw_datas", on_delete=models.SET_NULL, blank=True, null=True)

  def __str__(self):
    return f"|{self.id}| [{self.api_name}] ({self.venue_name}, {self.event_name})"

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
  """Is your janitor running?"""

  created_at = models.DateTimeField(auto_now_add=True)
  finished_at = models.DateTimeField(blank=True, null=True)
  name = models.CharField(max_length=64)

  def __str__(self):
    return f"{self.name} ({self.created_at})"


class JanitorMergeEventRecord(models.Model):
  to_event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="to_event")


class JanitorApplyArtistRecord(models.Model):
  event = models.ForeignKey(Event, on_delete=models.CASCADE)
  artists = models.ManyToManyField(Artist)


class JanitorRecord(models.Model):
  created_at = models.DateTimeField(auto_now_add=True)
  janitor_run = models.ForeignKey(JanitorRun, on_delete=models.CASCADE)
  operation = models.CharField(max_length=16, choices=get_choices(JanitorOperations))
  change_log = models.TextField(blank=True, null=True)

  # Only one of the following should be populated.
  merge_event_record = models.ForeignKey(JanitorMergeEventRecord, on_delete=models.SET_NULL, blank=True, null=True)
  apply_artists_record = models.ForeignKey(JanitorApplyArtistRecord, on_delete=models.SET_NULL, blank=True, null=True)


class CarpenterRun(models.Model):
  """Logs for runs from the carpenter."""

  created_at = models.DateTimeField(auto_now_add=True)
  finished_at = models.DateTimeField(blank=True, null=True)
  name = models.CharField(max_length=64)

  def __str__(self):
    return f"{self.name} ({self.created_at})"

  def run_time(self) -> str:
    if not self.finished_at:
      return ""

    return str(self.finished_at - self.created_at)


class CarpenterRecord(models.Model):
  created_at = models.DateTimeField(auto_now_add=True)
  carpenter_run = models.ForeignKey(CarpenterRun, on_delete=models.CASCADE)
  api_name = models.CharField(max_length=32, default="Manual")
  raw_data = models.ForeignKey(RawData, on_delete=models.CASCADE, blank=True, null=True)
  open_mic = models.ForeignKey(OpenMic, on_delete=models.CASCADE, blank=True, null=True)
  change_type = models.CharField(max_length=16, choices=get_choices(ChangeTypes))
  change_log = models.TextField(blank=True, null=True)

  # Helper field for seeing what got added/changed/deleted -> either an event,
  # a venue, or an artist.
  field_changed = models.CharField(max_length=32, choices=[("event", "event"), ("venue", "venue"), ("artist", "artist"), ("none", "none")])
  # In some cases we are avoiding adding data, so these may be blank.
  event = models.ForeignKey(Event, on_delete=models.SET_NULL, blank=True, null=True)
  venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, blank=True, null=True)
  artist = models.ForeignKey(Artist, on_delete=models.SET_NULL, blank=True, null=True)

  def name_of_object_changed(self):
    if self.field_changed == "none":
      return "None"

    obj = getattr(self, self.field_changed)
    return getattr(obj, "name", getattr(obj, "title", "None"))

  def __str__(self):
    return f"{self.carpenter_run} - {self.api_name}: ({self.name_of_object_changed()}, {self.change_type})"

  def run_time(self) -> str:
    if not self.finished_at:
      return ""

    return str(self.finished_at - self.created_at)


class IngestionRun(models.Model):
  """Logs for runs from the ingester."""

  created_at = models.DateTimeField(auto_now_add=True)
  finished_at = models.DateTimeField(blank=True, null=True)
  name = models.CharField(max_length=64)
  metadata = models.JSONField(blank=True, null=True)

  def __str__(self):
    return f"{self.name} ({self.created_at})"

  def run_time(self) -> str:
    if not self.finished_at:
      return ""

    return str(self.finished_at - self.created_at)


class IngestionRecord(models.Model):
  """Parent class for tracking individual changes from ingester run."""

  created_at = models.DateTimeField(auto_now_add=True)
  ingestion_run = models.ForeignKey(IngestionRun, on_delete=models.CASCADE)
  api_name = models.CharField(max_length=32, default="Manual")
  change_type = models.CharField(max_length=16, choices=get_choices(ChangeTypes))
  change_log = models.TextField(blank=True, null=True)
  # Occasionally we have errors, and raw_data isn't inserted properly.
  # Leave this field as optional just in case.
  raw_data = models.ForeignKey(RawData, on_delete=models.CASCADE, blank=True, null=True)

  def __str__(self):
    return f"{self.ingestion_run} - {self.change_type}, {self.raw_data}"


ADMIN_MODELS = [
  Artist,
  Crawler,
  Event,
  IngestionRun,
  IngestionRecord,
  CarpenterRun,
  CarpenterRecord,
  OpenMic,
  RawData,
  SocialLink,
  Venue,
  VenueTag,
]
