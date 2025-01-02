const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/unwrapLPs.js");

const chain = "bsc";

const bsc = {
  busd: ADDRESSES.bsc.BUSD,
  arth: "0x85daB10c3BA20148cA60C2eb955e1F8ffE9eAa79",

  arthBusdPool: "0x21de718bcb36f649e1a7a7874692b530aa6f986d",
};

async function pool2(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain];

  const tokensAndOwners = [
    // ARTH/BUSD Ellipsis pool
    // https://ellipsis.finance/pool/0x21dE718BCB36F649E1A7a7874692b530Aa6f986d
    // Stablecoin part of the pool
    [bsc.busd, bsc.arthBusdPool],
    [bsc.arth, bsc.arthBusdPool],
  ];

  return sumTokens(balances, tokensAndOwners, block, chain);
}

module.exports = {
  pool2,
};
