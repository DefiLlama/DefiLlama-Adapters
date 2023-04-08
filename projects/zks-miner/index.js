const { nullAddress } = require('../helper/tokenMapping');
const { sumTokensExport } = require('../helper/unwrapLPs')

const SILVER_MINER = "0x0A23aF664eFA875B36f8e82e1D52FBaE34607928";
const DIAMOND_MINER = "0xF375De0ceeA7ED48D1074b777Fc37e7978f7Ba80";
const GOLD_MINER = "0x654Fd3efc9475B57a92c3ac7f9EB58735C73592f";

module.exports = {
  methodology: 'TLV silver, diamond and gold is total amount miner deposit to contract silver, diamond and gold',
  era: {
    tvl: sumTokensExport({ owners: [SILVER_MINER, DIAMOND_MINER, GOLD_MINER,], tokens: [nullAddress] })
  },
}
