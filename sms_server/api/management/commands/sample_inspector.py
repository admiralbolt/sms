from pprint import pprint

from django.core.management.base import BaseCommand

from api.constants import IngestionApis
from api.models import APISample

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--api", dest="api", required=True, help="Which API to import data from.")

  def handle(self, *args, **kwargs):
    api_name = IngestionApis.data.get(kwargs["api"].upper(), None)
    if not api_name:
      print(f"Couldn't find api {kwargs['api']}, valid values are: {IngestionApis.data.values()}")
      return
    
    # Get and print the latest sample of the corresponding type.
    samples = APISample.objects.filter(api_name=api_name).order_by("-created_at")
    if len(samples) == 0:
      print(f"Couldn't find any samples for api {kwargs['api']}.")
      return
    
    sample = samples.first()
    pprint(sample.data)
     
    
    
    
