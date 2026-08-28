const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const constants = {
  addresses: {
    boba: {
      treasury: "0x559dBda9Eb1E02c0235E245D9B175eb8DcC08398",
      staking: "0xD3535a7797F921cbCD275d746A4EFb1fBba0989F",
      feeCollector: "0xc9453BaBf4705F18e3Bb8790bdc9789Aaf17c2E1",
      tokens: {
        KYO: "0x618CC6549ddf12de637d46CDDadaFC0C2951131C",
        BREW: "0x3a93bd0fa10050d206370eea53276542a105c885",
        BOBA: ADDRESSES.boba.BOBA,
        FRAX: ADDRESSES.boba.FRAX,
        USDC: ADDRESSES.boba.USDC,
        USDT: ADDRESSES.boba.USDT,
        DAI: ADDRESSES.boba.DAI,
      },
      vault: '0x2a4409cc7d2ae7ca1e3d915337d1b6ba2350d6a3',
    },
    ethereum: {
      treasury: "0x47BbF992a25B7fe1D532F8128D514524462731eF",
      USDC: ADDRESSES.ethereum.USDC,
    }
  },
};
// const { onChainTvl } = require("../helper/balancer");
const { sumTokensExport } = require("../helper/unwrapLPs");


module.exports = {
  boba: {
    // tvl: onChainTvl(constants.addresses.boba.vault, 668337),
    tvl: sumTokensExport({ owner: constants.addresses.boba.vault, tokens: Object.values(constants.addresses.boba.tokens)}),
    staking: staking(constants.addresses.boba.staking, constants.addresses.boba.tokens.KYO),
  },
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  hallmarks: [
    ['2022-06-28', "Boba adds to FRAX-USDC"],
    ['2022-07-21', "Boba removes from FRAX-USDC"],
    ['2022-07-29', "Boba adds to USDC-DAI"],
    ['2022-10-14', "Boba removes from USDC-DAI"]
  ],
};
