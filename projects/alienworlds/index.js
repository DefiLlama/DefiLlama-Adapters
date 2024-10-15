const { get_account_tvl } = require("../helper/chain/eos");

const accounts = ["nftmt.worlds", "stake.worlds", "lore.worlds", "arena.worlds", "boost.worlds"]

// AlienWorlds
// https://alienworlds.io/
async function wax() {
  const tokens = [
      ["eosio.token", "WAX", "wax"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}
async function staking() {
  const tokens = [
      ["alien.worlds", "TLM", "alien-worlds"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `AlienWorlds TVL is achieved by querying token balances from Staking, Voting & Gaming smart contract(s).`,
  wax: {
    tvl: wax,
    staking,
  },
}
