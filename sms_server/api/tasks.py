"""Schedulable / repeatable tasks for data gathering and processing."""

from celery import shared_task

from api.ingestion import axs, eventbrite, ticketmaster, tixr, venuepilot

@shared_task
def import_axs_data():
  """Import data from AXS api."""
  axs.import_data()

@shared_task
def import_eventbrite_data():
  """Import data from eventbrite api."""
  eventbrite.import_data()

@shared_task
def import_ticketmaster_data():
  """Import data from ticketmaster api."""
  ticketmaster.import_data()

@shared_task
def import_tixr_data():
  """Import data from TIXR api."""
  tixr.import_data()

@shared_task
def import_venuepilot_data(debug=False):
  """Import data from venuepilot api."""
  venuepilot.import_data(debug=debug)

@shared_task
def import_all():
  """Import data from ALL APIs."""
  import_axs_data()
  import_eventbrite_data()
  import_ticketmaster_data()
  import_tixr_data()
  import_venuepilot_data()
