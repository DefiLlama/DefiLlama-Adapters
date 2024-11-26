const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
  ["eosio.token", "WAX", "wax"],
  ["alien.worlds", "TLM", "alien-worlds"],
  ["wuffi", "WUF", "wuffi"],
];

// NFTHive
// https://nfthive.io
async function wax() {
  const accounts = ["nfthivedrops", "nfthivepacks", "nfthivecraft"];
  return await get_account_tvl(accounts, tokens, "wax");
}

async function staking() {
  const accounts = ["nfthivevault"];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `NFTHive TVL is achieved by querying token balances from NFT market contracts.`,
  wax: {
    tvl: wax,
    staking
  },
}