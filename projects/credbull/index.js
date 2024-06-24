const { getConfig } = require('../helper/cache');

async function tvl(api) {
  let vaults = await getConfig('credbull', "https://incredbull.io/api/vaults")
  vaults = vaults[api.chain]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
}

async function borrowed(api) {
  let vaults = await getConfig('credbull', "https://incredbull.io/api/vaults")
  vaults = vaults[api.chain]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'address:totalAssets', calls: vaults })
  api.add(tokens, bals)
  const tBals = (await api.multiCall({  abi: 'erc20:balanceOf', calls: tokens.map((t,i) => ({ target: t, params: vaults[i] })) })).map(i => i * -1)
  api.add(tokens, tBals)
}

module.exports = {
  methodology: 'TVL consist of the sum of every deposit of all vaults for a given asset.',
  btr: { tvl, borrowed, },
};
