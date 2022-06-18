import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import faker from 'faker';
import * as dayjs from 'dayjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);



const print = console.log;

const ReductionOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Price Reductions Per Day',
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

const ReductionTotalsOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Price Reductions Totals',
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

// const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

// export const data = {
//   labels,
//   datasets: [
//     {
//       data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
//       backgroundColor: 'rgba(255, 99, 132, 0.5)',
//     },
//   ],
// };

const objToChartData = (obj, obj2, obj3) => {
  const labels = []
  const data = []
  const data2 = []
  const data3 = []
  for(const [key, value] of Object.entries(obj)){
    labels.push(key)
    data.push(value)
  }
  for(const [key, value] of Object.entries(obj2)){
    data2.push(value)
  }
  for(const [key, value] of Object.entries(obj3)){
    data3.push(value)
  }
  return {
    labels,
    datasets: [
      {
        label: 'reduction counts',
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'reduction totals',
        data: data2,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'sales counts',
        data: data3,
        backgroundColor: 'rgba(53, 235, 235, 0.5)',
      }
    ]
  }
}


export const PriceReducedTotals = ({events}) => {

  let labels = {}
  const counts = {}
  const totals = {}
  const salesTotals = {}
  events = events.map(event => event.node)
  
  let sales = events.filter(event => event.event !== 'price decrease' && event.event !== 'price increase' && event.currentStatus !== 'active')
  sales = sales.map(event => {
    const day = dayjs.unix(event.date).hour(0)
    const label = day.format('M/DD')
    return {
      day: day.unix(),
      label: label,
      ...event,
    }
  })
  sales = sales.filter(event => event.day !== 1654408800)
  sales = sales.filter(event => event.label !== '6/06' && event.label !== '6/07' && event.label !== '6/08' && event.label !== '6/09')
  sales.sort((a, b) => parseFloat(a.day) - parseFloat(b.day));
  sales.map(event => {

    const {label} = event

    if(label in salesTotals){
      salesTotals[label] = salesTotals[label] + 1
    }else{
      salesTotals[label] = 1
    }

    return event
  })
  
  // print(sales)
  // print(salesTotals)
  events = events.filter(event => event.event === 'price decrease')
  events = events.map(event => {
    const day = dayjs.unix(event.date).hour(0)
    const label = day.format('M/DD')
    const currentStatus = Number(event.currentStatus)
    const previousStatus = Number(event.previousStatus)
    const deltaValue = currentStatus-previousStatus || 0
    return {
      day: day.unix(),
      label: label,
      ...event,
      currentStatus,
      previousStatus,
      deltaValue: currentStatus-previousStatus
    }
  })
  events = events.filter(event => event.day !== 1654408800)

  events.sort((a, b) => parseFloat(a.day) - parseFloat(b.day));

  events.map(event => {

    const {label, deltaValue} = event

    if(label in counts){
      counts[label] = counts[label] + 1
    }else{
      counts[label] = 1
    }

    if(label in totals){
      totals[label] = totals[label] + deltaValue
    }else {
      totals[label] = deltaValue
    }

    return event
  })

  // print(objToChartData(counts, totals, salesTotals))

  return (
    <>
    <Bar options={ReductionOptions} data={objToChartData(counts, totals, salesTotals)} />
    </>
  )
}