const CONFIG = require('./config')

const beltView = '0xB543248F75fd9f64D10c247b5a57F142EFF88Aac'

const abi = {
  calcPoolValueInToken: "uint256:calcPoolValueInToken",
  token: "address:token",
  getStakingStat: "function getStakingStat() view returns (tuple(address token, address beltToken, uint256 totalLockedWant, uint256 tokenDecimal, uint256 beltTokenDecimal, uint256 beltTokenTotalSupply, uint256 lockUpPeriod, uint256 pricePerFullShare) info)"
}

const tvl = async (api) => {
  const tokens = await api.multiCall({ calls: CONFIG[api.chain], abi: abi.token, permitFailure: true })
  const suppliesInToken = await api.multiCall({ calls: CONFIG[api.chain], abi: abi.calcPoolValueInToken, permitFailure: true })
  // a vault whose valuation call reverts (two of the klaytn KLAY vaults) is skipped, the rest are still counted
  tokens.forEach((token, i) => {
    if (token && suppliesInToken[i]) api.add(token, suppliesInToken[i])
  })
}

const staking = async (api) => {
  const { token, pricePerFullShare, beltTokenTotalSupply } = await api.call({ target: beltView, abi: abi.getStakingStat })
  api.add(token, beltTokenTotalSupply * pricePerFullShare / 1e18)
}

module.exports = {
  methodology: 'TVL includes the liquidity of all the Vaults, 3Tether LP and staking counts the BELT that has been staked in BSC.',
  bsc: { tvl, staking },
  heco: { tvl },
  klaytn: { tvl }
}
