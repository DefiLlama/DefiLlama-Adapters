const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  bsc: 'https://raw.githubusercontent.com/moonpotdev/moonpot-app/dev/src/config/vault/bsc.json',
  fantom: 'https://raw.githubusercontent.com/moonpotdev/moonpot-app/dev/src/config/vault/fantom.json',
  // polygon: 'https://raw.githubusercontent.com/moonpotdev/moonpot-app/dev/src/config/vault/polygon.json',
}
module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const endpoint = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getConfig('moonpot/' + api.chain, endpoint)
      const pools = data.map(i => i.prizePoolAddress).filter(i => i)
      const tokens = await api.multiCall({ abi: 'address:token', calls: pools })
      const bals = await api.multiCall({ abi: 'uint256:accountedBalance', calls: pools })
      api.addTokens(tokens, bals)
      return sumTokens2({ api, resolveLP: true, })
    }
  }
})