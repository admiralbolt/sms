import collections
import logging
import traceback
from datetime import datetime, timedelta
from typing import Optional

from api.constants import ChangeTypes, IngestionApis
from api.ingestion.crawlers.crawler import AbstractCrawler
from api.ingestion.event_apis.event_api import EventApi
from api.ingestion.import_mapping import API_PRIORITY_LIST, CRAWLER_MAPPING, EVENT_API_MAPPING
from api.models import JanitorRun, JanitorRecord, RawData
from api.utils import event_utils, venue_utils


logger = logging.getLogger(__name__)

class Janitor:
  """Clean some data!"""

  def __init__(self, run_name: str=""):
    self.janitor_run = JanitorRun.objects.create(name="Full" if not run_name else run_name)

  def process_api(self, api: EventApi, min_date: datetime):
    # Get a list of raw data objects to process:
    raw_datas = RawData.objects.filter(api_name=api.api_name, event_day__gt=min_date)
    venue_logs = collections.defaultdict(set)
    for raw_data in raw_datas:
      try:
        # Create / Update venue from the raw data.
        venue_kwargs = api.get_venue_kwargs(raw_data=raw_data.data)
        venue_change_type, venue_change_log, venue = venue_utils.create_or_update_venue(**venue_kwargs, api_name=api.api_name)
        change_tuple = (venue_change_log, venue)
        if change_tuple not in venue_logs[venue_change_type]:
          JanitorRecord.objects.create(
            janitor_run=self.janitor_run,
            api_name=api.api_name,
            raw_data=raw_data,
            change_type=venue_change_type,
            change_log=venue_change_log,
            field_changed="venue",
            venue=venue
          )
          venue_logs[venue_change_type].add(change_tuple)

        event_kwargs = api.get_event_kwargs(raw_data=raw_data.data)
        event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=venue, raw_data=raw_data, **event_kwargs, event_api=api.api_name)
        JanitorRecord.objects.create(
          janitor_run=self.janitor_run,
          api_name=api.api_name,
          raw_data=raw_data,
          change_type=event_change_type,
          change_log=event_change_log,
          field_changed="event",
          event=event
        )

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
      
  
  def process_crawler(self, crawler: AbstractCrawler, min_date: datetime):
    # Get a list of raw data objects to process:
    raw_datas = RawData.objects.filter(api_name=crawler.crawler_name, event_day__gt=min_date)
    for raw_data in raw_datas:
      try:
        event_kwargs = crawler.get_event_kwargs(raw_data=raw_data.data)
        event_change_type, event_change_log, event = event_utils.create_or_update_event(venue=crawler.venue, raw_data=raw_data, **event_kwargs, event_api=crawler.crawler_name)
        JanitorRecord.objects.create(
          janitor_run=self.janitor_run,
          api_name=crawler.crawler_name,
          raw_data=raw_data,
          change_type=event_change_type,
          change_log=event_change_log,
          field_changed="event",
          event=event
        )

      except Exception as e:
        logger.error("ERROR Processing Event for janitor_run: %s. Data: %s, Error: %s.", self.janitor_run, raw_data, e, exc_info=1)
        JanitorRecord.objects.create(
           janitor_run=self.janitor_run,
           api_name=crawler.crawler_name,
           raw_data=raw_data,
           change_type=ChangeTypes.ERROR,
           change_log=f"ERROR: {e}. Traceback: {traceback.format_exc()}",
           field_changed="none"
        )

  def run(self, min_date: Optional[datetime]):
    """CLEAN UP CLEAN UP EVERYBODY DO YOUR SHARE."""
    min_date = datetime.now() - timedelta(days=1) if not min_date else min_date
    for sub_list in API_PRIORITY_LIST:
      for ingestion_api in sub_list:
        if ingestion_api in EVENT_API_MAPPING:
          self.process_api(api=EVENT_API_MAPPING[ingestion_api], min_date=min_date)


