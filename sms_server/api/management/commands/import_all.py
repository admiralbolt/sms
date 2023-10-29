from django.core.management.base import BaseCommand

from api.constants import AUTOMATIC_APIS
from api.models import Event
from api.tasks import import_all
from api.utils import venue_utils

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    parser.add_argument("--debug", dest="debug", action="store_true", default=False, help="Print out debug info.")

  def handle(self, *args, **kwargs):
    if kwargs["truncate"]:
      result = input("Clearing ALL imported Venue, Event, and API data. Are you SURE? [Y/n]: ")
      if result == "Y":
        for api in AUTOMATIC_APIS:
          Event.objects.filter(event_api=api).delete()
          venue_utils.clear_api_data(api_name=api)

    import_all(debug=kwargs["debug"])
