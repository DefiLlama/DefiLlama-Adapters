const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

// Settlement history and position tokens: app.stryke.xyz's public ABI/config and
// api.rfq.stryke.xyz/indexer/portfolio. Only the new RFQ product is included.
const sharedOwners = [
  '0x6f1285fd060259e535c8e7526009d5c6ae247024',
  '0x04fab9f0d0f18a8b88bc69b94fdd3d9132318bb9',
  '0x2913ba15456e0fc2007e565b33096ca083ed92e3',
]
const robinhoodOwners = [
  ...sharedOwners,
  '0x1fa225166e84cade8fb74384622dbdf6cfe55929',
  '0x98d43a79815e034e480537c23ea6cef7dfcb9d29',
  '0xc53a4248c8d7eab225a921f7d70249375e2132cf', // Original position token from requests(maker,nonce).
  '0x9387490e2572bd4ab10aeba7ad45e148803f5d75',
  '0xa84548bb2e28ae9279574973171b4f9d47b0669b',
  '0x334d303aa7da47289df4111ffd6cef7512631347',
  '0xf42e8db59f916749cd323fdf84adb34bf571634d',
  '0xe79b0aceb21aa1362d2f5f6f5bbfe8882cf2937a',
  '0x3f088bf19f6d04b1fa84ce3bbcf95365f839e110',
]
const stakedSyk = '0x20b2431557bB90954744a6D404f45aD1aD8719f4'
const SYK = '0x97c065eed0309f182777bffa41a9c0027c190df1'
const sykStaking = staking(stakedSyk, SYK)

module.exports = {
  methodology: 'Cash balances in the identified RFQ settlement escrow, option-position and funded-payout contracts. Excludes trader wallets, bridge balances, market-maker external hedges, fee treasury and notional option exposure. Staking counts SYK held by the StakedSYK contract.',
  robinhood: {
    start: '2026-10-04',
    tvl: api => api.sumTokens({ owners: robinhoodOwners, tokens: [ADDRESSES.robinhood.USDG] }),
    // StakedSYK was deployed October 8; earlier history has no stake.
    staking: api => api.timestamp < 1791469511 ? {} : sykStaking(api),
  },
  arbitrum: {
    start: '2026-10-30',
    tvl: api => api.sumTokens({ owners: sharedOwners, tokens: [ADDRESSES.arbitrum.USDC] }),
  },
}
