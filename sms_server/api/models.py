from django.db import models
from django_celery_beat.models import CrontabSchedule

class Venue(models.Model):
  """Places to go!"""
  name = models.CharField(max_length=128)
  latitude = models.DecimalField(max_digits=8, decimal_places=5)
  longitude = models.DecimalField(max_digits=8, decimal_places=5)
  address = models.CharField(max_length=256)

  # Optional.
  description = models.TextField(default="", blank=True, null=True)
  max_capacity = models.IntegerField(default=-1)

  # In general we don't want to delete data, we just want to hide it.
  exists = models.BooleanField(default=True)

  def __str__(self):
    return self.name


class Show(models.Model):
  """Shows to be had!"""
  venue = models.ForeignKey(Venue, on_delete=models.DO_NOTHING)
  # I think eventually this could get replaced by linking to artists
  # participating in the show, but for a rough draft this is good enough.
  title = models.CharField(max_length=256)
  show_day = models.DateField()
  start_time = models.TimeField()
  doors_open = models.TimeField(default=None, blank=True, null=True)
  ticket_price = models.DecimalField(max_digits=5, decimal_places=2)

  def __str__(self):
    return self.title


class OpenMic(models.Model):
  """Showcase yourself!"""
  venue = models.ForeignKey(Venue, on_delete=models.DO_NOTHING)
  # A lot of open mic nights are just venue name + open mic i.e.
  # Connor Byrne Open Mic, Hidden Door Open Mic. There are some exceptions like
  # Mojam, so we'll add an optional title field just in case.
  title = models.CharField(max_length=256, default="", blank=True, null=True)
  description = models.TextField()
  crontab_string = models.CharField(max_length=64)
  schedule = CrontabSchedule()

  def __str__(self):
    return self.title

ADMIN_MODELS = [
  OpenMic,
  Show,
  Venue
]