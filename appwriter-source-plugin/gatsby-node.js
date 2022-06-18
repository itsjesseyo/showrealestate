const env = require('node-env-file');
env(__dirname + './../.env');
const {APPWRITE_PROJECT, APPWRITE_KEY, APPWRITE_ENDPOINT} = process.env
const print = console.log
const sdk = require('node-appwrite');
const client = new sdk.Client();
client
    .setEndpoint(APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(APPWRITE_PROJECT) // Your project ID
    .setKey(APPWRITE_KEY); // Your secret API key
let db = new sdk.Database(client);

exports.onPreInit = () => console.log("Loading houses");

const HOUSE_NODE_TYPE = `House`;
const EVENT_NODE_TYPE = `Event`;

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode } = actions

  let housesleft = true;
  let currentpage = 0;
  let houses = [];

  while (housesleft) {
      let housepages = await getHousesPage(currentpage); 
      houses.push(...housepages.documents);
      if (100*currentpage >= housepages.total) {
          housesleft = false;
      } else {
          currentpage++;
      }
  }

  // for(let i = 0; i < houses.length; i++){
  //   const house = houses[i]
  //   const results = await getStatusEvents(house.mls)
  //   houses[i].statusEvents = results.documents
  // }

  // loop through data and create Gatsby nodes
  houses.forEach(house =>
    createNode({
      ...house,
      id: createNodeId(`${HOUSE_NODE_TYPE}-${house.$id}`),
      parent: null,
      children: [],
      internal: {
        type: HOUSE_NODE_TYPE,
        content: JSON.stringify(house),
        contentDigest: createContentDigest(house),
      },
    })
  )

  // ---------------

  let eventsLeft = true;
  currentpage = 0;
  let events = [];

  while (eventsLeft) {
      let eventPages = await getStatusEventsPage(currentpage); 
      events.push(...eventPages.documents);
      if (100*currentpage >= eventPages.total) {
        eventsLeft = false;
      } else {
          currentpage++;
      }
  }
  // loop through data and create Gatsby nodes
  events.forEach(event =>
    createNode({
      ...event,
      id: createNodeId(`${EVENT_NODE_TYPE}-${event.$id}`),
      parent: null,
      children: [],
      internal: {
        type: EVENT_NODE_TYPE,
        content: JSON.stringify(event),
        contentDigest: createContentDigest(event),
      },
    })
  )

  return
}

async function getHousesPage(page = 0) {
  const limit = 100
  const houses = await db.listDocuments('62942eb0a4f128287cbc', [], limit, page * limit,null,null,['batch'], ['DESC'])
  return houses;
}

async function getStatusEventsPage(page = 0) {
  const limit = 100
  const events = await db.listDocuments('statusEvents', [], limit, page * limit,null,null,['date'], ['DESC'])
  return events;
}

async function getStatusEvents(houseId) {
  const limit = 100
  const events = await db.listDocuments('statusEvents', [
    sdk.Query.equal('mls', houseId)
  ], limit, 0,null,null,['date'], ['DESC'])
  return events;
}

