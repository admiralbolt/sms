"""Crawler for skylark.

As of 2023-11-04,
Entry point: https://www.skylarkcafe.com/calendar
Upcoming shows are contained within divs emulating list items.
Very sparse information about the shows themselves, but it's a start.
"""
import requests

from bs4 import BeautifulSoup

def crawl(debug: bool=False):
  print("GETING HERE")
  skylark_request = requests.get("https://www.skylarkcafe.com/calendar")
  soup = BeautifulSoup(skylark_request.text, "html.parser")
  all_events = soup.find_all("div", class_="w-dyn-items")
  # Old events are hidden on the page.
  list = all_events[0]
  children = list.findChildren("div", recusrive=False)
  for child in children:
    # Need to do more parsing here but hey, that's not bad.
    print(child)