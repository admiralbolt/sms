"""Utilities for crawling things!"""
from seleniumbase import Driver

import bs4

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"

def create_driver() -> Driver:
  """Create a headless chrome driver for requests."""
  return Driver(uc=True, headless=True)

def get_html_soup(driver: Driver, url: str) -> bs4.BeautifulSoup:
  """Delicious soup."""
  driver.get(url)
  return bs4.BeautifulSoup(driver.page_source, "html.parser")