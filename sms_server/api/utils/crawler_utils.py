"""Utilities for crawling things!"""
from typing import Optional

import bs4
from seleniumbase import Driver


USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"

def get_html_soup(url: str) -> Optional[bs4.BeautifulSoup]:
  """Delicious soup."""
  driver = Driver(uc=True, headless=True)
  soup = None
  try:
    driver.get(url)
    soup = bs4.BeautifulSoup(driver.page_source, "html.parser")
  finally:
    driver.quit()

  return soup