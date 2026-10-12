const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const WINJ = '0x0000000088827d2d103ee2d9A6b781773AE03FfB'
const USDC = '0xa00C59fF5a080D2b954d0c75e46E22a0c371235a'
const SPROUT = '0x503f2A7bAc1E2ff2800Aa92EdB82abeF0bFA631E'

const owners = [
  '0x1333692eB905823df110762525c26f7489BB9300',
  '0xd948740da926E8908A08414879490d0D8F96D463',
  '0xeBF62508F322137EE0986935Ee3b4A60a3F0D227',
]

module.exports = {
  methodology: 'TVL is the wINJ, USDC and native INJ reserves held by the three Sprout LaunchpadCore bonding curve contracts (current and two previous versions). SPROUT held as quote-asset reserves is reported under staking. Launched tokens are excluded, and liquidity that graduated to Choice is not counted.',
  injective: {
    tvl: sumTokensExport({ owners, tokens: [WINJ, USDC, ADDRESSES.null] }),
    staking: sumTokensExport({ owners, tokens: [SPROUT] }),
  },
}
