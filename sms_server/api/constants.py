"""Some things always change, but one thing stays the same, constants."""
# pylint: disable=invalid-name

class Choices:
  """Helper class for choices of things!"""

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
  BREWERY = "Brewery"
  COFFEE_SHOP = "Coffee Shop"
  EVENT_SPACE = "Event Space"
  SHOP = "Shop"

AUTOMATIC_APIS = [
  IngestionApis.AXS,
  IngestionApis.EVENTBRITE,
  IngestionApis.TICKETMASTER,
  IngestionApis.TIXR,
  IngestionApis.VENUEPILOT
]

def get_all(cls) -> list[str]:
  """Get a list of all options."""
  instance = cls()
  choices = []
  for attr in dir(instance):
    if not attr.isupper():
      continue

    val = getattr(instance, attr)
    choices.append(val)
  return choices

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