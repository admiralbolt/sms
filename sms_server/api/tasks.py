"""Schedulable / repeatable tasks for data gathering and processing."""

from celery import shared_task

from api.ingestion import eventbrite, ticketmaster, venuepilot

@shared_task
def import_ticketmaster_data():
  """Import data from ticketmaster api."""
  ticketmaster.import_data()

@shared_task
def import_venuepilot_data():
  """Import data from venuepilot api."""
  venuepilot.import_data()

@shared_task
def import_eventbrite_data():
  """Import data from eventbrite api."""
  eventbrite.import_data()
