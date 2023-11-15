"""Some things always change, but one thing stays the same, constants."""
# pylint: disable=invalid-name

class EventTypes:
  OPEN_MIC = "Open Mic"
  SHOW = "Show"

class IngestionApis:
  AXS = "AXS"
  CRAWLER = "Crawler"
  EVENTBRITE = "Eventbrite"
  MANUAL = "Manual"
  OPEN_MIC_GENERATOR = "Open Mic Generator"
  TICKETMASTER = "Ticketmaster"
  TIXR = "TIXR"
  VENUEPILOT = "Venuepilot"

class OpenMicTypes:
  ALL = "All"
  COMEDY = "Comedy"
  MUSIC = "Music"
  SPOKEN_WORD = "Spoken Word"

class VenueTypes:
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