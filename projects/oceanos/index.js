const poolAddresses = [
  '0xD50766f79Ecef0BA96E1d7DD7ccB56E1b2Ba1120', // eth,
  '0x2F453e781E3A474290fad60a22fEa6f155B69fBD', // usdc
  '0x836280846adc84f28918Cec30A7dCe791D17b72C', // wsteth
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:collateralAsset', calls: poolAddresses })
  return api.sumTokens({ tokensAndOwners2: [tokens, poolAddresses] })
}

module.exports = {
  manta: { tvl }
}