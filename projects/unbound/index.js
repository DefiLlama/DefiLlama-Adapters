const sdk = require("@defillama/sdk");
const { GraphQLClient, gql } = require('graphql-request')
const { staking } = require("../helper/staking");


const ETH_STAKING_ADDR = '0x94515758819F4D5119f75EEeB7F6bfdCAdc5e835'
const POLY_STAKING_ADDR = '0xAf12F8Ec3f8C711d15434B63f9d346224C1c4666'
const UNB_ETH = '0x8db253a1943dddf1af9bcf8706ac9a0ce939d922'
const UNB_POLY = '0xD81F558b71A5323e433729009D55159955F8A7f9'



async function ethTvl() {
    var endpoint = sdk.graph.modifyEndpoint('8hYGnnqzaQ98ikvhi9uZ5GRmYjd7C2ykopeNpbA3DXUh')
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

    var results = await graphQLClient.request(query)
    let t = []

    for (let i=0;i<results.vaults.length-1;i++){
      t.push(results.vaults[i].tvl)
    }
    let vault0 = parseFloat(results.vaults[0].tvl ) / 10e17
    let vault1 = parseFloat(results.vaults[1].tvl ) / 10e17

    let ethereumTVL = vault0 + vault1

    return  {'usd-coin': ethereumTVL}
}

async function polyTvl() {
  var endpoint = sdk.graph.modifyEndpoint('EtpUNR2s35iZNRGfQ5vqCSayGf72THHd1duUtkxKreGU')
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

  var results = await graphQLClient.request(query)
  let t = []

  for (let i=0;i<results.vaults.length-1;i++){
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
    tvl: ethTvl,
    staking: staking(ETH_STAKING_ADDR,UNB_ETH)
  },
  polygon: {
    tvl: polyTvl,
    staking: staking(POLY_STAKING_ADDR,UNB_POLY,'polygon', `polygon:${UNB_POLY}`)
  }
}