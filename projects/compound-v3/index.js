const sdk = require("@defillama/sdk");
const { lendingMarket } = require("../helper/methodologies");
const { sumTokens2 } = require('../helper/unwrapLPs')

const markets = [
  "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // USDC Market
  '0xa17581a9e3356d9a858b789d68b4d866e593ae94', // ETH Market
]

const collaterals = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
]

const abi = {
  numAssets: 'uint8:numAssets',
  getAssetInfo: "function getAssetInfo(uint8 i) view returns (tuple(uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap))",
}

async function borrowed(timestamp, block,_, { api }) {
  const balances = {}
  const tokens = await api.multiCall({ abi: 'address:baseToken', calls: markets })
  const bals = await api.multiCall({ abi: 'uint256:totalBorrow', calls: markets })
  bals.forEach((v, i) => sdk.util.sumSingleBalance(balances, tokens[i], v, api.chain))
  return balances
}

async function tvl(timestamp, block, _, { api }) {
  const toa = []
  await Promise.all(markets.map(async (m, i) => {
    const items = await api.fetchList({ lengthAbi: abi.numAssets, itemAbi: abi.getAssetInfo, target: m })
    const tokens = items.map(i => i.asset)
    tokens.push(collaterals[i])
    toa.push([tokens, m])
  }))
  return sumTokens2({ api, ownerTokens: toa })
}

module.exports = {
  ethereum: {
    tvl,
    borrowed,
  },
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the totalsCollaterals() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
};
