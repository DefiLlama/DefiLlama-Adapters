const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: { address: '0x5A0dea46A96a5b578c9cf1730f461eD0bC9C32c6' },
  aleph_zero: { address: '0x5A0dea46A96a5b578c9cf1730f461eD0bC9C32c6', tokens: [ADDRESSES.null, ADDRESSES.aleph_zero.WETH, ADDRESSES.aleph_zero.USDC, ADDRESSES.aleph_zero.USDT] }
}

const tvl = async (api) => {
  const { address, tokens = [] } = config[api.chain]
  if (!tokens.length) return sumTokens2({ owner: address, fetchCoValentTokens: true, api })
  return sumTokens2({ owner: address, tokens: tokens, api })
}

module.exports = {
  arbitrum: { tvl },
  aleph_zero: { tvl: () => ({ }) }
}