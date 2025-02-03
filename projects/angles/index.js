const ADDRESSES = require('../helper/coreAssets.json')

const SONIC_SFC_CONTRACT = '0xFC00FACE00000000000000000000000000000000'
const vault = '0xe5203Be1643465b3c0De28fd2154843497Ef4269'
const S = ADDRESSES.null

const abis = {
  validatorsIndexed: "function validatorsIndexed(uint256) view returns (uint256 validatorId, uint8 weight, uint256 limit, uint256 SInTransit)",
  numberOfValidators: "function numberOfValidators() view returns (uint256)",
  getStake: "function getStake(address delegator, uint256 validatorID) view returns (uint256 stake)"
}

const tvl = async (api) => {
  const validators = await api.fetchList({ target: vault, lengthAbi: abis.numberOfValidators, itemAbi: abis.validatorsIndexed })
  const validatorsBalances = await api.multiCall({ calls: validators.map(({ validatorId }) => ({ target: SONIC_SFC_CONTRACT, params: [vault, validatorId] })), abi: abis.getStake })
  api.add(S, validatorsBalances)
}

module.exports = {
  sonic: { tvl }
}
