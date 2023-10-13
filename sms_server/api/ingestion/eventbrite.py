"""Eventbrite integration.

Eventbrite doesn't let people search for events via the API anymore, but we can
pull detailed information about an event without the need to scrape IF we can
get an event ID.

So the plan is to scrape the search page on the webstie to get a list of events
which we can then pull information about.

Want to scrape these types of URLs:
https://www.eventbrite.com/d/wa--seattle/music--performances/?page=1

Then pass the parsed event ids into an api call like:
https://www.eventbriteapi.com/v3/events/{event_id}/?expand=ticket_classes,venue,category

Don't forget we need to include the `Authorization: Bearer {token}` header.
"""
import json
import requests

from pprint import pprint
from sms_server import settings


def test_request():
  return f"curl -X GET 'https://www.eventbriteapi.com/v3/events/705658071287/?expand=ticket_classes,venue,category' -H 'Authorization: Bearer {settings.EVENTBRITE_TOKEN}'" 


# Looks like the data returned from the backend search call is dumped into
# javascript into a `__SERVER_DATA__` variable. There's a line like this
# `window.__SERVER_DATA__ = {...}`
# We can can grab this line, parse the JSON, and be off to the races.
def event_request(page: int=1):
  # As it turns out eventbrite has some protections in place to prevent
  # exactly what I'm attempting to do. Unfortunately for them, their protections
  # are dumb. We can bypass stuff by just spoofing a user-agent seems like.
  # Just copying my user agent from Chrome seems to work fine amusingly.
  headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  }
  r = requests.get(f"https://www.eventbrite.com/d/wa--seattle/music--events/?page={page}", headers=headers)
  if r.status_code != 200:
    print(r.status_code)
    print(r.text)

  for line in r.text.split("\n"):
    s = line.strip()
    if not s.startswith("window.__SERVER_DATA__"):
      continue

    # The line ends with a semicolon since it's javascript.
    data = json.loads(s[len("window.__SERVER_DATA__ = "):-1])
    return data
  return {}


def import_data():
  data = event_request(page=1)
  pprint(data)

    