const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const coresky_ETHEREUM = "0x179886f229f9cd52016c6dbf4be66e18111ec6ab";
const ConduitController = "0xcc599b117de4335ae9a9409567f489d99e9ebdd6";

module.exports = {
  methodology: `TVL for CORESKY consists of the staking of CORESKY.`,
  ethereum:{
    tvl: () => ({}),
    staking: staking(ConduitController, coresky_ETHEREUM, "ethereum"),
  }
}
