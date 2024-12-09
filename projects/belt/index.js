const CONFIG = require('./config')

const beltView = {
  bsc: '0xB543248F75fd9f64D10c247b5a57F142EFF88Aac',
  heco: '0x4A971318e2b1ea1A08bC713eEFF9118Cd2F85803'
}

const abi = {
  calcPoolValueInToken: "uint256:calcPoolValueInToken",
  token: "address:token",
  getStakingStat: "function getStakingStat() view returns (tuple(address token, address beltToken, uint256 totalLockedWant, uint256 tokenDecimal, uint256 beltTokenDecimal, uint256 beltTokenTotalSupply, uint256 lockUpPeriod, uint256 pricePerFullShare) info)"
}

const tvl = async (api) => {
  const tokens = await api.multiCall({ calls: CONFIG[api.chain], abi: abi.token })
  const suppliesInToken = await api.multiCall({ calls: CONFIG[api.chain], abi: abi.calcPoolValueInToken })
  api.add(tokens, suppliesInToken)
}

const staking = async (api) => {
  const { token, pricePerFullShare, beltTokenTotalSupply } = await api.call({ target: beltView[api.chain], abi: abi.getStakingStat })
  api.add(token, beltTokenTotalSupply * pricePerFullShare / 1e18)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL includes the liquidity of all the Vaults, 3Tether LP and staking counts the BELT that has been staked in BSC.',
  bsc: { tvl, staking },
  heco: { tvl, staking },
  klaytn: { tvl }
}