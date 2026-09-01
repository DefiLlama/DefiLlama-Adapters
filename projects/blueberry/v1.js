const { compoundExports2 } = require('../helper/compound')
const abi = {
  "getNextPositionId": "function getNextPositionId() view returns (uint256)",
  "getPositionValue": "function getPositionValue(uint256 positionId) view returns (uint256)"
}
const sdk = require('@defillama/sdk');

const BANK = '0xa34F59F634d48E2c3606048f2367326c46a4B5fA';

async function tvl(timestamp, block, chainBlocks, {api}) {
  const positionValuesRes = await api.fetchList({  lengthAbi: abi.getNextPositionId, itemAbi: abi.getPositionValue, target: BANK, permitFailure: true})
  const positionValues = positionValuesRes.filter(value => value != null)
  api.addCGToken('tether', positionValues.reduce((acc, i) => acc + i/1e18, 0))
  return api.getBalances()
}

module.exports = {
  methodology: 'Gets the total value locked in blueberry v1',
  ethereum: compoundExports2({ comptroller: '0xcb0D9Ff5BDD34521c6f8CDbeAf15e1A76Fa4dd5D'}),
  deadFrom: '1753057413',
}

module.exports.ethereum.tvl = sdk.util.sumChainTvls([module.exports.ethereum.tvl, tvl])