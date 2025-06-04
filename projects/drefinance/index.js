const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const ADDRESSES = require('../helper/coreAssets.json')


const tokens = {
  USDC: ADDRESSES.sonic.USDC_e,
  DRE: "0xF8232259D4F92E44eF84F18A0B9877F4060B26F1",
  DRE_USDC_LP:  "0xB781C624397C423Cb62bAe9996cEbedC6734B76b",
}

const coreAddresses = {
  depositContract: "0xb692e2706b628998B4403979D9117Ed746bf8128",
  stakingContract: "0x30902d05C499911142FE62B447dDcf19649452A3",
  dreBondDepository: "0x2CE3618aa69ab891eeae4a18e64aaA55624a4481",
  dreOracle: "0xc3bAdcf754b0833c706Eb1b12A310B4EF5C20EB0",
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
