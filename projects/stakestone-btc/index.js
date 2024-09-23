const vaultABI = {
  "getDepositAmounts": "function getDepositAmounts() view returns (address[], uint256[])"
}

const VaultBSC = '0xc6f830BB162e6CFb7b4Bac242B0E43cF1984c853';

const bscTvl = async (api) => {
  const [btclist] = await api.call({ abi: vaultABI.getDepositAmounts, target: VaultBSC })
  return api.sumTokens({ owner: VaultBSC, tokens: btclist })
}

module.exports = {
  start: 42326440,
  bsc: {
    tvl: bscTvl,
  }
}
