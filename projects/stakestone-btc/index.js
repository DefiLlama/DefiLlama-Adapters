const vaultABI = {
  "getDepositAmounts": "function getDepositAmounts() view returns (address[], uint256[])"
}

const VaultBSC = '0x3aa0670E24Cb122e1d5307Ed74b0c44d619aFF9b';

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
