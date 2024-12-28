
const { getConfig } = require('./helper/cache')
const { sumUnknownTokens } = require('./helper/unknownTokens')

async function tvl(api) {
  let data = await getConfig('goosedefi', 'https://api.goosedefi.com/vaults/getGusdVaultsData')
  const pools = data.map(i => i.stratAddress)
  const tokens = data.map(i => i.stakeTokenAddress)
  // const tokens = await api.multiCall({  abi: 'address:pairAddress', calls: pools})
  const bals = await api.multiCall({  abi: 'uint256:wantLockedTotal', calls: pools})
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {    tvl  },
};
