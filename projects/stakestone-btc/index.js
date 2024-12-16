const vaultABI = {
  "getDepositAmounts": "function getDepositAmounts() view returns (address[], uint256[])"
}

const VaultBSC = '0x3aa0670E24Cb122e1d5307Ed74b0c44d619aFF9b';
const VaultETH = '0x7dBAC0aA440A25D7FB43951f7b178FF7A809108D';

const bscTvl = async (api) => {
  const [btclist] = await api.call({ abi: vaultABI.getDepositAmounts, target: VaultBSC })
  return api.sumTokens({ owner: VaultBSC, tokens: btclist })
}

const ethTvl = async (api) => {
  const [btclist] = await api.call({ abi: vaultABI.getDepositAmounts, target: VaultETH })
  return api.sumTokens({ owner: VaultETH, tokens: btclist })
}

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  ethereum: {
    tvl: ethTvl,
  }
}
