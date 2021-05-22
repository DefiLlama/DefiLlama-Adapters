const retry = require('./helper/retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')
const utils = require('./helper/utils');
const BigNumber = require("bignumber.js");

async function fetch(latestBlock = null) {
    let priceKeys =
      [
        {
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'stable',
        '0x6b175474e89094c44da98b954eedeac495271d0f': 'stable',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ethereum',
        '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d': 'bitcoin',
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ethereum',
        }
      ]


    let price_feed = await utils.getPrices(priceKeys);

    if (!latestBlock) {
      latestBlock = await utils.returnBlock()
    }

    var endpoint = 'https://api.thegraph.com/subgraphs/name/keeperdao/keeperdao'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
      liquidityPoolSupplies(block: { number: ${latestBlock}}) {
        id
        supply
      }
    }
    `;

    let tvl = 0;
    const results = await retry(async bail => await graphQLClient.request(query))
    await Promise.all(
      results.liquidityPoolSupplies.map(async token => {

        let decimals = await utils.returnDecimals(token.id);
        let balance = await new BigNumber(token.supply).div(10 ** decimals).toFixed(2);

        if (priceKeys[0][token.id] !== 'stable') {
          tvl += (price_feed.data[priceKeys[0][token.id]].usd * parseFloat(balance))
        } else {
          tvl += parseFloat(balance)
        }
      })
    )

    return tvl
}

module.exports = {
  fetch
}
