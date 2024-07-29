"""Schedulable / repeatable tasks for data gathering and processing."""
import datetime
import logging
from celery import shared_task

from api.ingestion.ingester import Ingester
from api.ingestion.carpenter import Carpenter
from api.ingestion.janitor import Janitor
from api.models import IngestionRun, OpenMic
from api.utils import open_mic_utils

logger = logging.getLogger(__name__)

@shared_task
def import_and_clean(debug: bool=False):
  """Import data from ALL APIs & Crawlers."""
  ingester = Ingester()
  ingester.import_data()
  carpenter = Carpenter()
  carpenter.run()
  janitor = Janitor()
  janitor.run()

@shared_task
def delete_old_ingestion_runs():
  """Delete old ingestion runs to save some space."""
  # Keep ingestion runs for 3 weeks by default.
  delete_threshold = datetime.datetime.now() - datetime.timedelta(days=18)
  for ingestion_run in IngestionRun.objects.filter(created_at__lte=delete_threshold):
    ingestion_run.delete()