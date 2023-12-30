from django.core.management.base import BaseCommand

from api.tasks import write_latest_data

class Command(BaseCommand):

  def handle(self, *args, **kwargs):
    write_latest_data()
    
