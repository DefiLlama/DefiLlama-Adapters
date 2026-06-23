const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0x19798E390E69a36814B25BbBC7e75530E8a0A101'

const abi = {
  bondingCurveMap: "function bondingCurveMap(address) view returns (address)",
  getReserves: "function getReserves() view returns (uint256 _reserveEth, uint256 _reserveToken)",
  Deployed: "event Deployed(address indexed token, address indexed bondingCurve, address indexed creator, uint256 timestamp)",
}

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: 36935850,
    eventAbi: abi.Deployed,
  })

  const bondingCurves = logs.map(i => i.bondingCurve)
  return api.sumTokens({ owners: bondingCurves, tokens: [ADDRESSES.null] })
}

module.exports = {
  methodology: 'Counts ETH in bonding curves',
  start: 1750043447,
  base: { tvl }
}
