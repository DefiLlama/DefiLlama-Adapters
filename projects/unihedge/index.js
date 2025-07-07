const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  owner: '0xdD90A0504aA3215Dd0E7fb45471A0B133CC3f567', // UniHedge contract
  token: ADDRESSES.polygon.USDC_CIRCLE // USDC
}

const tvl = async (api) => {
  const { owner, token } = config
  return api.sumTokens({ token, owner })
}

module.exports = {
  methodology: "TVL is calculated by summing the DAI (accounting token) locked in the UniHedge contract.",
  polygon: { tvl }
}
