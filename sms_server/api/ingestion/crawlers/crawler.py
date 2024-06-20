from abc import ABC, abstractmethod
from typing import Generator
import logging

from api.models import Crawler, Venue

logger = logging.getLogger(__name__)

class AbstractCrawler(ABC):
  """Abstract crawler class."""
  crawler_name: str = ""
  venue_name_regex: str = ""
  venue: Venue = None
  has_artists: bool = False

  def __init__(self, crawler_name: str, venue_name_regex: str) -> object:
    self.crawler_name = crawler_name
    self.titleized_name = crawler_name.replace("_", " ").title()
    self.venue_name_regex = venue_name_regex
    self._load_venue()

  @abstractmethod
  def get_event_kwargs(self, raw_data: dict) -> dict:
    """Get kwargs necessary for creating or updating an event based on raw data.

    For crawlers this is mostly unnecessary, since most of the time we need to
    structure the data from html.
    """
    pass

  def get_artist_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    """Get kwargs necessary for creating or updating an artist."""
    yield {}

  @abstractmethod
  def get_event_list(self) -> Generator[dict, None, None]:
    pass

  def _load_venue(self):
    """Loads the proper venue information for the crawler.

    This is done by checking the venue api objects for an entry with a matching
    crawler name. If one doesn't exist, we attempt to create one matching to
    an existing venue based on the regex name.
    """
    # Check to see if a Crawler object already exists for this crawler.
    apis = Crawler.objects.filter(crawler_name=self.crawler_name)
    if apis.exists():
      self.venue = apis.first().venue
      return
    
    # Look for venues that match the name regex. We only proceed if a single
    # venue matches.
    venues = Venue.objects.filter(name__iregex=self.venue_name_regex)
    if len(venues) != 1:
      logger.warn(f"Unable to create venue api object for crawler: {self.crawler_name}, {len(venues)} match the name regex.")
      return
    
    Crawler.objects.create(
      venue=venues.first(),
      crawler_name=self.crawler_name
    )
    self.venue = venues.first()

