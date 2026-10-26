const ADDRESSES = require('../helper/coreAssets.json')

const XTC = '0xe45fe733bc8617fa6dac8437fc44b5fffa949991'
const VAULT = '0x7396C304bC7Ba6B169F8aC230C9e63Da8B77Fd15'
const MARKET = '0x0ea3df26F143017d4057B69734F9a99446C636FC'

const stateAbi = 'function state() view returns (tuple(uint256 reserve, uint256 streamRemaining, uint256 streamEnd, uint256 emissionPerSecond, uint256 streamPerSecond, uint256 totalWeight, uint256 totalPrincipal, uint256 totalUnclaimed, uint256 xtcHeld, uint256 lastPositionId, uint256 feedLength))'

// CRO held by the Market for sellers who have not withdrawn it yet
async function tvl(api) {
  return api.sumTokens({ owners: [MARKET], tokens: [ADDRESSES.null] })
}

// totalPrincipal = XTC of all open positions, including the ones listed on the Market (they stay in the Vault).
// The reward reserve and the unclaimed rewards held by the Vault are left out.
async function staking(api) {
  const { totalPrincipal } = await api.call({ target: VAULT, abi: stateAbi })
  api.add(XTC, totalPrincipal)
}

module.exports = {
  methodology: 'TVL counts the CRO held by the Xitcoin Market (payments for sold positions not yet withdrawn by their sellers). Staking counts the XTC locked by users in the Xitcoin Vault (totalPrincipal of the open positions), including the positions listed for sale on the Xitcoin Market. The XTC reward reserve and the unclaimed rewards held by the Vault are not counted.',
  start: '2026-10-08',
  cronos: {
    tvl,
    staking,
  },
}
