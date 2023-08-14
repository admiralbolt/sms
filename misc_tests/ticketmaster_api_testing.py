import requests

from pprint import pprint
from bs4 import BeautifulSoup

r = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?venueId=KovZpap2ne&apikey=G7nAGscAGpk1nNNXR0IN5NJvg5KGcgEQ&size=200")
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