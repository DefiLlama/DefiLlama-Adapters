// thSLVR: each token represents one troy ounce of physical silver, valued at the Chainlink XAG/USD feed.
const thSLVR  = '0x84C8F334434fb6fF769F760653FEb88838357039' // 6 decimals
const XAG_USD = '0x379589227b15F1a12195D3f2d90bBc9F31f95235' // Chainlink XAG/USD, 8 decimals, USD per troy ounce

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true, // metals are reported as a USD value, which the token breakdown labels USDT
  methodology:
    'thSLVR TVL is circulating thSLVR supply valued at the Chainlink XAG/USD price, as each token represents one ' +
    'troy ounce of physical silver. thSLVR held in the thUSD reserve is also counted by Theo Network thUSD, so this ' +
    'adapter is flagged doublecounted under the Theo Network parent.',
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: thSLVR })
      const { answer } = await api.call({
        abi: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
        target: XAG_USD,
      })
      api.addUSDValue((supply / 1e6) * (answer / 1e8))
    },
  },
}
