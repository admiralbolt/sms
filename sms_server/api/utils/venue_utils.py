"""Utils related to Venues."""
import importlib
import logging
from typing import Any, Optional

import deepdiff

from api.constants import get_all, ChangeTypes, VenueTypes
from api.ingestion.crawlers.crawler import Crawler
from api.models import Event, IngestionRecord, Venue, VenueTag, VenueApi
from api.utils import diff_utils

logger = logging.getLogger(__name__)

def clear_api_data(api_name: str) -> None:
  """Clear all venue data associated with a paritcular api."""
  venue_apis = VenueApi.objects.filter(api_name=api_name)
  # Gather all venues for potential deletion.
  venues = [venue_api.venue for venue_api in venue_apis]
  VenueApi.objects.filter(api_name=api_name).delete()
  # For each venue, if we deleted an associated API and it was the last one
  # left, we delete the venues.
  for venue in venues:
    if VenueApi.objects.filter(venue=venue).count() > 0:
      continue

    venue.delete()

def _get_venue(venue: Venue) -> Venue:
  """Get a venue by name, lat/long fields, or aliasing."""
  db_venue = Venue.objects.filter(name_lower=venue.name.lower())
  if db_venue.exists():
    return db_venue.first()

  if venue.latitude and venue.longitude:
    db_venue = Venue.objects.filter(latitude=venue.latitude, longitude=venue.longitude)
    if db_venue.exists():
      return db_venue.first()

  # Check against all venues with defined aliases.
  venues_with_aliases = Venue.objects.exclude(alias__isnull=True).exclude(alias__exact="")
  for db_venue in venues_with_aliases:
    if db_venue.alias_matches(venue):
      return db_venue

  return None

def _get_or_create_venue(venue: Venue, debug: bool=False) -> Venue:
  """See if a venue exists."""
  if debug:
    logger.info(f"Get or create venue: {venue.__dict__}")

  db_venue = _get_venue(venue)
  if db_venue:
    return db_venue

  venue.save()
  return venue

def add_venue_api(venue: Venue, api_name: str, api_id: str) -> None:
  """Add venue api if it doesn't already exist."""
  venue_api = VenueApi.objects.filter(venue=venue, api_name=api_name).first()
  if venue_api:
    return

  VenueApi.objects.create(
    venue=venue,
    api_name=api_name,
    api_id=api_id
  )

def add_venue_tags(venue: Venue, tags: list[str]) -> None:
  """Add venue tags if they don't exist."""
  for tag in tags:
    if tag not in get_all(VenueTypes):
      continue

    VenueTag.objects.get_or_create(
      venue=venue,
      venue_type=tag
    )

def create_or_update_venue(api_name: str="", api_id: str="", debug: bool=False, **kwargs) -> tuple[str, str, Venue]:
  """Create or update a venue.

  Returns a tuple of (change_type, change_log, Venue). The change_type will be 
  the changes applied (if any), and the change_log will include more information
  about the changes applied / fields created. The Venue returned will be the 
  finalized version of the created or updated venue.
  """
  new_venue = Venue(**kwargs)
  new_venue.make_pretty()

  # THIS IS AMERICA.
  if isinstance(new_venue.postal_code, str) and new_venue.postal_code.startswith("V8"):
    return ChangeTypes.SKIP, f"Skipping venue with canadian postal code: {new_venue.__dict__}", None

  if debug:
    logger.info(f"Create or update venue: ({new_venue.__dict__})")

  # If the venue doesn't exist, create it and move on.
  db_venue = _get_venue(new_venue)
  if not db_venue:
    new_venue.save()
    add_venue_api(venue=new_venue, api_name=api_name, api_id=api_id)
    return ChangeTypes.CREATE, str(new_venue.__dict__), new_venue

  # If the venue does exist we need to determine what the diffs are, and how
  # to handle them.
  original_db_data = db_venue.__dict__
  diff = deepdiff.DeepDiff(
    original_db_data,
    new_venue.__dict__,
    ignore_order=True,
    exclude_paths=["id"]
  )

  # If brand new fields are added, add them!
  fields_added, _ = diff_utils.handle_new_fields(db_venue, new_venue.__dict__, diff)
  # Handle "new" fields. Cases where old fields are blank / empty strings.
  fields_updated, _ = diff_utils.handle_new_fields_diff(db_venue, diff.get("values_changed", None))

  change_type = ChangeTypes.NOOP
  change_log = ""
  if fields_added or fields_updated:
    change_type = ChangeTypes.UPDATE
    # Takes some extra effort, but we serialize the final diffs to json.
    final_diff = deepdiff.DeepDiff(
      original_db_data,
      db_venue.__dict__,
      ignore_order=True,
      exclude_paths=["id"]
    )
    change_log = final_diff.to_json()
    db_venue.save()
  
  add_venue_api(venue=db_venue, api_name=api_name, api_id=api_id)
  return change_type, change_log, db_venue

def get_or_create_venue(name: str, latitude: float=0, longitude: float=0, address: str="", postal_code: int=0, city: str="", api_name: str="", api_id: int=0, debug: bool=False) -> Venue:
  """Get or create a venue.

  We make the dangerous assumption here, that if you don't supply the proper
  values for a particular field, they will be inherited via a mask properly.
  """
  venue = _get_or_create_venue(apply_mask(Venue(
      name=name,
      latitude=latitude,
      longitude=longitude,
      address=address,
      postal_code=postal_code,
      city=city,
    )), debug=debug)

  # Get or create an associated venue API record before returning.
  add_venue_api(venue=venue, api_name=api_name, api_id=api_id)
  return venue

def get_crawler(crawler_module_name: str) -> Crawler:
  """Get an instance of a Crawler class from the module name."""
  crawler_module = importlib.import_module(f"api.ingestion.crawlers.{crawler_module_name}")
  for attr in dir(crawler_module):
    if attr != "Crawler" and attr.endswith("Crawler"):
      return getattr(crawler_module, attr)()

  return None

def get_crawler_info(crawler_name: str) -> tuple[Optional[Venue], Crawler]:
  """Load crawler info by crawler name.

  This should match the corresponding crawler name field on the api exactly.
  Similarly, there should be a definition for the crawler logic in
  ingestion/crawlers/
  """
  venue_apis = VenueApi.objects.filter(crawler_name=crawler_name)
  if len(venue_apis) != 1:
    logger.warning(f"Found {len(venue_apis)} matches for {crawler_name=}")
    return None, None

  venue_api = venue_apis.first()
  crawler = get_crawler(venue_api.crawler_name)
  if crawler is None:
    return None, None

  return venue_api.venue, crawler

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

  # 2. Move all venue apis to the new venue. Delete them if they aren't needed.
  for venue_api in VenueApi.objects.filter(venue=from_venue):
    if VenueApi.objects.filter(venue=to_venue, api_name=venue_api.api_name).exists():
      venue_api.delete()
    else:
      venue_api.venue = to_venue
      venue_api.save()

  # 3. Update all ingestion records to point to the new venue.
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
