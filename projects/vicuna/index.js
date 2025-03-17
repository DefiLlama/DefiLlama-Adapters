const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  sonic: {
    tvl: async (api) => {
      const pools = await getConfig('vicuna', 'https://raw.githubusercontent.com/VicunaFinance-com/vicuna-frontend/refs/heads/main/config/sonic.json');

      // Extract earnedTokenAddress from each pool
      const vaults = pools.map(pool => pool.vaultAddress)
      const tokens = await api.multiCall({ abi: 'address:want', calls: vaults })
      const balances = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
      api.add(tokens, balances)
      return sumTokens2({ resolveLP: true, api, resolveIchiVault: true, })
    }
  }
}