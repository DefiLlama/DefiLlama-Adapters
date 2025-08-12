const vaultABI = {
  "getUnderlyings": "function getUnderlyings() external view returns (address[])"
}

const Vault = '0x1fC603779DC6b4866769A58067777D2C52628226';

const Tvl = async (api) => {
  const btclist = await api.call({ abi: vaultABI.getUnderlyings, target: Vault })
  return api.sumTokens({ owner: Vault, tokens: btclist })
}

module.exports = {
  ethereum: {
    tvl: Tvl,
  }
}
