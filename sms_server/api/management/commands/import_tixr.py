from django.core.management.base import BaseCommand

from api.constants import IngestionApis
from api.models import Event
from api.tasks import import_tixr_data
from api.utils import venue_utils

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    parser.add_argument("--debug", dest="debug", action="store_true", default=False, help="Print out debug info.")

  def handle(self, *args, **kwargs):
    if kwargs["truncate"]:
      Event.objects.filter(event_api=IngestionApis.TIXR).delete()
      venue_utils.clear_api_data(api_name=IngestionApis.TIXR)

    import_tixr_data(debug=kwargs["debug"])
