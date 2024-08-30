from django.core.management.base import BaseCommand

from api.ingestion.janitor import Janitor


class Command(BaseCommand):
  def add_arguments(self, parser):
    parser.add_argument("--operation", dest="operations", nargs="+", default=None, help="Operations to perform.")
    parser.add_argument("--min_date", dest="min_date", default=None, help="Min Date.")
    parser.add_argument(
      "--process_all", dest="process_all", default=False, action="store_true", help="Re-process already processed raw datas."
    )

  def handle(self, *args, **kwargs):
    janitor = Janitor(operations=kwargs["operations"], min_date=kwargs["min_date"], process_all=kwargs["process_all"])
    janitor.run()
