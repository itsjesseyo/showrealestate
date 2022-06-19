import React from "react"
import { graphql } from "gatsby"

import 'fomantic-ui-css/semantic.css'
import { Card, Image, Statistic } from 'semantic-ui-react';

import {PriceReducedTotals} from '../components/PriceReducedCounts/PriceReducedTotals'

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

const totalPriceReduced = (events) => {
  const results = events.filter(event => event.node.event === 'price decrease')
  return results.length
}

const housesAvailable = (houses) => {
  console.log(houses)
  const results = houses.filter(house => house.node.status === 'Active')
  return results.length
}

const discountedHouses = (houses, events) => {
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

  // console.log(results)
  return results
}

const houseByMLS = (houses, mls) => {
  const results = houses.filter(house => house.node.mls === mls)
  return results[0].node
}

const HomePage = ({ data }) => {

  return (
    <div className="house-container">

      <PriceReducedTotals events={data.allEvent.edges} />

      <hr />

      <div>
        <Statistic.Group>
          <Statistic>
            <Statistic.Value>{totalSold(data.allEvent.edges)}</Statistic.Value>
            <Statistic.Label>sold</Statistic.Label>
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
      </div>

      <hr />

      <h1>Top discounted houses</h1>

      <Card.Group>
        {discountedHouses(data.allHouse.edges, data.allEvent.edges).map((event, index) => (
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

      <Card.Group>
        {data.allHouse.edges.map((house, index) => (
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