const { getConfig } = require('../helper/cache')
const HOST = 'https://api2.lessgas.xyz'

const staking = async (api) => {
  let { data: { result } } = await getConfig('lessgas', `${HOST}/llama/staking`)
  const tokensAndOwners = result.map(i => [i[1], i[0]])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: "Get the amount of tokens in lessgas platform",
  map: {
    tvl: () => ({}),
    staking,
  }
};
