const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokens2 } = require('../helper/unwrapLPs')
const USDC = ADDRESSES.ethereum.USDC
const LOGIUM_CORE = '0xc61d1dcceeec03c94d729d8f8344ce3be75d09fe'

async function tvl(api) {
  const owners = [LOGIUM_CORE]
  return sumTokens2({ api, owners, tokens: [USDC] })
}

module.exports = {
  ethereum: {
    tvl
  },
  deadFrom: '2023-11-15', // Project is put on hold: https://twitter.com/LogiumDEX/status/1724100314528092293
}