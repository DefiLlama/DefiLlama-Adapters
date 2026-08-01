const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

const contractAddress = '0x3C486b7178Eb71d50D060Dd02602aBfAcB88EA21'; // UniHedge contract
const accountingToken = ADDRESSES.polygon.USDC_CIRCLE; // USDC token on Polygon
const chain = 'polygon';

async function tvl(_, _1, _2, { api }) {
  return sumTokens2({ api, tokens: [accountingToken], owners: [contractAddress] });
}

module.exports = {
  methodology: "TVL is calculated by summing the DAI (accounting token) locked in the UniHedge contract.",
  polygon: {
    tvl,
  },
};
