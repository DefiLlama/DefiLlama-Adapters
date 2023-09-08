
const { getConfig } = require('../helper/cache')
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function tvl(_, _b, _cb, { api, }) {
  let data = await getConfig('circuit-fi', 'https://raw.githubusercontent.com/Circuit-Finance-Org/circuit-frontend-public/main/src/config/vault/mantle.json')
  const pools = data.map(i => i.earnContractAddress)
  const tokens = await api.multiCall({  abi: 'address:want', calls: pools})
  const bals = await api.multiCall({  abi: 'uint256:balance', calls: pools})
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  mantle: {
    tvl
  },
};
