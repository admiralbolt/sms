"""Some things always change, but one thing stays the same, constants."""

class StringChoiceEnum:
  """Easier to use list of string options."""
  def __init__(self, choices: list[str]):
    self.data = {}
    for choice in choices:
      formatted_choice = choice.upper().replace(" ", "_")
      self.data[formatted_choice] = choice
      setattr(self, formatted_choice, choice)

  def get_choices(self):
    return [(value, value) for value in self.data.values()]


EventTypes = StringChoiceEnum(choices=[
  "Open Mic",
  "Show",
])

IngestionApis = StringChoiceEnum(choices=[
  "Ticketmaster",
  "Venuepilot",
  "Eventbrite",
  "TIXR",
  "AXS",
  "Crawler",
  "Open Mic Generator",
  "Manual",
])

OpenMicTypes = StringChoiceEnum(choices=[
  "All",
  "Comedy",
  "Music",
  "Spoken Word",
])

VenueTypes = StringChoiceEnum(choices=[
  "Bar",
  "Coffee Shop",
  "Event Space",
])

AUTOMATIC_APIS = [
  IngestionApis.AXS,
  IngestionApis.EVENTBRITE,
  IngestionApis.TICKETMASTER,
  IngestionApis.TIXR,
  IngestionApis.VENUEPILOT
]