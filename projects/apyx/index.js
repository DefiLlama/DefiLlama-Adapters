const foundationWallets = [
  '0xabdd8c8ee69e5f5180eb9352aeffc5ceead65e96',
  '0x6f93635f2a1c19b4f7f1bd9ba655f6a073c629dc',
  '0xf9862efc1704ac05e687f66e5cd8c130e5663ce2',
  '0x37B0779A66edc491df83e59a56D485835323a555',
  '0xbfBcF5B00698A7ab9305c252a25009e8cfac0852',
]

const apxUSD = '0x98A878b1Cd98131B271883B390f68D2c90674665'
const apyUSD = '0x38EEb52F0771140d10c4E9A9a72349A329Fe8a6A'

module.exports = {
  misrepresentedTokens: true,
  start: '2026-02-17',
  methodology: "TVL is the circulating supply of apxUSD — total supply minus apxUSD held by Foundation wallets (direct holdings + apyUSD vault holdings converted to apxUSD). apyUSD is excluded from TVL to avoid double-counting.",
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: apxUSD })

      const apxBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: foundationWallets.map(w => ({ target: apxUSD, params: [w] })),
      })

      const apyBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: foundationWallets.map(w => ({ target: apyUSD, params: [w] })),
      })

      const totalApyShares = apyBalances.reduce((sum, b) => sum + Number(b), 0)

      let apyAsApxUSD = 0
      if (totalApyShares > 0) {
        const converted = await api.call({
          abi: 'function convertToAssets(uint256) view returns (uint256)',
          target: apyUSD,
          params: [BigInt(Math.floor(totalApyShares)).toString()],
        })
        apyAsApxUSD = Number(converted)
      }

      const totalApxHeld = apxBalances.reduce((sum, b) => sum + Number(b), 0)
      const inventory = totalApxHeld + apyAsApxUSD
      const circulating = (Number(totalSupply) - inventory) / 1e18

      api.addCGToken('apxusd', circulating)
    },
  },
}
