"""Schedulable / repeatable tasks for data gathering and processing."""

from celery import shared_task

from api.ingestion import axs, eventbrite, ticketmaster, tixr, venuepilot

@shared_task
def import_axs_data(debug=False):
  """Import data from AXS api."""
  axs.import_data(debug=debug)

@shared_task
def import_eventbrite_data(debug=False):
  """Import data from eventbrite api."""
  eventbrite.import_data(debug=debug)

@shared_task
def import_ticketmaster_data(debug=False):
  """Import data from ticketmaster api."""
  ticketmaster.import_data(debug=debug)

@shared_task
def import_tixr_data(debug=False):
  """Import data from TIXR api."""
  tixr.import_data(debug=debug)

@shared_task
def import_venuepilot_data(debug=False):
  """Import data from venuepilot api."""
  venuepilot.import_data(debug=debug)

@shared_task
def import_all(debug=False):
  """Import data from ALL APIs."""
  import_axs_data(debug=debug)
  import_eventbrite_data(debug=debug)
  import_ticketmaster_data(debug=debug)
  import_tixr_data(debug=debug)
  import_venuepilot_data(debug=debug)
