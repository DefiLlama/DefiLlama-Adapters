const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x652A6F3459B276887bf2Fe9fb0FF810c9B24e1E3";
const BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const RaStaking = "0xf45aE86eD6C7d7A6b6C4640e04FEc228641D4C64";
const RA = "0xcc238200cFfdA7A5E2810086c26d5334e64F1155";

const RA_BUSD_POOL = "0xE8C6539663973E892C21652be80cdeE9a62e67BC";
module.exports = ohmTvl(treasuryAddress, [
  [BUSD, false],
  [RA_BUSD_POOL, true],
], "bsc", RaStaking, RA, undefined, undefined, false)
