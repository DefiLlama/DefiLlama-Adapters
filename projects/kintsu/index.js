const vaults = {
  monad: '0xA3227C5969757783154C60bF0bC1944180ed81B9',
  hyperliquid: '0xDDC126c12F9F8DF5a6fC273f6D43C1E21b4d2945',
}

async function tvl(api) {
  // Fetch the total pooled native token from the vault contract
  const nativeTokenStaked = await api.call({ abi: 'uint96:totalPooled', target: vaults[api.chain], });
  api.addGasToken(nativeTokenStaked);
}

module.exports = {
  methodology: 'TVL is calculated as total MON, HYPE under management by sMON, sHYPE vault contract: batched deposits, staked, but excluding MON, HYPE being unbonded.',
  monad: { tvl },
  hyperliquid: { tvl },
}
