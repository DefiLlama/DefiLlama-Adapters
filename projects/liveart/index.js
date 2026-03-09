const sdk = require('@defillama/sdk')

async function computeMarketCap(api, asset) {
  const abi = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
  const { answer: price } = await api.call({ abi, target: asset.priceFeed })
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: asset.assetId })
  const marketCap = (Number(totalSupply) / 10 ** 18) * (Number(price) / 10 ** 8)
  sdk.util.sumSingleBalance(api.getBalances(), 'coingecko:usd-coin', marketCap)
  return api.getBalances()
}

module.exports = {
  base: {
    tvl: async (api) => computeMarketCap(api, {
      assetId: '0xcCa6848034d327fAc4D60126Ac6ee26708BDfe9d', // KOODOG Token
      priceFeed: '0x7B4dc9df689afbf5dDe58d474C229c3d2fb4cd85',
    })
  },
  bsc: {
    tvl: async (api) => computeMarketCap(api, {
      assetId: '0x8c3b6Bf5078bE53B7462353218853129B642943C', // HOCPOOL Token
      priceFeed: '0x8eB682CdC4E7F913414274a54db1ca35bcC0c4bC',
    })
  },
};
