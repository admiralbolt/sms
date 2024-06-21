import collections
import logging
import traceback
from datetime import datetime, timedelta
from typing import Optional

from api.constants import ChangeTypes, IngestionApis
from api.ingestion.event_apis.event_api import EventApi
from api.ingestion.import_mapping import API_MAPPING, API_PRIORITY_LIST
from api.models import Artist, Event, JanitorRun, JanitorRecord, RawData, Venue
from api.utils import artist_utils, event_utils, venue_utils

logger = logging.getLogger(__name__)

class Janitor:
  """Clean some data!"""

  def __init__(self, ingestion_apis: Optional[list[str]] = None, run_name: str=""):
    self.ingestion_apis = ingestion_apis
    self.janitor_run = JanitorRun.objects.create(name="Full" if not run_name else run_name)
    self.venue_logs = collections.defaultdict(lambda: collections.defaultdict(set))
    self.artist_logs = collections.defaultdict(lambda: collections.defaultdict(set))

  def get_or_create_venue(self, raw_data: RawData, api: EventApi) -> Venue:
    if not api.has_venues:
      return api.get_venue()
    
    venue_kwargs = api.get_venue_kwargs(raw_data=raw_data.data)
    venue_change_type, venue_change_log, venue = venue_utils.create_or_update_venue(**venue_kwargs, api_name=api.api_name)
    change_tuple = (venue_change_log, venue)
    if change_tuple not in self.venue_logs[api.api_name][venue_change_type]:
      JanitorRecord.objects.create(
        janitor_run=self.janitor_run,
        api_name=api.api_name,
        raw_data=raw_data,
        change_type=venue_change_type,
        change_log=venue_change_log,
        field_changed="venue",
        venue=venue
      )
      self.venue_logs[api.api_name][venue_change_type].add(change_tuple)
    return venue
    
  def get_or_create_artists(self, raw_data: RawData, api: EventApi) -> list[Artist]:
    if not api.has_artists:
      return []
    
    artists = []
    for artist_kwargs in api.get_artists_kwargs(raw_data=raw_data.data):
      artist_change_type, artist_change_log, artist = artist_utils.create_or_update_artist(**artist_kwargs, api_name=api.api_name)
      artists.append(artist)
      change_tuple = (artist_change_log, artist)
      if change_tuple not in self.artist_logs[api.api_name][artist_change_type]:
        JanitorRecord.objects.create(
          janitor_run=self.janitor_run,
          api_name=api.api_name,
          raw_data=raw_data,
          change_type=artist_change_type,
          change_log=artist_change_log,
          field_changed="artist",
          artist=artist
        )
        self.artist_logs[api.api_name][artist_change_type].add(change_tuple)
    
    return artists
  
  def get_or_create_event(self, raw_data: RawData, api: EventApi, venue: Venue, artists: list[Artist]) -> Event:
    event_kwargs = api.get_event_kwargs(raw_data=raw_data.data)
    event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=venue, raw_data=raw_data, artists=artists, **event_kwargs, event_api=api.api_name)
    JanitorRecord.objects.create(
      janitor_run=self.janitor_run,
      api_name=api.api_name,
      raw_data=raw_data,
      change_type=event_change_type,
      change_log=event_change_log,
      field_changed="event",
      event=event
    )
    return event

  def process_api(self, api: EventApi, min_date: datetime):
    # Get a list of raw data objects to process:
    raw_datas = RawData.objects.filter(api_name=api.api_name, event_day__gt=min_date)

    for raw_data in raw_datas:
      try:
        venue = self.get_or_create_venue(raw_data=raw_data, api=api)
        artists = self.get_or_create_artists(raw_data=raw_data, api=api)
        _ = self.get_or_create_event(raw_data=raw_data, api=api, venue=venue, artists=artists)

      except Exception as e:
        logger.error("ERROR Processing Event for janitor_run: %s. Data: %s, Error: %s.", self.janitor_run, raw_data, e, exc_info=1)
        JanitorRecord.objects.create(
           janitor_run=self.janitor_run,
           api_name=api.api_name,
           raw_data=raw_data,
           change_type=ChangeTypes.ERROR,
           change_log=f"ERROR: {e}. Traceback: {traceback.format_exc()}",
           field_changed="none"
        )

  def run(self, min_date: Optional[datetime]):
    """CLEAN UP CLEAN UP EVERYBODY DO YOUR SHARE."""
    min_date = datetime.now() - timedelta(days=1) if not min_date else min_date
    if self.ingestion_apis:
      for ingestion_api in self.ingestion_apis:
        self.process_api(api=API_MAPPING[ingestion_api], min_date=min_date)
        return

    for sub_list in API_PRIORITY_LIST:
      for ingestion_api in sub_list:
        # Skip manual ones.
        if ingestion_api == IngestionApis.MANUAL:
          continue

        self.process_api(api=API_MAPPING[ingestion_api], min_date=min_date)
