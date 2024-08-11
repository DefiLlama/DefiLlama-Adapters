const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");
const STAKING_CONTRACT = ADDRESSES.findora.FRA;

module.exports = {
  methodology: 'Total CHZ Locked in Staking System Contract.',
  chz: {
    tvl: sumTokensExport({ owner: STAKING_CONTRACT, tokens: [nullAddress] }),
  }
}