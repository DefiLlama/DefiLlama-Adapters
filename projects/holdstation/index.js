const { sumTokens2 } = require("../helper/unwrapLPs");

const vault = "0xaf08a9d918f16332F22cf8Dc9ABE9D9E14DdcbC2";
const usdc = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";

async function tvl(_, _b, _cb, { api }) {
  return sumTokens2({ api, tokens: [usdc], owners: [vault] });
}

module.exports = {
  era: {
    tvl,
  },
};
