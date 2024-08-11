const { get_account_tvl } = require("../helper/chain/eos");

// AlienWorlds
// https://alienworlds.io/
async function wax() {
  const accounts = ["nftmt.worlds", "stake.worlds", "lore.worlds", "arena.worlds", "boost.worlds"];
  const tokens = [
      ["eosio.token", "WAX", "wax"],
      ["alien.worlds", "TLM", "alien-worlds"]
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `AlienWorlds TVL is achieved by querying token balances from Staking, Voting & Gaming smart contract(s).`,
  wax: {
    tvl: wax
  },
}
