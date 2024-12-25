const vaultABI = {
  "getUnderlyings": "function getUnderlyings() external view returns (address[])"
}

const Vault = '0x8f88aE3798E8fF3D0e0DE7465A0863C9bbB577f0';

const Tvl = async (api) => {
  const underlyings = await api.call({ abi: vaultABI.getUnderlyings, target: Vault })
  return api.sumTokens({ owner: Vault, tokens: underlyings })
}

module.exports = {
  ethereum: {
    tvl: Tvl,
  }
}
