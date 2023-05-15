const { sumTokens, call,  } = require('../helper/chain/near')

const tvl = async (_, _1, _2, { api }) => {
  const contract = 'veax.near'
  const tokens = await call(contract, 'get_verified_tokens')
  return sumTokens({ owners: [contract], tokens})
}

module.exports = {
  timetravel: false,
  near: {
    tvl,
  }
}