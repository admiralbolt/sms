from abc import ABC, abstractmethod
from typing import Generator
import logging

from api.models import Crawler, Venue

logger = logging.getLogger(__name__)

class Crawler(ABC):
  """Abstract crawler class."""
  crawler_name: str = ""
  venue_name_regex: str = ""
  venue: Venue = None

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

  @abstractmethod
  def get_artist_kwargs(self, raw_data: dict) -> dict:
    """Get kwargs necessary for creating or updating an artist."""
    pass

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

  # def process_event(self, ingestion_run: IngestionRun, event_data: dict, debug: bool = False) -> None:
  #   """Process one event!"""
  #   try:
  #     event_kwargs = self.get_event_kwargs(event_data=event_data)
  #     event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=self.venue, **event_kwargs, event_api=IngestionApis.CRAWLER, debug=debug)
  #     IngestionRecord.objects.create(
  #       ingestion_run=ingestion_run,
  #       api_name=f"Crawler - {self.titleized_name}",
  #       change_type=event_change_type,
  #       change_log=event_change_log,
  #       field_changed="event",
  #       event=event
  #     )
  #   except Exception as e:
  #     logger.error("ERROR Processing Event for ingestion_run: %s. Data: %s, Error: %s.", ingestion_run, event_data, e, exc_info=1)
  #     IngestionRecord.objects.create(
  #       ingestion_run=ingestion_run,
  #       api_name=f"Crawler - {self.titleized_name}",
  #       change_type=ChangeTypes.ERROR,
  #       change_log=f"Error: {traceback.format_exc()}, for event data: {event_data}",
  #       field_changed="event",
  #     )


