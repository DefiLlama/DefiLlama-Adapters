async function tvl(api) {
  const farms = await api.call({ target: '0x45bC6B44107837E7aBB21E2CaCbe7612Fce222e0', abi: 'address[]:getFarmList', })
  const tokensAndBals = await api.multiCall({ calls: farms, abi: 'function getTokenAmounts() view returns (address[], uint256[])', })
  tokensAndBals.forEach(([t, b]) => api.add(t, b))
}

module.exports = {
  arbitrum: { tvl },
}