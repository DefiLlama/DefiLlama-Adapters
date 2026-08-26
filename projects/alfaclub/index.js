const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Base mainnet proxies — https://docs.alfaclub.app/docs/developers/contract-addresses
const FRIEND_KEY = '0xAF0Bf8593dC6CA973DF2132731B0F9B5F974FA9F'
const FRIEND_POOL = '0xa1bf9bb17C283CF17F01516f78f3127D2C84C79d'

module.exports = {
  methodology:
    'USDC held by FriendKey (bonding-curve reserves that pay sellers) and FriendPool (trading-fund USDC not yet bridged out). Excludes staked keys and funds already dispatched to Hyperliquid or Polymarket.',
  base: {
    tvl: sumTokensExport({
      owners: [FRIEND_KEY, FRIEND_POOL],
      tokens: [ADDRESSES.base.USDC],
    }),
  },
}
