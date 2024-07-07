from django.core.management.base import BaseCommand

from api.ingestion.import_mapping import EVENT_API_MAPPING, CRAWLER_NICE_NAMES
from api.ingestion.ingester import Ingester

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--api", dest="api", help="Which API / crawler to import data from.")

  def handle(self, *args, **kwargs):
    if not kwargs["api"]:
      ingester = Ingester()
      ingester.import_data()
      return
    
    if kwargs["api"] not in EVENT_API_MAPPING and kwargs["api"] not in CRAWLER_NICE_NAMES:
      print(f"Specified api '{kwargs['api']}' does not exist. Here are correct values:")
      print(f"Apis: {sorted(EVENT_API_MAPPING.keys())}")
      print(f"Crawlers: {sorted(CRAWLER_NICE_NAMES.keys())}")
      return
    
    api = CRAWLER_NICE_NAMES.get(kwargs["api"], kwargs["api"])
    ingester = Ingester(ingestion_apis=[api])
    ingester.import_data()