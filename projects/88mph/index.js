const sdk = require('@defillama/sdk')

const { staking } = require('../helper/staking')
const { graphQuery } = require('../helper/http')

const config = {
  ethereum: { dpools: 'https://api.thegraph.com/subgraphs/name/bacon-labs/eighty-eight-mph' },
  avax: { dpools: 'https://api.thegraph.com/subgraphs/name/88mphapp/88mph-avalanche' },
  fantom: { dpools: 'https://api.thegraph.com/subgraphs/name/88mphapp/88mph-fantom' },
  polygon: { dpools: 'https://api.thegraph.com/subgraphs/name/88mphapp/88mph-polygon' },
}

const dPoolQuery = `{
  dpools {
    id
    address
  }
}`

const tvlExports = {};

Object.keys(config).forEach(chain => {
  const { dpools } = config[chain]
  tvlExports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}

      const logs = await graphQuery(dpools, dPoolQuery)
      const pools = logs.dpools.map(i => i.address)
      const tokens = await api.multiCall({ abi: 'address:stablecoin', calls: pools })
      const bals = await api.multiCall({ abi: 'uint256:totalDeposit', calls: pools })
      const bals2 = await api.multiCall({ abi: 'uint256:totalInterestOwed', calls: pools })
      bals.forEach((b, i) => sdk.util.sumSingleBalance(balances, tokens[i], b, api.chain))
      bals2.forEach((b, i) => sdk.util.sumSingleBalance(balances, tokens[i], b, api.chain))
      return balances
    },
  }
})

tvlExports.ethereum.staking = staking("0x1702F18c1173b791900F81EbaE59B908Da8F689b", "0x8888801af4d980682e47f1a9036e589479e835c5")

module.exports = {
  methodology: `Using the addresses for the fixed interest rate bonds we are able to find the underlying tokens held in each address. Once we have the underlying token we then get the balances of each of the tokens. For the CRV tokens used "CRV:STETH" for example, the address is replaced with the address of one of the tokens. In the example at hand the address is replaced with the "WETH" address so that the price can be calculated.`,
  start: 1606109629, // Monday, November 23, 2020 5:33:49 AM GMT
  ...tvlExports
}
