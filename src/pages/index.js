import React, { useState } from "react"
import { graphql } from "gatsby"

import 'fomantic-ui-css/semantic.css'
import { Card, Image, Statistic, Radio } from 'semantic-ui-react';

import {PriceReducedTotals} from '../components/PriceReducedCounts/PriceReducedTotals'
import CitySelector from '../components/CitySelector/CitySelector'
import Helmet from "react-helmet"

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

const HouseTitle = (house) => {
  const {beds, baths, acres, sq_footage, year} = house
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

const findmedian = myarr => {
  const median = Math.floor(myarr.length / 2),
    nums = [...myarr].sort((x, y) => x - y);
  return myarr.length % 2 !== 0 ? nums[median] : (nums[median - 1] + nums[median]) / 2;
};

const averageDaysListed = (houses) => {
  const results = houses.filter(house => house.node.status === 'Active' && house.node.days_listed > 0)
  let total = 0
  results.map(house => {
    total = total + house.node.days_listed
    return house
  })

  const things = results.map(r => r.node.days_listed)
  return Math.round(total / results.length)
}

const discountedHouses = (houses, events, cityFilter, priceFilter) => {
  let results = events.filter(event => event && event.node && event.node.event && event.node.event === 'price decrease')

  for(let event of results){
    try {
      const house = houseByMLS(houses, event.node.mls)
      event.house = house
      event.node.currentStatus = Number(event.node.currentStatus)
      event.node.previousStatus = Number(event.node.previousStatus)
      event.node.deltaValue = event.node.previousStatus - event.node.currentStatus
    }catch {

    }
  }

  results = results.filter(event => event.house)
  results = results.filter(event => event.house.status === 'Active')

  const sevenDaysAgo = time().tz("America/Denver").millisecond(0).second(0).minute(0).subtract(7, 'days').unix()

  // limit to last 7 days
  results = results.filter(event => event.node.date >= sevenDaysAgo)

  results = results.filter(event => event.node.deltaValue > 14000)
  results.sort((a, b) => parseFloat(b.node.deltaValue) - parseFloat(a.node.deltaValue));

  if(cityFilter != null){
    results = results.filter(event => event.house.city === cityFilter)
  }

  if(priceFilter){
    results = results.filter(event => event.house.price < 600000)
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

const filterLatestHouses = (houses, cityFilter, priceFilter) => {
  houses = houses.filter(house => house.node.status === 'Active')
  if(cityFilter != null){
    houses = houses.filter(house => house.node.city === cityFilter)
  }
  if(priceFilter){
    houses = houses.filter(house => house.node.price < 600000)
  }
  return houses
}





const HomePage = ({ data }) => {

  const [cityFilter, setCityFilter] = useState(null)
  const [priceFilter, setPriceFilter] = useState(false)

  const handleCitySelectorChange = (event, data) => {
    const value = data.value || null
    setCityFilter(value)
  }

  const handleFilterPrice = (event, data) => {
    setPriceFilter(data.checked)
  }

  return (
    <div className="house-container">

      <Helmet>
        <title>Get Real, Jesse</title>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      
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
          <Statistic.Label>houses avail ({averageDaysListed(data.allHouse.edges)}D)</Statistic.Label>
        </Statistic>
      </Statistic.Group>

      <hr />

      <CitySelector houses={data.allHouse.edges} onChange={handleCitySelectorChange} />
      <Radio toggle className="price-limit" label='limit price' onChange={handleFilterPrice}/>

      

      <h1>Top discounted houses (7 days)</h1>

      <Card.Group>
        {discountedHouses(data.allHouse.edges, data.allEvent.edges, cityFilter, priceFilter).map((event, index) => (
          <Card
          href={event.house?.url}
          key={index}
          >
          <Image src={event.house?.images[0]} wrapped ui={false} />
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
        {filterLatestHouses(data.allHouse.edges, cityFilter, priceFilter).map((house, index) => (
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
          days_listed
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