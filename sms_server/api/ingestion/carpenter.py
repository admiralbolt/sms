import collections
import logging
import traceback
from datetime import datetime, timedelta
from typing import Optional

from api.constants import ChangeTypes, IngestionApis
from api.ingestion.event_apis.event_api import EventApi
from api.ingestion.import_mapping import API_MAPPING, API_PRIORITY_LIST
from api.models import Artist, Event, CarpenterRun, CarpenterRecord, OpenMic, RawData, Venue
from api.utils import artist_utils, event_utils, open_mic_utils, venue_utils

logger = logging.getLogger(__name__)

class Carpenter:
  """Clean some data!"""

  def __init__(self, ingestion_apis: Optional[list[str]]=None, min_date: Optional[datetime]=None, process_all: bool=False):
    self.ingestion_apis = ingestion_apis
    self.min_date = datetime.now() - timedelta(days=1) if not min_date else min_date
    self.process_all = process_all

    run_name = "Carpenter Run "
    if not ingestion_apis:
      run_name += "- All Apis "
    else:
      run_name += f"- {', '.join(ingestion_apis)}"

    run_name += f"- {min_date} "
    run_name += f"- {process_all=}"

    self.carpenter_run = CarpenterRun.objects.create(name=run_name)
    self.venue_logs = collections.defaultdict(lambda: collections.defaultdict(set))
    self.artist_logs = collections.defaultdict(lambda: collections.defaultdict(set))

  def get_or_create_venue(self, raw_data: RawData, api: EventApi) -> Venue:
    if not api.has_venues:
      return api.get_venue()
    
    venue_kwargs = api.get_venue_kwargs(raw_data=raw_data.data)
    venue_change_type, venue_change_log, venue = venue_utils.get_or_create_venue(**venue_kwargs)
    change_tuple = (venue_change_log, venue)
    if change_tuple not in self.venue_logs[api.api_name][venue_change_type]:
      CarpenterRecord.objects.create(
        carpenter_run=self.carpenter_run,
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
        CarpenterRecord.objects.create(
          carpenter_run=self.carpenter_run,
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
    should_skip, skip_log = api.should_skip(raw_data=raw_data.data)
    if should_skip:
      CarpenterRecord.objects.create(
        carpenter_run=self.carpenter_run,
        api_name=api.api_name,
        raw_data=raw_data,
        change_type=ChangeTypes.SKIP,
        change_log=skip_log,
        field_changed="none",
      )
      return None

    event_kwargs = api.get_event_kwargs(raw_data=raw_data.data)
    event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=venue, raw_data=raw_data, artists=artists, **event_kwargs, event_api=api.api_name)
    CarpenterRecord.objects.create(
      carpenter_run=self.carpenter_run,
      api_name=api.api_name,
      raw_data=raw_data,
      change_type=event_change_type,
      change_log=event_change_log,
      field_changed="event",
      event=event
    )
    return event

  def process_api(self, api: EventApi):
    """Process all raw data past min_date for a particular api.

    We iterate through each raw data record and =>
      1) Create or update the venue associated with that record.
      2) Create or update the artists associated with that record.
      3) Create or update the event associated with that record.
    """
    raw_datas = RawData.objects.filter(api_name=api.api_name, event_day__gt=self.min_date)
    if not self.process_all:
      raw_datas = raw_datas.filter(processed=False)

    for raw_data in raw_datas:
      try:
        venue = self.get_or_create_venue(raw_data=raw_data, api=api)
        artists = self.get_or_create_artists(raw_data=raw_data, api=api)
        _ = self.get_or_create_event(raw_data=raw_data, api=api, venue=venue, artists=artists)
        raw_data.processed = True
        raw_data.save()

      except Exception as e:
        logger.error("ERROR Processing Event for carpenter_run: %s. Data: %s, Error: %s.", self.carpenter_run, raw_data, e, exc_info=1)
        CarpenterRecord.objects.create(
           carpenter_run=self.carpenter_run,
           api_name=api.api_name,
           raw_data=raw_data,
           change_type=ChangeTypes.ERROR,
           change_log=f"ERROR: {e}. Traceback: {traceback.format_exc()}",
           field_changed="none"
        )

  def generate_open_mic_events(self, max_diff: timedelta=timedelta(days=30)):
    """Generate events for open mics!"""
    for mic in OpenMic.objects.all():
      # Only want to generate events for open mics that have a venue attached.
      if not mic.venue:
        continue

      # Make sure we only generate events for mics that have the generate events
      # flag set.
      if not mic.generate_events:
        continue

      for change_type, change_log, event in open_mic_utils.generate_open_mic_events(mic, max_diff=max_diff):
        CarpenterRecord.objects.create(
          carpenter_run=self.carpenter_run,
          api_name=IngestionApis.OPEN_MIC_GENERATOR,
          open_mic=mic,
          change_type=change_type,
          change_log=change_log,
          field_changed="event",
          event=event,
        )

  def run(self):
    """BUILD SOME SHIT."""
    if self.ingestion_apis:
      for ingestion_api in self.ingestion_apis:
        self.process_api(api=API_MAPPING[ingestion_api])
        return

    for ingestion_api in API_PRIORITY_LIST:
      # Skip manual.
      if ingestion_api == IngestionApis.MANUAL:
        continue

      self.process_api(api=API_MAPPING[ingestion_api])

    self.generate_open_mic_events()

    self.carpenter_run.finished_at = datetime.now()
    self.carpenter_run.save()