## Running the thing

Make sure the broker is running. Defaults to rabbitmq, I installed and ran via
brew on my machine:

```
brew services start rabbitmq
```

Need to start both the celery beat service and a celery worker:

```
celery -A sms_server beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler 
```

```
celery -A sms_server worker -l INFO 
```



### List of APIs

#### Ticketmaster

Already got crawling working for this one, entry point here:
https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-venues-v2

#### TIXR

AFAICT there is no public api for this one. May need to resort to crawling
venue websites directly, but we got lucky and nectar is leaking their
credentials.

Nectar lounge: https://www.tixr.com/v1/groups/748/events?cpk=MTU1OQ==.
High dive: https://www.tixr.com/v1/groups/749/events?cpk=MTU1OA==.

#### Eventbrite:

Thank god for free public apis.

https://www.eventbrite.com/platform/api#/introduction/authentication

EXCEPT

As it turns out you can't search for events using this API. AND you can't fetch
data from an organization unless you are a member of that organization.

#### AXS

Why are there so many different fucking ticketing services. What we need is
one ticketing service...

No public api AFAICT, and neumos/barboza don't suck at building websites.

sent them an email...

#### VenuePilot

WE IN THERE DOG

https://cloud.hasura.io/public/graphiql?endpoint=https%3A%2F%2Fwww.venuepilot.co%2Fgraphql

https://cloud.hasura.io/public/graphiql?endpoint=https%3A%2F%2Fwww.venuepilot.co%2Fgraphql&query=query+PaginatedEvents+%7B%0A++paginatedEvents%28arguments%3A+%7Blimit%3A+5%2C+page%3A+1%7D%29+%7B%0A++++collection+%7B%0A++++++date%0A++++++description%0A++++++doorTime%0A++++++endTime%0A++++++footerContent%0A++++++highlightedImage%0A++++++id%0A++++++images%0A++++++instagramUrl%0A++++++minimumAge%0A++++++name%0A++++++promoter%0A++++++startTime%0A++++++status%0A++++++support%0A++++++ticketsUrl%0A++++++twitterUrl%0A++++++websiteUrl%0A++++++venue+%7B%0A++++++++id%0A++++++++name%0A++++++++street1%0A++++++++street2%0A++++++++state%0A++++++++postal%0A++++++++city%0A++++++++country%0A++++++++lat%0A++++++++long%0A++++++++timeZone%0A++++++%7D%0A++++++artists+%7B%0A++++++++id%0A++++++++name%0A++++++++updatedAt%0A++++++++createdAt%0A++++++++bio%0A++++++%7D%0A++++++scheduling%0A++++++provider%0A++++++priceMin%0A++++++priceMax%0A++++++currency%0A++++%7D%0A++++metadata+%7B%0A++++++totalCount%0A++++++totalPages%0A++++++currentPage%0A++++++limitValue%0A++++%7D%0A++%7D%0A%7D%0A

#### DICE FM

A new API has entered the chat. Looks like Sunset recently switched to using
DICE instead of ticketmaster for most of their events. Unfortunately it's
unclear still how to actually authenticate. Their site says API tokens can be
generated in "MIO", not sure what that is.

### Venues

Barboza => AXS
Blue Moon Tavern => VERY MANUAL
Central Saloon => VenuePilot
Chop Suey => Ticketmaster
Connor Byrne => VenuePilot
Crocodile => Ticketmaster
Fremont Abbey => EventBrite
High Dive => TIXR
Jules Maes => VenuePilot
Madame Lou's => Ticketmaster
Nectar Lounge => TIXR
Neumos => AXS
Royal Room => Stranger Tickets???
Neptune Theatre => TicketMaster
Skylark => Manual + EventBrite
Sunset Tavern => Ticketmaster & Dice FM??
Tim's Tavern => VenuePilot
Tractor Tavern => TicketMaster

Hidden Door
Pink Door
Rabbit Box
