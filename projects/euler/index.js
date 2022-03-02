const { default: axios } = require('axios')
const {sumTokens} = require('../helper/unwrapLPs')

const contracts = {
  euler: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
  markets: '0xE5d0A7A3ad358792Ba037cB6eE375FfDe7Ba2Cd1',
  markets_proxy: '0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3',
}

// Graphql endpoint to query markets
const graphql_url = 'https://realm.mongodb.com/api/client/v2.0/app/euler-realm-mainnet-almcs/graphql'
const graphql_config = {
  headers: { 
    'apiKey': process.env.EULER_MONGODB_APIKEY 
  }
}
const markets_query = `query getMarketsAndOverview(
  $queryMarkets: MarketviewQueryInput
  ) {  
      marketviews(query: $queryMarkets) {    
        underlying symbol name
        borrowAPY { _hex _isBigNumber }    
        chainId    
        config {      borrowFactor      collateralFactor      borrowIsolated      eTokenAddress      twapWindow    }    
        dTokenAddr eTokenAddr pTokenAddr
        decimals
        totalBalances { _hex _isBigNumber }    
        totalBorrows { _hex _isBigNumber }    
        underlyingBalance { _hex _isBigNumber } 
      }
    }`
const graphql_payload = {
  query: markets_query, 
  operationName: "getMarketsAndOverview", 
  variables: {
    queryMarkets: {chainId: 1},
  }
}

// In case graphql request does not work because of wrong credentials, there are 22 markets as of 2021-12-31
const markets_underlyings = [                                                      
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
  '0x767fe9edc9e0df98e07454847909b5e959d7ca0e', // ILV
  '0x24a6a37576377f63f194caa5f518a60f45b42921', // BANK
  '0x3832d2f059e55934220881f831be501d180671a7', // renDOG
  '0x1a7e4e63778b4f12a199c062f3efdd288afcbce8', // agEUR
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0x6243d8cea23066d098a15582d81a598b4e8391f4', // FLX
  '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
  '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919', // RAI
  '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b', // CVX
  '0xa117000000f279d81a1d3cc75430faa017fa5a2e', // ANT
  '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', // ENS
  '0x5dd57da40e6866c9fcc34f4b6ddc89f1ba740dfe', // BRIGHT
  '0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050', // TCR
  '0x4691937a7508860f876c9c0a2a617e7d9e945d4b', // WOO
  '0x875773784af8135ea0ef43b5a374aad105c5d39e', // IDLE
  '0x33349b282065b0284d756f0577fb39c158f935e6', // MPL
  '0x31c8eacbffdd875c74b94b077895bd78cf1e64a3', // RAD
  '0x3b484b82567a09e2588a13d54d032153f0c0aee0', // SOS
] 

async function ethereum(timestamp, ethBlock, chainBlocks, chain) {
  const balances = {}

  try {
    // console.log('EULER_MONGODB_APIKEY', process.env.EULER_MONGODB_APIKEY)
    const graphql_response = await axios.post(graphql_url, graphql_payload, graphql_config)
    const markets = graphql_response.data.data.marketviews
    const markets_underlyings = markets.map(market => market.underlying)
    
    // use markets_underlyings or markets_underlyings_nographql
    const tokensAndOwners = markets_underlyings.map(underlying => [underlying, contracts.euler])
    await sumTokens(balances, tokensAndOwners, ethBlock, "ethereum")
    return balances

  } catch(error)   {
    // fails hard and returns empty balances on mongodb auth error
    console.log('ERROR, probably bad graphql endpoint auth token:', error)
    throw error
  }
}

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the euler contract`,
  ethereum: {
    tvl: ethereum,
    // staking: staking(EULstaking, EUL),
  }
}
