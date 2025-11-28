const ETH_VAULT_ADDRESS  = '0x7Dad75dD36dE234C937C105e652B6E50d68b0309';
const HYPER_VAULT_ADDRESS = '0x4a35e7448Dad9cAc6B3e529050B5a6Ee56A0eDF0'
const abi = {
  "paramsById": "function paramsById(uint48 vaultId) view returns ((address debtToken, address collateralToken, int8 leverageTier))"
}

async function tvl(target, api) {
  const res = await api.fetchList({ lengthAbi: 'numberOfVaults', itemAbi: abi.paramsById, target })
  const tokens = res.map(v => v.collateralToken)
  return api.sumTokens({ tokens, owner: target })
}

async function tvlEthereum(api) {
  return tvl(ETH_VAULT_ADDRESS, api)
}

async function tvlHyperEVM(api) {
  return tvl(HYPER_VAULT_ADDRESS, api)
}

module.exports = {
  methodology: "Token balance in the vault contract",
  ethereum: { tvl: tvlEthereum },
  hyperliquid: { tvl: tvlHyperEVM }
};
