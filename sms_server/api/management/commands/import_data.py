from django.core.management.base import BaseCommand

from api.ingestion.import_mapping import EVENT_API_MAPPING, CRAWLER_NICE_NAMES
from api.ingestion.ingester import Ingester
from api.tasks import import_all

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--api", dest="api", help="Which API / crawler to import data from.")
    parser.add_argument("--all", dest="all", action="store_true", default=False, help="Import data from ALL available sources.")

  def handle(self, *args, **kwargs):
    if not kwargs["api"] and not kwargs["all"]:
      print("Please provide one of --api, --crawler, or --all")
      return

    if kwargs["all"]:
      import_all()
      return
    
    if kwargs["api"] not in EVENT_API_MAPPING and kwargs["api"] not in CRAWLER_NICE_NAMES:
      print(f"Specified api '{kwargs['api']}' does not exist. Here are correct values:")
      print(f"Apis: {sorted(EVENT_API_MAPPING.keys())}")
      print(f"Crawlers: {sorted(CRAWLER_NICE_NAMES.keys())}")
      return
    
    api = CRAWLER_NICE_NAMES.get(kwargs["api"], kwargs["api"])
    ingester = Ingester(ingestion_apis=[api])
    ingester.import_data()