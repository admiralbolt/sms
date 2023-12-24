from django.core.management.base import BaseCommand

from api.ingestion import venuepilot

class Command(BaseCommand):

  def handle(self, *args, **kwargs):
    venuepilot.debug()