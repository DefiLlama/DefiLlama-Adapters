const ARBITRUM = {
  vaults: ['0xb5AAa74CbA960D9Cbb6beE05e5435299308C682c'],
};
const AVALANCHE = {
  vaults: ['0x3B8Cfb57A87a091A90b5a3c00dF0F6EA0a371Ef7'],
};
const ETHEREUM = {
  vaults: ['0x0bCB75D9c5d4D33EE36bFeAfa94F8b75080b4387'],
}

function chainTvl(chain, config) {
  return async (api) => {
    const vaults = config.vaults;
    const tokens = await api.multiCall({  abi: 'address:want', calls: vaults})
    const vals = await api.multiCall({  abi: 'uint256:balance', calls: vaults})
    api.addTokens(tokens, vals)
    return api.getBalances()
  }
}

module.exports = {
  doublecounted: true,
  arbitrum: {
    tvl: chainTvl('arbitrum', ARBITRUM),
  },
  avax: {
    tvl: chainTvl('avax', AVALANCHE),
  },
  ethereum: {
    tvl: chainTvl('ethereum', ETHEREUM),
  },
  hallmarks: [
    [1677200400, "Vaults deprecated"]
  ],
  deadFrom: '2023-02-23',
};
