const sdk = require('@defillama/sdk')

async function computeMarketCap(api, assets, token) {
  const priceFeedAbi = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
  const assetList = Array.isArray(assets) ? assets : [assets]

  await Promise.all(assetList.map(async (asset) => {
    const { answer: price } = await api.call({ abi: priceFeedAbi, target: asset.priceFeed })
    const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: asset.assetId })
    const assetDecimals = asset.decimals ?? 18
    const priceDecimals = asset.priceDecimals ?? 8
    const marketCap = (Number(totalSupply) / 10 ** assetDecimals) * (Number(price) / 10 ** priceDecimals)
    sdk.util.sumSingleBalance(api.getBalances(), token, marketCap)
  }))

  return api.getBalances()
}

module.exports = {
  base: {
    tvl: async (api) => computeMarketCap(api, [{
      assetId: '0xcCa6848034d327fAc4D60126Ac6ee26708BDfe9d', // KOODOG Token
      priceFeed: '0x7B4dc9df689afbf5dDe58d474C229c3d2fb4cd85',
    }, {
      assetId: '0x25a0e808A7Ed833EA9e9C0B643Eb8B6832af3749', // MURFLO Token
      priceFeed: '0x6913A66f54DAe935fD489f34728D20aeEB43A6bB',
    }], 'coingecko:usd-coin'),
  },
  bsc: {
    tvl: async (api) => computeMarketCap(api, [{
      assetId: '0x8c3b6Bf5078bE53B7462353218853129B642943C', // HOCPOOL Token
      priceFeed: '0x8eB682CdC4E7F913414274a54db1ca35bcC0c4bC',
    }, {
      assetId: '0x2024739806E4DEb480481150C45340fB800cB8fe', // MURFLO Token
      priceFeed: '0x102a2a121F6d54cCc137978642c6294a73c971d7',
    }], 'coingecko:tether')
  },
  berachain: {
    tvl: async (api) => computeMarketCap(api, [{
      assetId: '0x25a0e808A7Ed833EA9e9C0B643Eb8B6832af3749', // MURFLO Token
      priceFeed: '0x0C0ccB0d5de18E0a208225585f0de4288D8dD2ff',
    }], 'coingecko:tether')
  },
};
