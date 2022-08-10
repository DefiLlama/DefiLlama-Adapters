const retry = require('../helper/retry')
const { GraphQLClient, gql } = require('graphql-request')

async function ethTvl() {
    var endpoint = 'https://api.thegraph.com/subgraphs/name/unbound-finance/unbound'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {  protocol(id: \"unbound\") {   
      id  
    }      
    vaults(first: 5) 
    {  
      id          
      tvl
    }
    }
    `;

    var results = await retry(async bail => await graphQLClient.request(query))
    let t = []

    for (i=0;i<results.vaults.length-1;i++){
      t.push(results.vaults[i].tvl)
    }
    let vault0 = parseFloat(results.vaults[0].tvl ) / 10e17
    let vault1 = parseFloat(results.vaults[1].tvl ) / 10e17

    let ethereumTVL = vault0 + vault1

    return  {'usd-coin': ethereumTVL}
}

async function polyTvl() {
  var endpoint = 'https://api.thegraph.com/subgraphs/name/unbound-finance/unbound-polygon'
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  {  protocol(id: \"unbound\") {   
    id  
  }      
  vaults(first: 5) 
  {  
    id          
    tvl
  }
  }
  `;

  var results = await retry(async bail => await graphQLClient.request(query))
  let t = []

  for (i=0;i<results.vaults.length-1;i++){
    t.push(results.vaults[i].tvl)
  }
  let vault0 = parseFloat(results.vaults[0].tvl ) / 10e17
  let vault1 = parseFloat(results.vaults[1].tvl ) / 10e17

  let polygonTVL = vault0 + vault1

  return  {'usd-coin': polygonTVL}
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  ethereum: {
    tvl: ethTvl
  },
  polygon: {
    tvl: polyTvl
  }
}