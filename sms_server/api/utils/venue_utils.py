"""Utils related to Venues."""
import importlib
import logging
import os
import re
from typing import Generator, Optional

from api.constants import get_all, ChangeTypes, VenueTypes
from api.ingestion.crawlers.crawler import AbstractCrawler
from api.models import Event, IngestionRecord, Venue, VenueTag

logger = logging.getLogger(__name__)

def _get_venue(name: Optional[str], latitude: Optional[float], longitude: Optional[float]) -> Venue:
  """Get a venue by name, lat/long fields, or aliasing."""
  if name:
    db_venue = Venue.objects.filter(name_lower=name.lower())
    if db_venue.exists():
      return db_venue.first()
    
    # Check against all venues with defined aliases.
    venues_with_aliases = Venue.objects.exclude(alias__isnull=True).exclude(alias__exact="")
    for db_venue in venues_with_aliases:
      if re.match(db_venue.alias, name, flags=re.IGNORECASE):
        return db_venue

  if latitude and longitude:
    # We need to round the inputs before we search the DB.
    latitude = round(float(latitude), 6)
    longitude = round(float(longitude), 6)
    db_venue = Venue.objects.filter(latitude=latitude, longitude=longitude)
    if db_venue.exists():
      return db_venue.first()

  return None

def add_venue_tags(venue: Venue, tags: list[str]) -> None:
  """Add venue tags if they don't exist."""
  for tag in tags:
    if tag not in get_all(VenueTypes):
      continue

    VenueTag.objects.get_or_create(
      venue=venue,
      venue_type=tag
    )

def get_or_create_venue(**kwargs) -> tuple[str, str, Venue]:
  """Get or create a venue.

  Returns a tuple of (change_type, change_log, Venue).
  """
  existing_venue = _get_venue(
    name=kwargs.get("name", None),
    latitude=kwargs.get("latitude", None),
    longitude=kwargs.get("longitude", None)
  )
  if existing_venue:
    return ChangeTypes.NOOP, "", existing_venue
  
  # Otherwise, we need to create the new venue.
  allowed_keys = set([field.name for field in Venue._meta.get_fields()])
  allowed_keys.remove("id")
  filtered_kwargs = {key: kwargs[key] for key in kwargs if key in allowed_keys}
  new_venue = Venue(**filtered_kwargs)
  new_venue.make_pretty()
  new_venue.save()
  return ChangeTypes.CREATE, new_venue.__dict__, new_venue


def get_crawler(crawler_module_name: str) -> AbstractCrawler:
  """Get an instance of a Crawler class from the module name."""
  crawler_module = importlib.import_module(f"api.ingestion.crawlers.{crawler_module_name}")
  for attr in dir(crawler_module):
    if attr != "Crawler" and attr.endswith("Crawler"):
      return getattr(crawler_module, attr)()

  return None

def merge_venues(from_venue: Venue, to_venue: Venue) -> bool:
  """Merge from_venue => to_venue.

  This performs the following ops:

  1. Moves all events associated with "from_venue" to "to_venue".
  2. Moves all venue apis that are associated with "from_venue" to "to_venue"
     IF, they don't already exist. May want to consider adjusted venue api
     structure in the future if we need to track multiple different api
     ids for a single venue.
  3. Updates all ingestion records associated with "from_venue" to "to_venue".
  4. Updates the "to_venue" tags to be the union of all venue tags.
  5. Deletes the "from_venue".
  """
  # 1. Move all events to the new venue, delete them if they aren't needed.
  for event in Event.objects.filter(venue=from_venue):
    if Event.objects.filter(venue=to_venue, event_day=event.event_day, start_time=event.start_time).exists():
      event.delete()
    else:
      event.venue = to_venue
      event.save()

  # 2. Update all ingestion records to point to the new venue.
  for record in IngestionRecord.objects.filter(venue=from_venue):
    record.venue = to_venue
    record.save()
  
  # 4. Merge all venue tags, delete them if they aren't needed.
  for tag in VenueTag.objects.filter(venue=from_venue):
    if VenueTag.objects.filter(venue=to_venue, venue_type=tag.venue_type).exists():
      tag.delete()
    else:
      tag.venue = to_venue
      tag.save()

  # 5. Should be no more references to our old venue, clean 'er up!
  from_venue.delete()

  return True

def check_aliasing_and_merge_all():
  """Checks aliasing of ALL venues, and merge venues accordingly.

  This can be a very expensive operation, as it has to check the list of all
  venues and perform alias matching on each one.
  """
  venues_with_aliasing = Venue.objects.exclude(alias__isnull=True).exclude(alias__exact="")
  if not venues_with_aliasing.exists():
    return
  
  for venue in Venue.objects.all():
    for proper_venue in venues_with_aliasing:
      if venue == proper_venue:
        continue

      if not proper_venue.alias_matches(venue):
        continue

      merge_venues(venue, proper_venue)

def all_crawler_names() -> Generator[str, None, None]:
  """Loads all crawler names based on file names on disk."""
  root_path = importlib.resources.files("api.ingestion.crawlers")
  for f in root_path.glob("*.py"):
    name = os.path.basename(f)[:-3]
    if name != "__init__" and name != "crawler":
      yield name