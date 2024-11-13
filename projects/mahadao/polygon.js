const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/unwrapLPs.js");

const chain = "polygon";

const polygon = {
  usdc: ADDRESSES.polygon.USDC,
  arthRedeemer: "0x394f4f7db617a1e4612072345f9601235f64b326",
};

async function tvl(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain];

  const tokensAndOwners = [
    // TVL contract that holds backing for polygon ARTH
    // https://polygonscan.com/address/0x394f4f7db617a1e4612072345f9601235f64b326
    [polygon.usdc, polygon.arthRedeemer],
  ];

  return sumTokens(balances, tokensAndOwners, block, chain);
}

module.exports = {
  tvl,
};
