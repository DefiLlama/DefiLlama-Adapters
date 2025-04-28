const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
  ["eosio.token", "WAX", "wax"],
  ["alien.worlds", "TLM", "alien-worlds"],
  ["token.nefty", "NEFTY", "nefty"],
  ["token.fusion", "LSWAX", "waxfusion-staked-wax"],
];

// NeftyBlocks
// https://neftyblocks.com
async function wax() {
  const accounts = ["blend.nefty", "up.nefty", "neftyblocksd", "neftyblocksp", "market.nefty", "swap.nefty", "swap.we"];
  return await get_account_tvl(accounts, tokens, "wax");
}

async function staking() {
  const accounts = ["stake.nefty", "reward.nefty"];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `NeftyBlocks TVL is achieved by querying token balances from NFT market and swap contracts.`,
  wax: {
    tvl: wax,
    staking
  },
}