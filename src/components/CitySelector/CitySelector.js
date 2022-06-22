import { set } from 'lodash'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const options = [
  { key: 1, text: 'Choice 1', value: 1 },
  { key: 2, text: 'Choice 2', value: 2 },
  { key: 3, text: 'Choice 3', value: 3 },
]

const CitySelector = ({houses, onChange}) => {

  const manualCities = [
    'Salt Lake City',
    'South Salt Lake',
    'Millcreek',
    'West Valley City',
    'West Jordan',
    'Murray',
    'Holladay',
    'Zions Park',
  ]

  let cities = houses.map(house => house.node.city)
  cities = [...new Set(cities)]
  cities.sort()
  cities = cities.filter(city => manualCities.includes(city) === true)
  cities = cities.map(city => {
    return {
      key: city,
      text: city,
      value: city
    }
  })

  return <Dropdown clearable options={cities} selection onChange={onChange} />
}

export default CitySelector