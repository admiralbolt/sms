from django.core.management.base import BaseCommand

from api.models import Event, Venue

class Command(BaseCommand):
  def handle(self, *args, **kwargs):
    result = input("Clearing ALL imported Venue, Event, and API data. Are you SURE? [Y/n]: ")
    if result == "Y":
      Event.objects.all().delete()
      Venue.objects.all().delete()

    
