const { contracts } = require("./constants");
const { get4626VaultToken, getStrategyVaultValues, getVaultToken } = require("./helper");

/** find balance of vault's underlying assets (excl. lp & positions)  */
const getUnderlyingTokenBalance = async (api, vaultAddresses) => {
  const vaultTokens = await getVaultToken(api, vaultAddresses);
  return api.sumTokens({ tokensAndOwners2: [vaultTokens, vaultAddresses]})
}

// find the strategy's vault's lp value
const getStrategyVaultsLpValue = async (api, vaultAddresses) => {
  const vaultTokens = await get4626VaultToken(api, vaultAddresses);
  await api.sumTokens({ tokensAndOwners2: [vaultTokens, vaultAddresses]})
  const [tokens, balances] = await getStrategyVaultValues(api, vaultAddresses);
  api.addTokens(tokens, balances);
}

const aggregateVaultTvl = async (api) => {
  const { vaults, strategies } = contracts[api.chain];
  await getUnderlyingTokenBalance(api, vaults);
  await getStrategyVaultsLpValue(api, strategies);
}

const tvl = async (_, _1, _2, { api }) => {
  await aggregateVaultTvl(api);
  return api.getBalances();
}

module.exports = {
  doublecounted: true,
  start: 1693929600, // Tue Sep 05 2023 16:00:00 GMT+0000
  methodology: 'Hodlify TVL including total values of assets deposited in other protocols, and the petty cash in our earning vaults.',
  ethereum: { tvl},
  arbitrum: { tvl},
  optimism: { tvl},
  polygon: { tvl},
}