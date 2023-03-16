const { get_account_tvl } = require("../helper/chain/eos")
const sdk = require('@defillama/sdk')
const account1 = 'vigorlending'
const tokens1 = [
  ["eosio.token", "EOS", "eos"],
  ["tethertether", "USDT", "tether"],
  ["everipediaiq", "IQ", "everipedia"],
  ["btc.ptokens", "PBTC", "bitcoin"],
  ["eth.ptokens", "PETH", "ethereum"],
];

const account2 = 'vigorstaking'
const tokens2 = [
  ["eosio.token", "EOS", "eos"],
  ["tethertether", "USDT", "tether"],
];

module.exports = {
  timetravel: false,
  eos: {
    tvl: sdk.util.sumChainTvls([
      () => get_account_tvl(account1, tokens1),
      () => get_account_tvl(account2, tokens2),
    ])
  },
}
