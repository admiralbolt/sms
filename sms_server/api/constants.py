"""Some things always change, but one thing stays the same, constants."""
# pylint: disable=invalid-name

class Choices:
  """Helper class for choices of things!"""

  def all(self) -> list[str]:
    """All choices!"""
    choices = []
    for attr in dir(self):
      if not attr.isupper():
        continue

      val = getattr(self, attr)
      choices.append(val)
    return choices

  def get_choices_for_db(self) -> list[tuple[str, str]]:
    """Get a list of choices for models.py based on the attrs of the input."""
    return [(val, val) for val in self.all()]

class EventTypes(Choices):
  OPEN_MIC = "Open Mic"
  OPEN_JAM = "Open Jam"
  SHOW = "Show"

class IngestionApis(Choices):
  AXS = "AXS"
  CRAWLER = "Crawler"
  EVENTBRITE = "Eventbrite"
  MANUAL = "Manual"
  OPEN_MIC_GENERATOR = "Open Mic Generator"
  TICKETMASTER = "Ticketmaster"
  TIXR = "TIXR"
  VENUEPILOT = "Venuepilot"

class OpenMicTypes(Choices):
  ALL = "All"
  COMEDY = "Comedy"
  MUSIC = "Music"
  SPOKEN_WORD = "Spoken Word"

class VenueTypes(Choices):
  BAR = "Bar"
  COFFEE_SHOP = "Coffee Shop"
  EVENT_SPACE = "Event Space"

AUTOMATIC_APIS = [
  IngestionApis.AXS,
  IngestionApis.EVENTBRITE,
  IngestionApis.TICKETMASTER,
  IngestionApis.TIXR,
  IngestionApis.VENUEPILOT
]

def get_choices(cls) -> list[tuple[str, str]]:
  """Get a list of choices for models.py based on the attrs of the input."""
  instance = cls()
  choices = []
  for attr in dir(instance):
    if not attr.isupper():
      continue

    val = getattr(instance, attr)
    choices.append((val, val))
  return choices