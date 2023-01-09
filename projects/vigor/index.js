const { get_account_tvl } = require("../helper/chain/eos")

module.exports = {
  timetravel: false,
  eos: {
    tvl: async () => {
      const account1 = 'vigorlending'
      const account2 = 'vigorstaking'
      const tokens = [
        ["eosio.token", "EOS", "eos"],
        ["tethertether", "USDT", "tether"],
        ["everipediaiq", "IQ", "everipedia"],
        ["btc.ptokens", "PBTC", "bitcoin"],
        ["eth.ptokens", "PETH", "ethereum"],
      ];
      return get_account_tvl(account1, tokens)+get_account_tvl(account2, tokens)
    }
  },
}
