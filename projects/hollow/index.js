const ADDRESSES = require('../helper/coreAssets.json')

// Hollow (HLO): a currency backed by ETH in a vault with no owner. TVL is the WETH held by the
// Treasury, the reserve behind every HLO (1.3x its floor). The protocol's own Uniswap v4 position
// is not counted. Contracts: https://etherscan.io/address/0x2a737e134f968D94F70B9f669AAd0cc829BE345b
const TREASURY = '0x2a737e134f968D94F70B9f669AAd0cc829BE345b'
const LOCKS = '0x96d9d99062c95957555F17070576A77B366bEA9F'
const HLO = '0xb7EA86464A24586C8bFa34DfbC637C511fEce8bE'

module.exports = {
  methodology: 'TVL is the ETH (held as WETH) in Hollow\'s Treasury, the reserve that backs every HLO at 1.3x its floor price. Staking is the HLO held in the lock contract. The protocol-owned Uniswap v4 liquidity is not counted.',
  start: '2026-11-07',
  ethereum: {
    tvl: (api) => api.sumTokens({ owner: TREASURY, tokens: [ADDRESSES.ethereum.WETH] }),
    staking: (api) => api.sumTokens({ owner: LOCKS, tokens: [HLO] }),
  },
}
