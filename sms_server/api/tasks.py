from celery import shared_task

from api.ingestion import ticketmaster
  
@shared_task
def import_data():
  ticketmaster.import_data()