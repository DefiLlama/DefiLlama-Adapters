const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const ADDRESSES = require('../helper/coreAssets.json')


const tokens = {
  USDC: ADDRESSES.sonic.USDC_e,
  scUSD: ADDRESSES.sonic.scUSD,

  DRE: "0xd4eee4c318794bA6FFA7816A850a166FFf8310a9",
  DRE_USDC_LP:  "0x18b6963ebe82b87c338032649aaad4eec43d3ecb",
  DRE_scUSD_LP:  "0x88640D840614BB63cfb1545897D6d228B381C659",

  DRE_Old: '0xF8232259D4F92E44eF84F18A0B9877F4060B26F1',
  DRE_USDC_LP_Old:  "0xB781C624397C423Cb62bAe9996cEbedC6734B76b",
}

const coreAddresses_Old = {
  depositContract: "0xb692e2706b628998B4403979D9117Ed746bf8128",
  stakingContract: "0x30902d05C499911142FE62B447dDcf19649452A3",
  dreBondDepository: "0x2CE3618aa69ab891eeae4a18e64aaA55624a4481",
  dreOracle: "0xc3bAdcf754b0833c706Eb1b12A310B4EF5C20EB0",
}

const coreAddresses = {
  depositContract: "0xc589858dA047A4789e099FA2CfD1D974D14F344B",
  stakingContract: "0x21Cfa934CEa191fBD874ee8B1B6CE2B2224De653",
  dreBondDepository: "0x825A2bC06A56E556138513495b3332933c371980",
  dreOracle: "0xd23E9485b76E43d8808B0eCE846D0db3bCb09B93",
}

const toa = [
  [ADDRESSES.sonic.USDC_e, coreAddresses.depositContract],
  [ADDRESSES.sonic.scUSD, coreAddresses.depositContract],
  [tokens.DRE, coreAddresses.depositContract],
  [tokens.DRE_USDC_LP, coreAddresses.depositContract],
  [tokens.DRE_scUSD_LP, coreAddresses.depositContract],

  [tokens.DRE_Old, coreAddresses_Old.depositContract],
  [tokens.DRE_USDC_LP_Old, coreAddresses_Old.depositContract],
]


const pool2 = {
  depositContracts: [coreAddresses.depositContract, coreAddresses_Old.depositContract],
  assets: [tokens.DRE_USDC_LP, tokens.DRE_USDC_LP_Old, tokens.DRE_scUSD_LP]
}

const data = {
  sonic: {
    tvl: (api) => api.sumTokens({ tokensAndOwners: toa }),
    staking: staking(coreAddresses.stakingContract, tokens.DRE, "sonic"),
    pool2: pool2s(pool2.depositContracts, pool2.assets, "sonic"),
  }
};

module.exports = data;
