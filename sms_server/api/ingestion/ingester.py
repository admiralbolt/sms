import datetime
import logging
import time
from typing import Optional

from api.constants import ChangeTypes
from api.ingestion.event_apis.event_api import EventApi
from api.ingestion.import_mapping import API_MAPPING
from api.models import IngestionRecord, IngestionRun
from api.utils import raw_data_utils

logger = logging.getLogger(__name__)


class Ingester:
  """Load some data."""

  ingestion_apis: list[str]
  run_name: str

  def __init__(self, ingestion_apis: Optional[list[str]] = None):
    if not ingestion_apis:
      self.ingestion_apis = list(API_MAPPING.keys())
      self.run_name = "Ingestion Run - All"
    else:
      self.ingestion_apis = ingestion_apis
      self.run_name = f"Ingestion Run - {', '.join(ingestion_apis)}"

  def import_from_api(self, api: EventApi):
    """Import data from an event api."""
    for event_data in api.get_event_list():
      raw_event_info = api.get_raw_data_info(event_data)
      try:
        change_type, change_log, raw_data = raw_data_utils.create_or_update_raw_data(
          api_name=api.api_name,
          event_api_id=raw_event_info["event_api_id"],
          event_name=raw_event_info["event_name"],
          venue_name=raw_event_info["venue_name"],
          event_day=raw_event_info["event_day"],
          data=event_data,
        )

        IngestionRecord.objects.create(
          ingestion_run=self.ingestion_run, api_name=api.api_name, change_type=change_type, change_log=change_log, raw_data=raw_data
        )

        logger.info("[Ingester] API=%s, event_name=%s", api.api_name, raw_data.event_name)
      except Exception:
        IngestionRecord.objects.create(
          ingestion_run=self.ingestion_run,
          api_name=api.api_name,
          change_type=ChangeTypes.ERROR,
          change_log=f"Error importing data: {event_data}",
        )

  def import_data(self):
    self.ingestion_run = IngestionRun.objects.create(name=self.run_name)
    metadata = {}
    for api in self.ingestion_apis:
      metadata[api] = {"start_time": time.time()}
      try:
        self.import_from_api(API_MAPPING[api])
      except Exception as e:
        print(f"Error importing from api {api}, error: {e}")
        print(e)
        logger.error("Error importing from api %s, error: %s.", api, e, exc_info=1)
      metadata[api]["end_time"] = time.time()
      metadata[api]["elapsed_time"] = metadata[api]["end_time"] - metadata[api]["start_time"]
      # Because we've been timing out here, we're going to save our extra
      # metadata each time we complete an api.
      self.ingestion_run.metadata = metadata
      self.ingestion_run.save()
    self.ingestion_run.finished_at = datetime.datetime.now()
    self.ingestion_run.save()
