from datetime import datetime, timedelta
from typing import Optional

from api.ingestion.import_mapping import API_PRIORITY_LIST
from api.models import JanitorRun, JanitorRecord



class Janitor:
  """Clean some data!"""

  def __init__(self, run_name: str=""):
    self.janitor_run = JanitorRun.objects.create(name="Full" if not run_name else run_name)

  def run(self, min_date: Optional[datetime]):
    min_date = datetime.now() - timedelta(days=1) if not min_date else min_date

