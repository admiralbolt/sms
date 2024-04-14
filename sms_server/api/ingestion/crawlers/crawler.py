from abc import ABC, abstractmethod
import logging

from api.constants import IngestionApis
from api.models import IngestionRecord, IngestionRun, Venue
from api.utils import event_utils

logger = logging.getLogger(__name__)

class Crawler(ABC):
  """Abstract crawler class."""
  api_name: str = ""

  def __init__(self, crawler_name: str) -> object:
    self.api_name = f"Crawler - {crawler_name}"

  @abstractmethod
  def get_event_kwargs(self, event_data: dict) -> dict:
    """Get kwargs necessary for creating or updating an event based on raw data."""
    pass

  @abstractmethod
  def import_data(self, ingestion_run: IngestionRun, venue: Venue, debug: bool=False) -> None:
    """Import data from the crawler! Must be overidden."""
    pass

  def process_event(self, ingestion_run: IngestionRun, venue: Venue, event_data: dict, debug: bool = False) -> None:
    """Process one event!"""
    try:
      event_kwargs = self.get_event_kwargs(event_data=event_data)
      event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=venue, **event_kwargs, event_api=IngestionApis.CRAWLER, debug=debug)
      IngestionRecord.objects.create(
        ingestion_run=ingestion_run,
        api_name=self.api_name,
        change_type=event_change_type,
        change_log=event_change_log,
        field_changed="event",
        event=event
      )
    except Exception as e:
      logger.error("ERROR Processing Event for ingestion_run: %s. Data: %s, Error: %s.", ingestion_run, event_data, e, exc_info=1)


