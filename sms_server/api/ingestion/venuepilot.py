import requests

raw = """
query PaginatedEvents {
    paginatedEvents(arguments: {limit: 5, page: 0, searchScope: "seattle"}) {
      collection {
        date
        description
        doorTime
        endTime
        footerContent
        highlightedImage
        id
        images
        instagramUrl
        minimumAge
        name
        promoter
        startTime
        status
        support
        ticketsUrl
        twitterUrl
        websiteUrl
        venue {
          id
          name
          street1
          street2
          state
          postal
          city
          country
          lat
          long
          timeZone
        }
        artists {
          id
          name
          updatedAt
          createdAt
          bio
        }
        scheduling
        provider
        priceMin
        priceMax
        currency
      }
      metadata {
        totalCount
        totalPages
        currentPage
        limitValue
      }
    }
    publicEvents {
      id
    }
  }
"""

def event_request(page=0):
  headers = {
    "content-type": "application/json",
  }
  data = {
    "operationName": "PaginatedEvents",
    "query": raw
  }
  print(headers)
  print(data)
  result = requests.post("https://www.venuepilot.co/graphql", headers=headers, json=data)
  print(result.status_code)
  print(result.text)


def import_data():
  print(event_request())