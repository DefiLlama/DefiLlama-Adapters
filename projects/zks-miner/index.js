const { nullAddress } = require('../helper/tokenMapping');
const { sumTokensExport } = require('../helper/unwrapLPs')

const SILVER_MINER = "0x0B78a504D62391A1cBe92db6de4E4A1d5AE87732";
const DIAMOND_MINER = "0x755747467d97619a670e228eBEc8eFE285c37F01";
const GOLD_MINER = "0x340e443C85ecd7eB1E918744D4A35A1e6101bbd4";

module.exports = {
  hallmarks: [
    [1682726400, "Rug Pull"]
  ],
  methodology: 'TLV silver, diamond and gold is total amount miner deposit to contract silver, diamond and gold',
  era: {
    tvl: sumTokensExport({ owners: [SILVER_MINER, DIAMOND_MINER, GOLD_MINER,], tokens: [nullAddress] })
  },
}
