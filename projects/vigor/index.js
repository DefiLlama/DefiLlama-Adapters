const { get_account_tvl } = require("../helper/chain/eos")

module.exports = {
  timetravel: false,
  eos: {
    tvl: async () => {
      const account = 'vigorlending'
      const tokens = [
        ["eosio.token", "EOS", "eos"],
        ["tethertether", "USDT", "tether"],
        ["everipediaiq", "IQ", "everipedia"],
        ["btc.ptokens", "PBTC", "bitcoin"],
        ["eth.ptokens", "PETH", "ethereum"],
      ];
      return get_account_tvl(account, tokens)
    }
  },
}
