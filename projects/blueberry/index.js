const { compoundExports2 } = require('../helper/compound')
const abi = {
  "getNextPositionId": "function getNextPositionId() view returns (uint256)",
  "getPositionValue": "function getPositionValue(uint256 positionId) view returns (uint256)"
}
const sdk = require('@defillama/sdk');

const BANK = '0xa34F59F634d48E2c3606048f2367326c46a4B5fA';

async function tvl(timestamp, block, chainBlocks, {api}) {
  const positionValues = await api.fetchList({  lengthAbi: abi.getNextPositionId, itemAbi: abi.getPositionValue, target: BANK})
  api.addCGToken('tether', positionValues.reduce((acc, i) => acc + i/1e18, 0))
  return api.getBalances()
}

module.exports = {
  methodology: 'Gets the total value locked in the Blueberry Lending Market and Blueberry Earn',
  ethereum: compoundExports2({ comptroller: '0xcb0D9Ff5BDD34521c6f8CDbeAf15e1A76Fa4dd5D'}),
}

module.exports.ethereum.tvl = sdk.util.sumChainTvls([module.exports.ethereum.tvl, tvl])