from abc import ABC, abstractmethod
import logging

from api.constants import IngestionApis
from api.models import IngestionRecord, IngestionRun, Venue, VenueApi
from api.utils import event_utils

logger = logging.getLogger(__name__)

class Crawler(ABC):
  """Abstract crawler class."""
  crawler_name: str = ""
  venue_name_regex: str = ""
  venue: Venue

  def __init__(self, crawler_name: str, venue_name_regex: str) -> object:
    self.crawler_name = crawler_name
    self.titleized_name = crawler_name.replace("_", " ").title()
    self.venue_name_regex = venue_name_regex
    self._load_venue()

  @abstractmethod
  def get_event_kwargs(self, event_data: dict) -> dict:
    """Get kwargs necessary for creating or updating an event based on raw data."""
    pass

  @abstractmethod
  def import_data(self, ingestion_run: IngestionRun, debug: bool=False) -> None:
    """Import data from the crawler! Must be overidden."""
    pass

  def _load_venue(self):
    """Loads the proper venue information for the crawler.

    This is done by checking the venue api objects for an entry with a matching
    crawler name. If one doesn't exist, we attempt to create one matching to
    an existing venue based on the regex name.
    """
    # Check to see if a VenueApi object already exists for this crawler.
    apis = VenueApi.objects.filter(api_name=IngestionApis.CRAWLER, crawler_name=self.crawler_name)
    if apis.exists():
      self.venue = apis.first().venue
      return
    
    # Look for venues that match the name regex. We only proceed if a single
    # venue matches.
    venues = Venue.objects.filter(name__iregex=self.venue_name_regex)
    if len(venues) != 1:
      return
    
    VenueApi.objects.create(
      venue=venues.first(),
      api_name=IngestionApis.CRAWLER,
      crawler_name=self.crawler_name
    )
    self.venue = venues.first()

  def process_event(self, ingestion_run: IngestionRun, event_data: dict, debug: bool = False) -> None:
    """Process one event!"""
    try:
      event_kwargs = self.get_event_kwargs(event_data=event_data)
      event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=self.venue, **event_kwargs, event_api=IngestionApis.CRAWLER, debug=debug)
      IngestionRecord.objects.create(
        ingestion_run=ingestion_run,
        api_name=f"Crawler - {self.titleized_name}",
        change_type=event_change_type,
        change_log=event_change_log,
        field_changed="event",
        event=event
      )
    except Exception as e:
      logger.error("ERROR Processing Event for ingestion_run: %s. Data: %s, Error: %s.", ingestion_run, event_data, e, exc_info=1)


