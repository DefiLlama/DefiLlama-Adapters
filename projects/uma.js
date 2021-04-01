const web3 = require('./config/web3.js');
const { GraphQLClient, gql } = require('graphql-request')
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const utils = require('./helper/utils');
const abis = require('./config/uma/abis.js')

async function fetch() {

  var endpoint = 'https://api.thegraph.com/subgraphs/name/protofire/uma'
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  {
    financialContracts {
      id
      collateralRequirement
      expirationTimestamp
      totalSyntheticTokensBurned
      totalSyntheticTokensCreated
      totalTokensOutstanding
      cumulativeFeeMultiplier
      globalCollateralizationRatio
      rawTotalPositionCollateral
      totalCollateralDeposited
      totalCollateralWithdrawn
      totalPositionCollateral
      rawLiquidationCollateral
    }
  }
  `;

  var tokens = [
    {
      address: '0xeca82185adCE47f39c684352B0439f030f860318',
      symbol: 'PERL',
      decimals: '18',
      gecko_key: 'perlin'
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'PERL',
      symbol: 'WETH',
      decimals: '18',
      gecko_key: 'ethereum'
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: '18',
      gecko_key: '1'
    },
    {
      address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
      symbol: 'renBTC',
      decimals: '8',
      gecko_key: 'bitcoin'
    }
  ]

  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,perlin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

  var tvl = 0;
  const results = await retry(async bail => await graphQLClient.request(query))
  await Promise.all(
    results.financialContracts.map(async contract => {
      var dacontract = new web3.eth.Contract(abis.abis.uma, contract.id)
      var collateral = await dacontract.methods.collateralCurrency().call();
      await Promise.all(
        tokens.map(async item =>  {
          if (item.address === collateral) {
            var symbol = item.symbol;
            let amount = await utils.returnBalance(item.address, contract.id);
            if (item.symbol === 'DAI') {
              tvl += (amount * 1)
            } else {
              tvl += (amount * price_feed.data[item.gecko_key].usd)
            }
          } else {
            //no match
          }
        })
      )

    })
  )


  return tvl;
}

module.exports = {
  fetch
}
