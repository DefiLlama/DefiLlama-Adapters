const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const tvl = async (api) => {
  const contracts = await getConfig('iotabee', 'https://dex.iotabee.com/v3/pools/overview')
  return sumTokens2({ api, ownerTokens: contracts.map(({ token0, token1, contract }) => [[token0, token1,], contract]) })
}

module.exports = {
  shimmer_evm: {
    tvl
  }
}
