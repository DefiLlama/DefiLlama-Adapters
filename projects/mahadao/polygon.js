const { sumTokens } = require("../helper/unwrapLPs.js");

const chain = "polygon";

const polygon = {
  usdc: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
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
