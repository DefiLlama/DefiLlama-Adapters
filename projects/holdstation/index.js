const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const vault = "0xaf08a9d918f16332F22cf8Dc9ABE9D9E14DdcbC2";
const usdc = ADDRESSES.era.USDC;

async function tvl(_, _b, _cb, { api }) {
  return sumTokens2({ api, tokens: [usdc], owners: [vault] });
}

module.exports = {
  era: {
    tvl,
  },
};
