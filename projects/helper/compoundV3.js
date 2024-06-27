const sdk = require("@defillama/sdk");
const { lendingMarket } = require("./methodologies");
const { sumTokens2 } = require('./unwrapLPs') 

module.exports = {
  compoundV3Exports: config => {
    const abi = {
      numAssets: 'uint8:numAssets',
      getAssetInfo: "function getAssetInfo(uint8 i) view returns (tuple(uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap))",
    }

    const exportsObj = {
      methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the totalsCollaterals() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
    };
    Object.keys(config).forEach(chain => {
      const { markets } = config[chain]

      async function borrowed(api) {
        const balances = {}
        const tokens = await api.multiCall({ abi: 'address:baseToken', calls: markets })
        const bals = await api.multiCall({ abi: 'uint256:totalBorrow', calls: markets })
        bals.forEach((v, i) => sdk.util.sumSingleBalance(balances, tokens[i], v, api.chain))
        return balances
      }

      async function tvl(api) {
        const toa = []
        await Promise.all(markets.map(async (m, i) => {
          const items = await api.fetchList({ lengthAbi: abi.numAssets, itemAbi: abi.getAssetInfo, target: m })
          const tokens = items.map(i => i.asset)
          const baseToken = await api.call({ abi: 'address:baseToken', target: m })
          tokens.push(baseToken)
          toa.push([tokens, m])
        }))
        return sumTokens2({ api, ownerTokens: toa })
      }
      exportsObj[chain] = { tvl, borrowed }
    })
    return exportsObj
  }
};

