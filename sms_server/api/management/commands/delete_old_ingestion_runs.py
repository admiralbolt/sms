from django.core.management.base import BaseCommand

from api.tasks import delete_old_ingestion_runs

class Command(BaseCommand):
  """Command for running delete old ingestion runs task.
  """

  def handle(self, *args, **kwargs):
    delete_old_ingestion_runs()
    
