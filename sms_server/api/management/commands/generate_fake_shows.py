import datetime
import random

from django.db import transaction
from django.core.management.base import BaseCommand
from faker import Faker

from api.models import Show, Venue


fake = Faker()

class Command(BaseCommand):

  def add_arguments(self, parser):
    parser.add_argument("--truncate", dest="truncate", action="store_true", default=False, help="Delete all Show data first.")
    
  @transaction.atomic
  def handle(self, *args, **kwargs):
    if kwargs["truncate"]:
      print("Clearing show data...")
      Show.objects.all().delete()

    # We generate a show each night within a date range for each venue.
    # We randomly select from a number of "artists" ahead of time.
    # Technically there shouldn't be overlap but I'm lazy.
    venues = Venue.objects.all()
    artists = [fake.name() for _ in range(300)]

    today = datetime.date.today()
    # We'll go 30 days in both directions, just cause.
    for x in range(60):
      show_date = today + datetime.timedelta(days=30) - datetime.timedelta(days=x)
      for venue in venues:
        start_time = datetime.time(hour=random.randint(19, 21), minute=random.choice([0, 15, 30, 45]))
        # 2 or 3 artists per show.
        show_title = ", ".join([random.choice(artists) for _ in range(random.randint(2, 3))])
        # Sometimes add doors!
        if random.randint(0, 100) < 40:
          Show.objects.create(venue=venue, title=show_title, show_day=show_date, start_time=start_time, ticket_price=random.randint(8, 15))
        else:
          doors_open = (datetime.datetime.combine(show_date, start_time) - datetime.timedelta(minutes=random.choice([30, 60]))).time()
          Show.objects.create(venue=venue, title=show_title, show_day=show_date, start_time=start_time, doors_open=doors_open, ticket_price=random.randint(8, 15))