const abi = {
    "getFarms": "address[]:getFarms",
    "want": "address:want",
    "stakedWant": "uint256:stakedWant"
  };
const { pool2 } = require("../helper/pool2");
const { sumTokens2, } = require("../helper/unwrapLPs");

const croblancAlpha = "0x52a87ef19e4a0E8cc70aE69D22bc8254bc6fa0F9";

const pool2Farm = "0x4c1EC4Bf75CdFAF9b172e94cc85b7a8eA647F267";
const WCRO_CROBLANC_CronaLP = ["0xac23a7de083719c0e11d5c2efbcc99db5c73bb48"].map(addr => addr.toLowerCase())

const cronosTvl = async (api) => {
  const calls = await api.call({  abi: abi.getFarms, target: croblancAlpha})
  const tokens  = await api.multiCall({  abi: abi.want, calls})
  const staked = await api.multiCall({  abi: abi.stakedWant, calls})
  api.add(tokens, staked)
  return sumTokens2({ api, resolveLP: true})
};

module.exports = {
  misrepresentedTokens: true,
  cronos: {
    pool2: pool2(pool2Farm, WCRO_CROBLANC_CronaLP[0]),
    tvl: cronosTvl,
  },
  methodology:
    "Counts liquidity on all the Farms through CroblancAlpha Contract",
};
