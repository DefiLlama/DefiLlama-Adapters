const { sumTokens2, } = require("../helper/unwrapLPs");
const { get } = require('../helper/http')

// This address holds all the locked ETH as well as locked ERC20 tokens
const ethereum_contract = "0xb25eA1D493B49a1DeD42aC5B1208cC618f9A9B80";

async function ethereum_tvl(api) {
  return sumTokens2({  owner: ethereum_contract, api, fetchCoValentTokens: true  });
}

async function bitcoin_tvl(ts) {
  var end = ts.timestamp
  let start = end - 24 * 60 * 60;
  const { data } = await get(`https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/total-supply?start=${start}&end=${end}&step=1`);
  let [_, bal] = data.pop()
  return {
    'coingecko:bitcoin': bal / 1e8
  };
}

module.exports = {
  methodology: `We count the ETH and ERC20-Tokens on ${ethereum_contract} as the collateral for ckETH and ck-ERC20 tokens and we count BTC as the collateral for ckBTC`,
  ethereum: {
    tvl: ethereum_tvl,
  },
  bitcoin: { tvl: bitcoin_tvl },
};
