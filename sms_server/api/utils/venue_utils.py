"""Utils related to Venues."""
import importlib
import logging
from typing import Any, Optional

from api.models import Venue, VenueMask, VenueApi

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

def apply_mask(venue: Venue) -> Venue:
  """Applies venue masks to the input venue."""
  for mask in VenueMask.objects.all():
    if not mask.should_apply(venue):
      continue

    venue.name = mask.proper_name
    if mask.latitude:
      venue.latitude = mask.latitude
    if mask.longitude:
      venue.longitude = mask.longitude
    if mask.address:
      venue.address = mask.address

  return venue

def _get_or_create_venue(venue: Venue, debug: bool=False) -> Venue:
  """See if a venue exists."""
  if debug:
    logger.info(f"Get or create venue: {venue.__dict__}")

  db_venue = Venue.objects.filter(name=venue.name)
  if db_venue.exists():
    return db_venue.first()

  if venue.latitude and venue.longitude:
    db_venue = Venue.objects.filter(latitude=venue.latitude, longitude=venue.longitude)
    if db_venue.exists():
      return db_venue.first()

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

def get_crawl_function(crawler_module_name: str) -> Any:
  """Get a reference to the literal crawl() method on a crawler module."""
  crawler_module = importlib.import_module(f"api.ingestion.crawlers.{crawler_module_name}")
  if not hasattr(crawler_module, "crawl"):
    logger.warning(f"Crawler module api.ingestion.crawlers.{crawler_module_name} does not have a 'crawl' method.")
    return None
  
  return getattr(crawler_module, "crawl")

def get_crawler_info(crawler_name: str) -> tuple[Optional[Venue], Any]:
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
  crawler_function = get_crawl_function(venue_api.crawler_name)
  if crawler_function is None:
    return None, None
  
  return venue_api.venue, crawler_function
