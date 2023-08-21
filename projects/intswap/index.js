const sdk = require('@defillama/sdk')
const graphql = require('../helper/utils/graphql')
const returnEthBalance = require('../helper/utils.js')

const query = `
query getPairs {
  pairs(first: 1000) {
    id
    address
    tvl
  }
}`

module.exports = {
  methodology: 'Sum up all the ETH in pools',
  era: {
    tvl: async (timestamp, block, chainBlocks, { api }) => {

      const data = await graphql.request(
        'https://api.studio.thegraph.com/query/47106/intswap-zksync-era/version/latest',
        query,
      )

      const balances = {};
      console.log(data);
      data.pairs.forEach(({ address, tvl }) => {
        console.log(tvl);
        sdk.util.sumSingleBalance(balances, 'ethereum', tvl / 1e18)
      });

      return balances;
    }
  }
}
