const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const WINJ = '0x0000000088827d2d103ee2d9A6b781773AE03FfB'
const USDC = '0xa00C59fF5a080D2b954d0c75e46E22a0c371235a'

const owners = [
  '0x1333692eB905823df110762525c26f7489BB9300',
  '0xd948740da926E8908A08414879490d0D8F96D463',
  '0xeBF62508F322137EE0986935Ee3b4A60a3F0D227',
]

module.exports = {
  methodology: 'TVL is the wINJ, USDC and native INJ reserves held by the Sprout LaunchpadCore bonding curve contracts. Launched tokens and the SPROUT token itself are excluded.',
  injective: {
    tvl: sumTokensExport({ owners, tokens: [WINJ, USDC, ADDRESSES.null] }),
  },
}
