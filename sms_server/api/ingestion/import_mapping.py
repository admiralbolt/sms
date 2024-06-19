from api.constants import IngestionApis
from api.ingestion.crawlers import blue_moon, darrells_tavern, little_red_hen, sea_monster_lounge, skylark, the_royal_room
from api.ingestion.crawlers.crawler import Crawler
from api.ingestion.event_apis import axs, dice, eventbrite, ticketmaster, tixr, venuepilot
from api.ingestion.event_apis.event_api import EventApi


EVENT_API_MAPPING: dict[str, EventApi] = {
  IngestionApis.AXS: axs.AXSApi(),
  IngestionApis.DICE: dice.DiceApi(),
  IngestionApis.EVENTBRITE: eventbrite.EventbriteApi(),
  IngestionApis.TICKETMASTER: ticketmaster.TicketmasterApi(),
  IngestionApis.TIXR: tixr.TIXRApi(),
  IngestionApis.VENUEPILOT: venuepilot.VenuepilotApi()
}

CRAWLER_MAPPING: dict[str, Crawler] = {
  IngestionApis.CRAWLER_BLUE_MOON: blue_moon.BlueMoonCrawler(),
  IngestionApis.CRAWLER_DARRELLS_TAVERN: darrells_tavern.DarellsTavernCrawler(),
  IngestionApis.CRAWLER_LITTLE_RED_HEN: little_red_hen.LittleRedHenCrawler(),
  IngestionApis.CRAWLER_SEA_MONSTER_LOUNGE: sea_monster_lounge.SeaMonsterLoungeCrawler(),
  IngestionApis.CRAWLER_SKYLARK: skylark.SkylarkCrawler(),
  IngestionApis.CRAWLER_THE_ROYAL_ROOM: the_royal_room.TheRoyalRoomCrawler()
}

CRAWLER_NICE_NAMES: dict[str, str] = {
  "blue_moon": IngestionApis.CRAWLER_BLUE_MOON,
  "darrells_tavern": IngestionApis.CRAWLER_DARRELLS_TAVERN,
  "little_red_hen": IngestionApis.CRAWLER_LITTLE_RED_HEN,
  "sea_monster_lounge": IngestionApis.CRAWLER_SEA_MONSTER_LOUNGE,
  "skylark": IngestionApis.CRAWLER_SKYLARK,
  "the_royal_room": IngestionApis.CRAWLER_THE_ROYAL_ROOM
}