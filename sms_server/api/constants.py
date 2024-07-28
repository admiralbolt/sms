"""Some things always change, but one thing stays the same, constants."""
# pylint: disable=invalid-name,missing-class-docstring

class ChangeTypes:
  CREATE = "Create"
  DELETE = "Delete"
  ERROR = "Error"
  NOOP = "NO OP"
  SKIP = "Skip"
  UPDATE = "Update"

class JanitorOperations:
  APPLY_ARTISTS = "Apply Artists"
  MERGE_EVENTS = "Merge Events"

class EventTypes:
  OPEN_MIC = "Open Mic"
  OPEN_JAM = "Open Jam"
  SHOW = "Show"

class IngestionApis:
  AXS = "AXS"
  BANDSINTOWN = "Bandsintown"
  CRAWLER_BLUE_MOON = "Crawler - Blue Moon"
  CRAWLER_DARRELLS_TAVERN = "Crawler - Darrell's Tavern"
  CRAWLER_LITTLE_RED_HEN = "Crawler - Little Red Hen"
  CRAWLER_SEA_MONSTER_LOUNGE = "Crawler - Sea Monster Lounge"
  CRAWLER_SKYLARK = "Crawler - Skylark"
  CRAWLER_THE_ROYAL_ROOM = "Crawler - The Royal Room"
  DICE = "Dice"
  EVENTBRITE = "Eventbrite"
  MANUAL = "Manual"
  OPEN_MIC_GENERATOR = "Open Mic Generator"
  SONGKICK = "Songkick"
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
  BREWERY = "Brewery"
  COFFEE_SHOP = "Coffee Shop"
  EVENT_SPACE = "Event Space"
  SHOP = "Shop"

class Neighborhoods:
  BALLARD = "Ballard"
  BELLTOWN = "Belltown"
  CAPITOL_HILL = "Capitol Hill"
  DOWNTOWN = "Downtown"
  FREMONT = "Fremont"
  GREENLAKE = "Greenlake"
  MAGNOLIA = "Magnolia"
  PHINNEY_RIDGE = "Phinney Ridge"
  QUEEN_ANNE = "Queen Anne"
  UNIVERSITY_DISTRICT = "University District"
  WEST_SEATTLE = "West Seattle"

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