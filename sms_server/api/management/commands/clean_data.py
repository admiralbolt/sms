from django.core.management.base import BaseCommand

from api.ingestion.janitor import Janitor

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--min_date", dest="min_date", default=None, help="Min Date.")

  def handle(self, *args, **kwargs):
    janitor = Janitor(run_name="Manual")
    janitor.run(min_date=kwargs["min_date"])