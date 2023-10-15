"""Celery is good for you. Also used to schedule tasks."""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sms_server.settings")

app = Celery("sms_server")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
  """Debug task that doesn't do anything!"""
  print(f"Request: {self.request!r}")
