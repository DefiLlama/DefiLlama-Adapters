const { getConfig } = require('../helper/cache');

const STAKING_VAULT_CONTRACT = "0xe4a4d891f02DF7bFFc5ff9e691313DE8a9E76b91";
const CBL_TOKEN = "0xD6b3d81868770083307840F513A3491960b95cb6";

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
  const tBals = (await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: vaults[i] })) })).map(i => i * -1)
  api.add(tokens, tBals)
}

async function stakedCbl(api) {
  const bals = await api.multiCall({ abi: 'address:totalAssets', calls: [STAKING_VAULT_CONTRACT,] })
  api.add(CBL_TOKEN, bals)
}

module.exports = {
  methodology: 'TVL consist of the sum of every deposit of all vaults for a given asset.',
  btr: { tvl, borrowed, },
  arbitrum: { tvl, borrowed, staking: stakedCbl },
};
