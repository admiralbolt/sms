from django.core.management.base import BaseCommand

from api.ingestion.import_mapping import EVENT_API_MAPPING, CRAWLER_NICE_NAMES
from api.ingestion.janitor import Janitor

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--api", dest="api", help="Which API / crawler to import data from.")
    parser.add_argument("--min_date", dest="min_date", default=None, help="Min Date.")

  def handle(self, *args, **kwargs):
    if not kwargs["api"]:
      janitor = Janitor(run_name="Manual")
      janitor.run(min_date=kwargs["min_date"])
      return
    
    if kwargs["api"] not in EVENT_API_MAPPING and kwargs["api"] not in CRAWLER_NICE_NAMES:
      print(f"Specified api '{kwargs['api']}' does not exist. Here are correct values:")
      print(f"Apis: {sorted(EVENT_API_MAPPING.keys())}")
      print(f"Crawlers: {sorted(CRAWLER_NICE_NAMES.keys())}")
      return
    
    api = CRAWLER_NICE_NAMES.get(kwargs["api"], kwargs["api"])
    janitor = Janitor(ingestion_apis=[api])
    janitor.run(min_date=kwargs["min_date"])