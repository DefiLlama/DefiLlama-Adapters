const { get_account_tvl } = require("../helper/chain/eos")

module.exports = {
  timetravel: false,
  eos: {
    tvl: async () => {
      const account1 = 'vigorlending'
      const tokens1 = [
        ["eosio.token", "EOS", "eos"],
        ["tethertether", "USDT", "tether"],
        ["everipediaiq", "IQ", "everipedia"],
        ["btc.ptokens", "PBTC", "bitcoin"],
        ["eth.ptokens", "PETH", "ethereum"],
      ];
      var tvl1 = await get_account_tvl(account1, tokens1);
      
      const account2 = 'vigorstaking'
      const tokens2 = [
        ["eosio.token", "EOS", "eos"],
        ["tethertether", "USDT", "tether"],
      ];
      var tvl2 = await get_account_tvl(account2, tokens2);
      
      return tvl1+tvl2
    }
  },
}
