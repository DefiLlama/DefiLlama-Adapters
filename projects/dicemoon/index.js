const ADDRESSES = require('../helper/coreAssets.json')

// DiceMoonTables: the single non-custodial escrow behind dicemoon.com (multiplayer dice + Sit & Go
// poker on Base). TVL is the USDC it holds: active-game buy-ins and not-yet-claimed winnings.
const DICEMOON_TABLES = '0x0bc585e3c8c47EE507C873eC994b14fC7883793d'

module.exports = {
  methodology:
    'USDC held by the DiceMoonTables escrow contract on Base: buy-ins of games in progress and winnings not yet claimed. The operator never takes custody - stakes go wallet -> escrow -> winners.',
  base: {
    tvl: (api) => api.sumTokens({ owner: DICEMOON_TABLES, tokens: [ADDRESSES.base.USDC] }),
  },
}
