const { compoundExports2 } = require('../helper/compound')
const abi = {
  "getNextPositionId": "function getNextPositionId() view returns (uint256)",
  "getPositionValue": "function getPositionValue(uint256 positionId) view returns (uint256)"
}
const sdk = require('@defillama/sdk');

const BANK = '0x9b06eA9Fbc912845DF1302FE1641BEF9639009F7';

async function tvl(timestamp, block, chainBlocks, {api}) {
  const positionValues = await api.fetchList({  lengthAbi: abi.getNextPositionId, itemAbi: abi.getPositionValue, target: BANK})
  api.addCGToken('tether', positionValues.reduce((acc, i) => acc + i/1e18, 0))
  return api.getBalances()
}

module.exports = {
  methodology: 'Gets the total value locked in the Blueberry Lending Market and Blueberry Earn',
  ethereum: compoundExports2({ comptroller: '0xfFadB0bbA4379dFAbFB20CA6823F6EC439429ec2'}),
}

module.exports.ethereum.tvl = sdk.util.sumChainTvls([module.exports.ethereum.tvl, tvl])