const { sumTokensExport } = require('../helper/unwrapLPs')

const STAKING_SNRK_CONTRACT = "0xEbA49A81501b036234578D10e78685ca8BbD2901";
const SNRK_TOKEN = "0x533b5F887383196C6bc642f83338a69596465307";

module.exports = {
  methodology: 'TVL for SNRK staking is computed by summing the balance of SNRK tokens held by the staking contract.',
  era: {
    staking: sumTokensExport({ owners: [STAKING_SNRK_CONTRACT], tokens: [SNRK_TOKEN] }),
    tvl: () => 0,
  },
}
