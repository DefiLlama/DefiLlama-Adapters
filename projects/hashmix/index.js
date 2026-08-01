const POOL = "0x587A7eaE9b461ad724391Aa7195210e0547eD11d";
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { get } = require("../helper/http");

async function tvl(api) {
  let tvl = await get("https://fvm.hashmix.org/fevmapi/tvl");
  api.add(nullAddress, tvl.data);
  return sumTokens2({ api, owner: POOL, tokens: [nullAddress] });
}

module.exports = {
  methodology:
    "HashMix FIL Liquid Staking Protocol is a decentralized staking protocol on Filecoin, connecting FIL holders and miners in the ecosystem.",
  filecoin: {
    tvl,
  },
};
