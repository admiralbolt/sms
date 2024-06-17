

from api.models import JanitorRun, JanitorRecord

class Janitor:
  """Clean some data!"""

  def __init__(self, run_name: str):
    self.janitor_run = JanitorRun.objects.create(name=run_name)


  
