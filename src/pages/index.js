import React, { useState } from "react"
import { graphql } from "gatsby"

import 'fomantic-ui-css/semantic.css'
import { Card, Image, Statistic, Dropdown } from 'semantic-ui-react';

import {PriceReducedTotals} from '../components/PriceReducedCounts/PriceReducedTotals'
import CitySelector from '../components/CitySelector/CitySelector'

import time from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
time.extend(utc)
time.extend(timezone)

const priceToCurrency = (price) => {
  return new Intl.NumberFormat('en-US',
  { style: 'currency', currency: 'USD' }
).format(price)
}

const HouseTitle = ({beds, baths, acres, sq_footage, year}) => {
  return `${beds}B${baths}b, ${sq_footage} sqft, ${acres} acre, ${year}`
}

const HouseDetails = ({zipcode, year, city}) => {
  return `${city} ${zipcode}`
}

const totalSold = (events) => {
  const results = events.filter(event => event.node.event === 'sold')
  return results.length
}

const avgSaleTime = (events) => {
  const results = events.filter(event => event.node.event === 'sold')
  let saleDuration = 0
  results.map(event => {
    saleDuration = saleDuration + event.node.deltaTime
    return event
  })
  const count = results.length
  return Math.round(saleDuration/count)
}

const totalPriceReduced = (events) => {
  const results = events.filter(event => event.node.event === 'price decrease')
  return results.length
}

const housesAvailable = (houses) => {
  const results = houses.filter(house => house.node.status === 'Active')
  return results.length
}

const discountedHouses = (houses, events, cityFilter) => {
  let results = events.filter(event => event.node.event === 'price decrease')

  for(let event of results){
    const house = houseByMLS(houses, event.node.mls)
    event.house = house
    event.node.currentStatus = Number(event.node.currentStatus)
    event.node.previousStatus = Number(event.node.previousStatus)
    event.node.deltaValue = event.node.previousStatus - event.node.currentStatus
  }

  results = results.filter(event => event.node.deltaValue > 14000)
  results.sort((a, b) => parseFloat(b.node.deltaValue) - parseFloat(a.node.deltaValue));

  if(cityFilter != null){
    results = results.filter(event => event.house.city === cityFilter)
  }

  return results
}

const houseByMLS = (houses, mls) => {
  const results = houses.filter(house => house.node.mls === mls)
  return results[0].node
}

const getNow = (buildTime) => {
  return time(buildTime).tz("America/Denver").format('MM/DD hh:mm:ss')
}

const filterLatestHouses = (houses, cityFilter) => {
  houses = houses.filter(house => house.node.status === 'Active')
  if(cityFilter != null){
    houses = houses.filter(house => house.node.city === cityFilter)
  }
  return houses
}



const HomePage = ({ data }) => {

  const [cityFilter, setCityFilter] = useState(null)

  const handleCitySelectorChange = (event, data) => {
    const value = data.value || null
    setCityFilter(value)
  }

  return (
    <div className="house-container">

      
      <aside>last update: {getNow(data.site.buildTime)}</aside>
      <PriceReducedTotals events={data.allEvent.edges} />

      <hr />


      <Statistic.Group className="shrink">
        <Statistic>
          <Statistic.Value>{totalSold(data.allEvent.edges)}</Statistic.Value>
          <Statistic.Label>sold ({avgSaleTime(data.allEvent.edges)}D)</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>{totalPriceReduced(data.allEvent.edges)}</Statistic.Value>
          <Statistic.Label>price reduced</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>{housesAvailable(data.allHouse.edges)}</Statistic.Value>
          <Statistic.Label>houses available</Statistic.Label>
        </Statistic>
      </Statistic.Group>

      <hr />

      <CitySelector houses={data.allHouse.edges} onChange={handleCitySelectorChange} />

      

      <h1>Top discounted houses</h1>

      <Card.Group>
        {discountedHouses(data.allHouse.edges, data.allEvent.edges, cityFilter).map((event, index) => (
          <Card
          href={event.house.url}
          key={index}
          >
          <Image src={event.house.images[0]} wrapped ui={false} />
          <Card.Content>
            <Card.Header>{HouseTitle(event.house)}</Card.Header>
            <Card.Description>
              {priceToCurrency(event.house.price)}
            </Card.Description>
          </Card.Content>
          <Card.Content>
            <Card.Description>
              {HouseDetails(event.house)}
            </Card.Description>
          </Card.Content>
          <Card.Content>
            <Card.Description>
              {event.node.deltaValue} price decrease in {event.node.deltaTime} days
            </Card.Description>
          </Card.Content>
        </Card>
        ))}
      </Card.Group>

      <hr />
      <h1>Latest houses</h1>

      <Card.Group className="latest">
        {filterLatestHouses(data.allHouse.edges, cityFilter).map((house, index) => (
          <Card
          href={house.node.url}
          key={index}
          >
          <Image src={house.node.images[0]} wrapped ui={false} />
          <Card.Content>
            <Card.Header>{HouseTitle(house.node)}</Card.Header>
            <Card.Description>
              {priceToCurrency(house.node.price)}
            </Card.Description>
          </Card.Content>
          <Card.Content>
            <Card.Description>
              {HouseDetails(house.node)}
            </Card.Description>
          </Card.Content>
        </Card>
        ))}
      </Card.Group>


    </div>
  )
};

export const query = graphql`
  query {
    site {
      buildTime
    }
    allHouse(
      limit:2000
      sort: {
        fields:[created]
        order:DESC
      }
    ) {
      edges {
        node {
          id
          images
          mls
          created
          beds
          baths
          city
          zipcode
          year
          sq_footage
          price
          acres
          url
          status
        }
      }
    }
    allEvent {
      edges {
        node {
          currentStatus
          previousStatus
          deltaTime
          date
          id
          mls
          event
        }
      }
    }
  }
`

export default HomePage;