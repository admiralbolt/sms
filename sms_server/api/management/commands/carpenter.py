from django.core.management.base import BaseCommand

from api.ingestion.carpenter import Carpenter
from api.ingestion.import_mapping import EVENT_API_MAPPING, CRAWLER_NICE_NAMES

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--api", dest="api", help="Which API / crawler to import data from.")
    parser.add_argument("--min_date", dest="min_date", default=None, help="Min Date.")
    parser.add_argument("--process_all", dest="process_all", default=False, action="store_true", help="Re-process already processed raw datas.")

  def handle(self, *args, **kwargs):
    if not kwargs["api"]:
      carpenter = Carpenter(run_name="Manual")
      carpenter.run(min_date=kwargs["min_date"], process_all=kwargs["process_all"])
      return
    
    if kwargs["api"] not in EVENT_API_MAPPING and kwargs["api"] not in CRAWLER_NICE_NAMES:
      print(f"Specified api '{kwargs['api']}' does not exist. Here are correct values:")
      print(f"Apis: {sorted(EVENT_API_MAPPING.keys())}")
      print(f"Crawlers: {sorted(CRAWLER_NICE_NAMES.keys())}")
      return
    
    api = CRAWLER_NICE_NAMES.get(kwargs["api"], kwargs["api"])
    carpenter = Carpenter(ingestion_apis=[api])
    carpenter.run(min_date=kwargs["min_date"], process_all=kwargs["process_all"])