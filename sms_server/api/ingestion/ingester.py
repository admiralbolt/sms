
from api.constants import ChangeTypes
from api.ingestion.crawlers.crawler import Crawler
from api.ingestion.event_apis.event_api import EventApi
from api.ingestion.import_mapping import CRAWLER_MAPPING, EVENT_API_MAPPING
from api.models import IngestionRecord, IngestionRun, RawData

class Ingester:
  """Load some data."""

  ingestion_apis: list[str]
  run_name: str

  def __init__(self, ingestion_apis: list[str]):
    self.ingestion_apis = ingestion_apis
    run_name = f"Ingestion Run - {', '.join(ingestion_apis)}"
    if all([api_name in ingestion_apis for api_name in EVENT_API_MAPPING.keys()] and [api_name in ingestion_apis for api_name in CRAWLER_MAPPING.keys()]):
      run_name = "Ingestion Run - All"
    self.run_name = run_name

  def import_from_crawler(self, crawler: Crawler):
    """Import data from a crawler."""
    for event_data in crawler.get_event_list():
      raw_data = RawData.objects.filter(api_name=crawler.crawler_name, event_api_id=event_data["event_api_id"]).first()
      change_type = ChangeTypes.SKIP
      if not raw_data:
        change_type = ChangeTypes.CREATE
        raw_data = RawData.objects.create(
          api_name=crawler.crawler_name,
          event_api_id=event_data["event_api_id"],
          event_name=event_data["event_name"],
          venue_name=crawler.venue.name,
          data=event_data
        )

      IngestionRecord.objects.create(
        ingestion_run=self.ingestion_run,
        api_name=crawler.crawler_name,
        change_type=change_type,
        raw_data=raw_data
      )

  def import_from_api(self, api: EventApi):
    """Import data from an event api."""
    for event_data in api.get_event_list():
      raw_event_info = api.get_raw_data_info(event_data)
      raw_data = RawData.objects.filter(api_name=api.api_name, event_api_id=raw_event_info["event_api_id"]).first()
      change_type = ChangeTypes.SKIP
      if not raw_data:
        change_type = ChangeTypes.CREATE
        raw_data = RawData.objects.create(
          api_name=api.api_name,
          event_api_id=raw_event_info["event_api_id"],
          event_name=raw_event_info["event_name"],
          venue_name=raw_event_info["venue_name"],
          data=event_data
        )

      IngestionRecord.objects.create(
        ingestion_run=self.ingestion_run,
        api_name=api.api_name,
        change_type=change_type,
        raw_data=raw_data
      )

  def import_data(self):
    self.ingestion_run = IngestionRun.objects.create(name=self.run_name)
    for api in self.ingestion_apis:
      if api in CRAWLER_MAPPING:
        self.import_from_crawler(CRAWLER_MAPPING[api])
      elif api in EVENT_API_MAPPING:
        self.import_from_api(EVENT_API_MAPPING[api])
