const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const ADDRESSES = require('../helper/coreAssets.json')


const tokens = {
  USDC: ADDRESSES.sonic.USDC_e,
  scUSD: ADDRESSES.sonic.scUSD,
  wS: ADDRESSES.sonic.wS,
  stS: ADDRESSES.sonic.stS,

  RSV: "0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5",
  RZV_scUSD_LP:  "0x08c5e3b7533ee819a4d1f66e839d0e8f04ae3d0c",
}


const coreAddresses = {
  depositContract: "0xe22e10f8246dF1f0845eE3E9f2F0318bd60EFC85",
  stakingContract: "0xd060499DDC9cb7deB07f080BAeB1aDD36AA2C650",
}

const toa = [
  [tokens.USDC, coreAddresses.depositContract],
  [tokens.scUSD, coreAddresses.depositContract],
  [tokens.wS, coreAddresses.depositContract],
  [tokens.stS, coreAddresses.depositContract],
  [tokens.RSV, coreAddresses.depositContract],
  [tokens.RZV_scUSD_LP, coreAddresses.depositContract],
]


const pool2 = {
  depositContracts: [coreAddresses.depositContract],
  assets: [tokens.RZV_scUSD_LP]
}

const data = {
  sonic: {
    tvl: (api) => api.sumTokens({ tokensAndOwners: toa }),
    staking: staking(coreAddresses.stakingContract, tokens.RSV, "sonic"),
    pool2: pool2s(pool2.depositContracts, pool2.assets, "sonic"),
  }
};

module.exports = data;
