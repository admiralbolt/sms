import logging
from abc import ABC, abstractmethod
from typing import Generator

from api.models import Venue

logger = logging.getLogger(__name__)

class EventApi(ABC):
  """Abstract api class."""
  api_name: str = ""
  venue_logs: dict = {}
  has_artists: bool = False
  has_venues: bool = True

  def __init__(self, api_name: str) -> object:
    self.api_name = api_name

  @abstractmethod
  def get_event_list(self) -> Generator[dict, None, None]:
    pass
  
  @abstractmethod
  def get_event_kwargs(self, raw_data: dict) -> dict:
    pass

  @abstractmethod
  def get_raw_data_info(self, raw_data: dict) -> dict:
    """Helper method to get extra info for raw data specifically."""
    return {}

  def get_venue_kwargs(self, raw_data: dict) -> dict:
    return {}

  def get_artists_kwargs(self, raw_data: dict) -> Generator[dict, None, None]:
    yield {}

  def get_venue(self) -> Venue:
    return None




