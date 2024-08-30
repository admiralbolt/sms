"""Utilities for crawling things!"""

import concurrent.futures
import logging
from typing import Optional

import bs4
from seleniumbase import Driver

logger = logging.getLogger(__name__)

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"


def get_html_soup_thread(url: str) -> Optional[bs4.BeautifulSoup]:
  """Delicious soup."""
  driver = Driver(headless=True)
  soup = None
  try:
    driver.get(url)
    soup = bs4.BeautifulSoup(driver.page_source, "html.parser")
  finally:
    driver.quit()

  return soup


def get_html_soup(url: str, timeout: int = 45) -> Optional[bs4.BeautifulSoup]:
  """Delicious soup."""
  logger.info("[Trawler] Looking up url: %s", url)
  try:
    with concurrent.futures.ThreadPoolExecutor() as executor:
      future = executor.submit(get_html_soup_thread, url)
      result = future.result(timeout)
      return result
  except concurrent.futures.TimeoutError:
    logger.warning("Trawler Timeout. URL: %s, timeout: %s", url, timeout)
  return None
