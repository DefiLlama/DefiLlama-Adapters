const { sumTokens2 } = require("../helper/solana");

async function tvl(api) {
  return sumTokens2({ 
    api,
    owners: [
      'D8gNjpxyi8BPkotidwoakUurhjnYhJghNRb2kuv8Lbeb',
    ]
  });
}

module.exports = {
  methodology: "TVL is calculated from tokens held in protocol vaults",
  solana: {
    tvl,
  }
};