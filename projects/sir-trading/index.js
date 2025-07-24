const VAULT_ADDRESS = '0x7Dad75dD36dE234C937C105e652B6E50d68b0309';
const abi = {
  "paramsById": "function paramsById(uint48 vaultId) view returns ((address debtToken, address collateralToken, int8 leverageTier))"
}

async function tvl(api) {
  const res = await api.fetchList({ lengthAbi: 'numberOfVaults', itemAbi: abi.paramsById, target: VAULT_ADDRESS })
  const tokens = res.map(v => v.collateralToken)
  return api.sumTokens({ tokens, owner: VAULT_ADDRESS })
}

module.exports = {
  methodology: "Token balance in the vault contract",
  ethereum: { tvl }
};
