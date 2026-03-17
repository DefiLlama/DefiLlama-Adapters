const { sumTokens } = require('../helper/chain/starknet')
const ADDRESSES = require('../helper/coreAssets.json')

const STAKING_CONTRACT = '0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7'

const BTC_TOKENS = [
  ADDRESSES.starknet.WBTC,
  ADDRESSES.starknet.tBTC,
  '0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68', // SolvBTC
  '0x036834A40984312F7f7de8D31e3f6305B325389eAEeA5B1c0664b2fB936461a4', // Lombard LBTC
]

async function tvl() {
  return sumTokens({
    tokensAndOwners: BTC_TOKENS.map(token => [token, STAKING_CONTRACT])
  })
}

module.exports = {
  timetravel: false,
  starknet: { tvl },
}
