from celery import shared_task

from api.ingestion import eventbrite, ticketmaster, venuepilot
  
@shared_task
def import_data():
  ticketmaster.import_data()

@shared_task
def import_venuepilot_data():
  venuepilot.import_data()

@shared_task
def import_eventbrite_data():
  eventbrite.import_data()