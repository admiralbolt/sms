import requests

from pprint import pprint
from bs4 import BeautifulSoup


def get_shows(venue_id="KovZpZA1kdIA"):
  r = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?venueId={venue_id}&apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ&size=200")
  data = r.json()

  events = data["_embedded"]["events"]

  title = events[0]["name"]
  show_day = events[0]["dates"]["start"]["localDate"]
  start_time = events[0]["dates"]["start"]["localTime"]
  ticket_price = events[0]["priceRanges"][0]["max"]


  print(title)
  print(show_day)
  print(start_time)
  print(ticket_price)


def get_venue_id(venue_name):
  r = requests.get(f"https://app.ticketmaster.com/discovery/v2/venues.json?keyword={venue_name}&apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ")
  data = r.json()
  venue = data["_embedded"]["venues"][0]
  print(venue["name"])
  print(venue["id"])
  print(venue["address"])

def get_venues():
  r = requests.get(f"https://app.ticketmaster.com/discovery/v2/venues.json?apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ&keyword=seattle&size=1&page=527")
  data = r.json()
  pprint(data)
  # for venue in data["_embedded"]["venues"]:
  #  pprint(venue)

def get_events():
  r = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?size=1&apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ")
  data = r.json()

  pprint(data)

# get_events()
#  get_shows()
# get_venues()
# get_events()

# r = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?size=100&apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ")
# data = r.json()

# genres = set()
# segments = set()
# subGenres = set()
# subTypes = set()
# t = set()

# for event in data["_embedded"]["events"]:
#   for attraction in event["_embedded"]["attractions"]:
#     for classification in attraction["classifications"]:
#       print(classification)
#       if "genre" in classification:
#         genres.add((classification["genre"]["id"], classification["genre"]["name"]))

#       if "segment" in classification:
#         segments.add((classification["segment"]["id"], classification["segment"]["name"]))

#       if "subGenre" in classification:
#         subGenres.add((classification["subGenre"]["id"], classification["subGenre"]["name"]))

#       if "subType" in classification:
#         subTypes.add((classification["subType"]["id"], classification["subType"]["name"]))

#       if "type" in classification:
#         t.add((classification["type"]["id"], classification["type"]["name"]))

# print("Genres")
# print(genres)
# print()

# print("Segments")
# print(segments)
# print()

# print("subGenres")
# print(subGenres)
# print()

# print("subTypes")
# print(subTypes)
# print()

# print("types")
# print(t)
# print()


# r = requests.get("https://app.ticketmaster.com/discovery/v2/classifications/genres/&apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ")
# print(r.json())



#####
######
## SEGMENTS
######
######

music_segment_id = "KZFzniwnSyZfZ7v7nJ"

r = requests.get("https://app.ticketmaster.com/discovery/v2/events?apikey=7elxdku9GGG5k8j0Xm8KWdANDgecHMV0&radius=10&unit=miles&segmentName=Music&geoPoint=c22zp")
data = r.json()
print(data["page"])
for event in data["_embedded"]["events"]:
  pprint(event["_embedded"]["venues"])
  break
