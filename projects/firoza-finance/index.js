const { getConfig } = require('../helper/cache')
const { sumERC4626Vaults } = require('../helper/erc4626');
const { sumTokens2 } = require('../helper/unwrapLPs');

const POOL_API_URL = "https://firoza.finance/api/pools";

async function tvl(api) {
  const poolAddresses = await getConfig('firoza', POOL_API_URL);
  const assets = await api.multiCall({  abi: 'address:asset', calls: poolAddresses})
  return sumTokens2({ api, tokensAndOwners2: [assets, poolAddresses] })
}

async function borrowed(api) {
  const poolAddresses = await getConfig('firoza', POOL_API_URL);
  const assets = await api.multiCall({  abi: 'address:asset', calls: poolAddresses})
  await sumERC4626Vaults({ api, calls: poolAddresses, isOG4626: true, });
  const calls = assets.map((target, i) => ({ target, params: poolAddresses[i] }));
  const tokenBals = await api.multiCall({  abi: 'erc20:balanceOf', calls })
  tokenBals.forEach((bal, i) => api.add(assets[i], bal * -1))
  return sumTokens2({ api })
}


module.exports = {
  methodology: "TVL counts the tokens deposited in the Firoza Finance pools.",
  islm: { 
    tvl, 
    borrowed: () => ({}),
  },
  hallmarks: [
    [1688169600, "Launch on ISLM"]
  ],
  deadFrom: '2025-02-09',
};