const { sumAllTokens } = require("../helper/chain/fuel")

async function tvl(_, _1, _2, { api }) {
  const pairContract = '0x0da1be8528c8f546521ba9507d334cdb06cbc8b8842b3c0a871b1b4195635363'; 
  return sumAllTokens({ api, owners: [pairContract] });
}

module.exports = {
  methodology: "TVL is calculated by summing the value of all tokens held in the pair contract.",
  fuel: { tvl },
  timetravel: false, 
};