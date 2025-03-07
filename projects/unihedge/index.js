const { sumTokens2 } = require('../helper/unwrapLPs');

const contractAddress = '0x28824b535d1F4edaf89a36B558811CB1c0b9Aa47'; // UniHedge contract
const accountingToken = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'; // DAI token on Polygon
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
