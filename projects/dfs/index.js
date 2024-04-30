const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
  ["eosio.token", "EOS", "eos"],
  ["tethertether", "USDT", "tether"],
  ["btc.ptokens", "PBTC", "ptokens-btc"],
  ["token.defi", "BOX", "defibox"],
  ["minedfstoken", "DFS", "defis-network"],
  ["emanateoneos", "EMT", "emanate"],
  ["token.newdex", "DEX", "newdex-token"],
  ["chexchexchex", "CHEX", "chex-token"],
  ["everipediaiq", "IQ", "everipedia"],
  ["eosiotptoken", "TPT", "token-pocket"],
  ["core.ogx", "OGX", "organix"],
]

// https://apps.defis.network/
// AMM swap
async function eos() {
  return await get_account_tvl("defisswapcnt", tokens);
}


// https://dfs.land/
const utils = require("../helper/utils");
const endpoint = 'https://api.dfs.land/dfschain';
async function dfs() {
  const info = await utils.fetchURL(`${endpoint}/infos`);
  return {
    tether: info.data.tvl,
  }
}

module.exports = {
  methodology: `DFS TVL is achieved by querying token balances from DFS's AMM swap liquidity smart contract.`,
  eos: {
    tvl: eos
  },
  dfs: {
    tvl: dfs
  },
}
