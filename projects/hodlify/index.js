const { getUniqueAddresses } = require("../helper/tokenMapping");
const { contracts } = require("./constants");
const { get4626VaultToken, getStrategyVaultValues, getVaultToken } = require("./helper");

/** find balance of vault's underlying assets (excl. lp & positions)  */
const getUnderlyingTokenBalance = async (api, vaultAddresses) => {
  const vaultTokens = await getVaultToken(api, vaultAddresses);
  return api.sumTokens({ tokensAndOwners2: [vaultTokens, vaultAddresses] })
}

// find the strategy's vault's lp value
const getStrategyVaultsLpValue = async (api, vaultAddresses) => {
  const vaultTokens = await get4626VaultToken(api, vaultAddresses);
  await api.sumTokens({ tokensAndOwners2: [vaultTokens, vaultAddresses] })
  const [tokens, balances] = await getStrategyVaultValues(api, vaultAddresses);
  api.addTokens(tokens, balances);
}

const fetchStrategyAddresses = async (api, vaultAddresses) => {
  const addresses = await api.multiCall({
    calls: vaultAddresses,
    abi: 'address:strategy',
  });

  return getUniqueAddresses(addresses);
}

const filterAvailableVault = async (api, vaultAddresses) => {
  const available = await api.multiCall({
    calls: vaultAddresses,
    abi: 'address:token',
    permitFailure: true,
  });
  
  return vaultAddresses.filter((_, i) => available[i] != null)
}

const aggregateVaultTvl = async (api) => {
  const { vaults, } = contracts[api.chain];
  // check is available
  const availableVaults = await filterAvailableVault(api, vaults);
  const strategies = await fetchStrategyAddresses(api, availableVaults);
  await getUnderlyingTokenBalance(api, availableVaults);
  await getStrategyVaultsLpValue(api, strategies);
}

const tvl = async (api) => {
  await aggregateVaultTvl(api);
  return api.getBalances();
}

module.exports = {
  doublecounted: true,
  start: 1693929600, // Tue Sep 05 2023 16:00:00 GMT+0000
  methodology: 'Hodlify TVL including total values of assets deposited in other protocols, and the petty cash in our earning vaults.',
  arbitrum: { tvl },
  optimism: { tvl },
  polygon: { tvl },
}