import logging

from api.ingestion.event_apis.event_api import EventApi
from api.models import Crawler, Venue

logger = logging.getLogger(__name__)


class AbstractCrawler(EventApi):
  """Abstract crawler class."""

  venue_name_regex: str = ""
  venue: Venue = None

  has_artists = False
  has_venues = False

  def __init__(self, api_name: str, venue_name_regex: str) -> object:
    super().__init__(api_name=api_name)
    self.titleized_name = self.api_name.replace("_", " ").title()
    self.venue_name_regex = venue_name_regex
    self._load_venue()

  def get_raw_data_info(self, raw_data: dict) -> dict:
    raw_data["venue_name"] = self.venue.name
    return raw_data

  def get_venue(self) -> Venue:
    return self.venue

  def _load_venue(self):
    """Loads the proper venue information for the crawler.

    This is done by checking the venue api objects for an entry with a matching
    crawler name. If one doesn't exist, we attempt to create one matching to
    an existing venue based on the regex name.
    """
    # Check to see if a Crawler object already exists for this crawler.
    apis = Crawler.objects.filter(crawler_name=self.api_name)
    if apis.exists():
      self.venue = apis.first().venue
      return

    # Look for venues that match the name regex. We only proceed if a single
    # venue matches.
    venues = Venue.objects.filter(name__iregex=self.venue_name_regex)
    if len(venues) != 1:
      logger.warn(f"Unable to create venue api object for crawler: {self.api_name}, {len(venues)} match the name regex.")
      return

    Crawler.objects.create(venue=venues.first(), crawler_name=self.api_name)
    self.venue = venues.first()
