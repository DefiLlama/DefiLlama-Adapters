const { getConfig } = require("../helper/cache");

// teahouse public api for vault
const teahouseVaultAPI = "https://raw.githubusercontent.com/TeahouseFinance/Vaults-for-DeFiLlama/main/vaults.json";

const chains = ["ethereum", "optimism", "arbitrum", 'polygon','bsc', 'sei'];

const abis = {
  "globalState": "function globalState() view returns (uint128 depositLimit, uint128 lockedAssets, uint32 cycleIndex, uint64 cycleStartTimestamp, uint64 fundingLockTimestamp, bool fundClosed)",
  "cycleState": "function cycleState(uint32) view returns (uint128 totalFundValue, uint128 fundValueAfterRequests, uint128 requestedDeposits, uint128 convertedDeposits, uint128 requestedWithdrawals, uint128 convertedWithdrawals)",
  "asset": "function asset() view returns (address assetTokenAddress)",
  "latestAnswer": "function latestAnswer() view returns (int256)"
}

const tvl = async (api) => {
  const { vaults } = await getConfig("teahouse/vault_data", teahouseVaultAPI)
  const chainVaults = vaults.filter(vault => !vault.isDeFi && vault.isActive && vault.chain === api.chain).map(vault => vault.share.address)
  const tokens = await api.multiCall({ abi: 'address:asset', calls: chainVaults })
  const cycleIndices = (await api.multiCall({ abi: abis.globalState, calls: chainVaults })).map((i) => Math.max(0, i.cycleIndex-1))
  const balances = (await api.multiCall({ abi: abis.cycleState, calls: chainVaults.map((vault, i) => ({ target: vault, params: cycleIndices[i]})) })).map((i) => i.fundValueAfterRequests)
  api.addTokens(tokens, balances)
  if (api.chain === 'bsc') {
    const tvl = await api.getUSDValue()
    if (+tvl === 0) throw new Error('tvl is 0 Balances:' + JSON.stringify(api.getBalances()))
  }
}

module.exports.misrepresentedTokens = true
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})


