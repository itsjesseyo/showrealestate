import React from "react"
import { graphql } from "gatsby"

const HomePage = ({ data }) => {
  return (
    <>
      <h1>Houses</h1>
      {data.allHouse.edges.map(house => (
        <div id={house.node.id}>
          <h3>{house.node.mls}</h3>
          <p>Days listed: {house.node.days_listed}</p>
          <p>batch: {house.node.batch}</p>
          <p>price: {new Intl.NumberFormat('en-US',
  { style: 'currency', currency: 'USD' }
).format(house.node.price)}</p>

          <img src={house.node.images[0]} />
        </div>
      ))}
    </>)
};

export const query = graphql`
  query {
    allHouse {
      edges {
        node {
          id
          features
          images
          mls
          days_listed
          batch
          price
        }
      }
    }
  }
`

export default HomePage;