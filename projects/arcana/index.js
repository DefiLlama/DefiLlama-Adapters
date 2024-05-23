const ADDRESSES = require('../helper/coreAssets.json')
const arcUSD = ADDRESSES.real.arcUSD

module.exports = {
  misrepresentedTokens: true,
  real: { tvl }
}

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:circulatingSupply', target: arcUSD })
  api.addCGToken('tether', supply/1e18)
}