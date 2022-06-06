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

  return
}

async function getHousesPage(page = 0) {
  const limit = 100
  const houses = await db.listDocuments('62942eb0a4f128287cbc', [], limit, page * limit,null,null,['batch'], ['DESC'])
  return houses;
}

