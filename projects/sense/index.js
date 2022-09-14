const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");

const DIVIDER = "0x1f3Af095CDa17d63cad238358837321e95FC5915";
const DIVIDER_INIT_BLOCK = 14427177;
const DIVIDER_INIT_TS = 1647831440;

async function tvl(timestamp, block, chainBlocks) {}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "",
  start: DIVIDER_INIT_TS,
  ethereum: {
    tvl,
  },
};
