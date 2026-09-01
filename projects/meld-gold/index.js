const { tokens, getAssetInfo } = require('../helper/chain/algorand')
const sdk = require('@defillama/sdk')

async function tvl() {
  const abi = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
  const api = new sdk.ChainApi({})
  let totalMeldMarketCap = 0

  // Gold is priced in tory oz, silver is priced in oz, but Meld Tokens are both priced in grams
  const ozToGrams = 31.10347687

  // Meld tokens
  const assetInfo = [
    {
      assetId: tokens.gold$,
      grams: ozToGrams,
      priceFeed: '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6',
    },
    {
      assetId: tokens.silver$,
      grams: ozToGrams,
      priceFeed: '0x379589227b15F1a12195D3f2d90bBc9F31f95235',
    },
  ]

  // Get total market cap of all Meld tokens
  for (const asset of assetInfo) {
    const { assetId, grams, priceFeed } = asset
    const { answer: price } = await api.call({ abi, target: priceFeed })
    const assetInfo = await getAssetInfo(assetId)
    const circulatingSupply = assetInfo.circulatingSupply
    const marketCap = (circulatingSupply / grams / 10 ** 6) * (price / 10 ** 8)
    totalMeldMarketCap += marketCap
  }

  return { tether: totalMeldMarketCap }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  algorand: {
    tvl,
  },
}
