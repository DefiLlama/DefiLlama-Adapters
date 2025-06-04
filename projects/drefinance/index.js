const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const ADDRESSES = require('../helper/coreAssets.json')


const tokens = {
  USDC: ADDRESSES.sonic.USDC_e,
  DRE: "0xd4eee4c318794bA6FFA7816A850a166FFf8310a9",
  DRE_USDC_LP:  "0x18b6963ebe82b87c338032649aaad4eec43d3ecb",
}

const coreAddresses = {
  depositContract: "0xc589858dA047A4789e099FA2CfD1D974D14F344B",
  stakingContract: "0x21Cfa934CEa191fBD874ee8B1B6CE2B2224De653",
  dreBondDepository: "0x825A2bC06A56E556138513495b3332933c371980",
  dreOracle: "0xd23E9485b76E43d8808B0eCE846D0db3bCb09B93",
}

async function tvl(api) {
  const toa = [
    [ADDRESSES.sonic.USDC_e, coreAddresses.depositContract],
    [tokens.DRE, coreAddresses.depositContract],
    [tokens.DRE_USDC_LP, coreAddresses.depositContract],
  ]

  return api.sumTokens({ tokensAndOwners: toa })
}


const data = {
  sonic: {
    tvl: tvl,
    staking: staking(coreAddresses.stakingContract, tokens.DRE, "sonic"),
    pool2: pool2s([coreAddresses.depositContract], [tokens.DRE_USDC_LP], "sonic"),
  }
};

module.exports = data;
