const CONFIG = {
  ethereum: '0x7Dad75dD36dE234C937C105e652B6E50d68b0309',
  hyperliquid: '0x4a35e7448Dad9cAc6B3e529050B5a6Ee56A0eDF0',
  megaeth: '0x8d694D1b369BdE5B274Ad643fEdD74f836E88543'
}

const PARAMS_BY_ID = "function paramsById(uint48 vaultId) view returns ((address debtToken, address collateralToken, int8 leverageTier))"

const tvl = async (api) => {
  const contract = CONFIG[api.chain]
  const res = await api.fetchList({ lengthAbi: 'numberOfVaults', itemAbi: PARAMS_BY_ID, target: contract })
  const tokens = res.map(v => v.collateralToken)
  return api.sumTokens({ tokens, owner: contract })
}

Object.keys(CONFIG).forEach(chain => module.exports[chain] = { tvl })
