const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')
const utils = require('./helper/utils');

async function fetch() {
    var endpoint = 'https://api.thegraph.com/subgraphs/name/m19/titan'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
      collateralConfigs(where: {id_in: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]}) {
        id
        totalLocked
      }
    } 
    `;

    const results = await retry(async bail => await graphQLClient.request(query))

    var tvl = 0;
    var weth_price = await utils.getPricesfromString('weth');
    var wbtc_price = await utils.getPricesfromString('wrapped-bitcoin');
    var usdc_price = await utils.getPricesfromString('usd-coin');

    results.collateralConfigs.map(collateral => {
            //WETH
            if (collateral.id == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
                let collAmount = (parseInt(collateral.totalLocked) / Math.pow(10, 18));
                tvl += parseFloat(collAmount * weth_price.data.weth.usd);
            }

            //WBTC
            if (collateral.id == "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599") {
                let collAmount = (parseInt(collateral.totalLocked) / Math.pow(10, 8));
                tvl += parseFloat(collAmount * wbtc_price.data["wrapped-bitcoin"].usd);
            }

            //USDC
            if (collateral.id == "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") {
                let collAmount = (parseInt(collateral.totalLocked) / Math.pow(10, 6));
                tvl += parseFloat(collAmount * usdc_price.data["usd-coin"].usd);
            }

        });
        
    return tvl
}

module.exports = {
  fetch
}