const {sumTokensExport, nullAddress} = require('../helper/unwrapLPs')

module.exports = {
  methodology: "Counts native BDAG locked in the BondingCurve contract as TVL, and Token999 (999) staked in the Staking999 contract.",
  blockdag: {
    tvl: sumTokensExport({ owner: "0x0b6A9622fdC63B2aB23494b79d8e1816E572969C", tokens: [nullAddress] }),
    staking: sumTokensExport({ owner: "0x5fc9Cfb37f8Fd15BDBfeD8732cE247815b36eD9f", tokens: ["0x1667810674ebA5aEf308CE6cC53cf4C6CfF5E94f"] }),
  },
};