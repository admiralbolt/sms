from django.core.management.base import BaseCommand

from api.constants import AUTOMATIC_APIS, IngestionApis
from api.models import Event, IngestionRun
from api.tasks import import_all, import_api_data
from api.utils import venue_utils

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--api", dest="api", help="Which API to import data from.")
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    parser.add_argument("--debug", dest="debug", action="store_true", default=False, help="Print out debug info.")
    parser.add_argument("--all", dest="all", action="store_true", default=False, help="Import data from ALL available sources.")

  def handle(self, *args, **kwargs):
    if not kwargs["api"] and not kwargs["all"]:
      print("Please provide one of --api or --all")
      return

    if kwargs["all"]:
      if kwargs["truncate"]:
        result = input("Clearing ALL imported Venue, Event, and API data. Are you SURE? [Y/n]: ")
        if result == "Y":
          for api in AUTOMATIC_APIS:
            Event.objects.filter(event_api=api).delete()
            venue_utils.clear_api_data(api_name=api)
        return
      import_all(debug=kwargs["debug"])
      return

    api_name = getattr(IngestionApis, kwargs["api"].upper(), None)
    if not api_name:
      print(f"Couldn't find api {kwargs['api']}, valid values are: {AUTOMATIC_APIS}")
      return
    
    if kwargs["truncate"]:
      Event.objects.filter(event_api=api_name).delete()
      venue_utils.clear_api_data(api_name=api_name)
      return

    ingestion_run = IngestionRun.objects.create(name=f"Manual Run {api_name}")
    import_api_data(api_name, debug=kwargs["debug"], ingestion_run=ingestion_run)
    ingestion_run.aggregate_results()
    
