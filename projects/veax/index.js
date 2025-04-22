const { sumTokens, call,  } = require('../helper/chain/near')

const tvl = async (api) => {
  const contract = 'veax.near'
  const tokens = await call(contract, 'get_verified_tokens')
  return sumTokens({ owners: [contract], tokens: tokens.filter(i => i !== 'aurora')})
}

module.exports = {
  timetravel: false,
  near: {
    tvl,
  }
}