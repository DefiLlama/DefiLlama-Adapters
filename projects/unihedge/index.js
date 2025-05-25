const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

const contractAddress = '0xdD90A0504aA3215Dd0E7fb45471A0B133CC3f567'; // UniHedge contract
const accountingToken = ADDRESSES.polygon.USDC_CIRCLE; // USDC token on Polygon
const chain = 'polygon';

async function tvl(_, _1, _2, { api }) {
  return sumTokens2({ api, tokens: [accountingToken], owners: [contractAddress] });
}

module.exports = {
  methodology: "TVL is calculated by summing the USDC (accounting token) locked in the UniHedge contract.",
  polygon: {
    tvl,
  },
};
