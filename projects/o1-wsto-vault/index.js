const BigNumber = require('bignumber.js')

// wstO Vault: users deposit O and receive non-rebasing wstO shares
// Each chain has its own independent vault and O/wstO rate.
// https://staking.o1.exchange/?chain=4663 (Robinhood), https://staking.o1.exchange/?chain=8453 (Base)
const config = {
  // asset: O 0x500A02a20B0B0A3F3efCCFc0559543F5743bd1C4; deployed in block 81595232 (2026-10-06 11:28:55 UTC)
  robinhood: { vault: '0xE92bD1C05E4E308792003C8205127A6FA662b4D4', deployedAt: 1791286135 },
  // asset: O 0x182FA643E5f29d5EcA75e7b9CF9336A3fe4620b2; deployed in block 52130412 (2026-10-03 17:56:11 UTC)
  base: { vault: '0x80C6BAE89B636c6Ee96FE8F198c0D6926C2C91df', deployedAt: 1791050171 },
}

module.exports = {
  // first 00:00 UTC at which a vault exists (base); robinhood is guarded by deployedAt until 2026-10-06
  start: '2026-10-04',
  methodology: 'Counts the O tokens held by each chain\'s wstO vault (totalAssets) as staking.',
}

Object.keys(config).forEach(chain => {
  const { vault, deployedAt } = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    staking: async (api) => {
      if (api.timestamp < deployedAt) return // vault not deployed yet on this chain
      const assets = await api.call({ target: vault, abi: 'uint256:totalAssets' })
      // O on Robinhood Chain is not priced by the coins service; price O on every chain via its coingecko id
      // Scale exactly before the final Number conversion required for fractional CoinGecko balances.
      api.addCGToken('o1-exchange', new BigNumber(assets).dividedBy('1e18').toNumber())
    },
  }
})
