const VAULT_ADDRESS = '0xB91AE2c8365FD45030abA84a4666C4dB074E53E7';
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
