const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
    ["eosio.token", "EOS", "eos"],
    ["btc.ptokens", "PBTC", "ptokens-btc"],
    ["eth.ptokens", "PETH", "ethereum"], // CoinGecko missing pTokens support, using native symbol
    ["ltc.ptokens", "PLTC", "litecoin"], // CoinGecko missing pTokens support, using native symbol
];

// SportBet
// https://sportbet.one/
async function eos() {
  return await get_account_tvl("sportbet1bet", tokens);
}

module.exports = {
  methodology: `SportBet TVL is achieved by querying token balances from SportBet's smart contract.`,
  eos: {
    tvl: eos
  },
}