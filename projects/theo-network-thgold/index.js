// thGOLD: each token represents one troy ounce of physical gold, valued at the Chainlink XAU/USD feed.
const thGOLD  = '0x610F0E33b0A6b3802ff29D3Cf6bBd9A0ACF784ed' // 6 decimals
const XAU_USD = '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6' // Chainlink XAU/USD, 8 decimals, USD per troy ounce

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true, // metals are reported as a USD value, which the token breakdown labels USDT
  methodology:
    'thGOLD TVL is circulating thGOLD supply valued at the Chainlink XAU/USD price, as each token represents one ' +
    'troy ounce of physical gold. thGOLD held in the thUSD reserve is also counted by Theo Network thUSD, so this ' +
    'adapter is flagged doublecounted under the Theo Network parent.',
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: thGOLD })
      const { answer } = await api.call({
        abi: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
        target: XAU_USD,
      })
      api.addUSDValue((supply / 1e6) * (answer / 1e8))
    },
  },
}
