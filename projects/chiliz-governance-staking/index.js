const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");
const STAKING_CONTRACT = '0x0000000000000000000000000000000000001000';

module.exports = {
  methodology: 'Total CHZ Locked in Staking System Contract.',
  chz: {
    tvl: sumTokensExport({ owner: STAKING_CONTRACT, tokens: [nullAddress] }),
  }
}