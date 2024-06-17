import collections
import logging
from abc import ABC, abstractmethod
from typing import Any, Generator

from api.models import IngestionRecord, IngestionRun
from api.utils import event_utils, venue_utils

logger = logging.getLogger(__name__)

class EventApi(ABC):
  """Abstract api class."""

  api_name: str = ""
  venue_logs: dict = {}

  def __init__(self, api_name: str) -> object:
    self.api_name = api_name
    self.venue_logs = collections.defaultdict(set)

  @abstractmethod
  def get_venue_kwargs(self, raw_data: dict) -> dict:
    pass

  @abstractmethod
  def get_event_kwargs(self, raw_data: dict) -> dict:
    pass

  @abstractmethod
  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    pass

  @abstractmethod
  def get_raw_data_info(self, raw_data: dict) -> dict:
    """Helper method to get extra info for raw data specifically."""
    pass

  @abstractmethod
  def get_event_list(self) -> Generator[dict, None, None]:
    pass

  def process_event(self, ingestion_run: IngestionRun, event_data: dict, debug: bool=False) -> None:
    """Process a single event."""
    try:
      venue_kwargs = self.get_venue_kwargs(event_data=event_data)
      venue_change_type, venue_change_log, venue = venue_utils.create_or_update_venue(**venue_kwargs, api_name=self.api_name, debug=debug)
      change_tuple = (venue_change_log, venue)
      if change_tuple not in self.venue_logs[venue_change_type]:
        IngestionRecord.objects.create(
          ingestion_run=ingestion_run,
          api_name=self.api_name,
          change_type=venue_change_type,
          change_log=venue_change_log,
          field_changed="venue",
          venue=venue
        )
        self.venue_logs[venue_change_type].add(change_tuple)

      event_kwargs = self.get_event_kwargs(event_data=event_data)
      event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=venue, **event_kwargs, event_api=self.api_name, debug=debug)
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
