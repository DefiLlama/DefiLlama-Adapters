const { sumTokens2, } = require("../helper/unwrapLPs");
const { chains: { icp } } = require('@defillama/sdk')

// https://docs.internetcomputer.org/references/chain-key-canister-ids/#ckbtc
const CKBTC_LEDGER = 'mxzaz-hqaaa-aaaar-qaada-cai';

// This address holds all the locked ETH as well as locked ERC20 tokens
const ethereum_contract = "0xb25eA1D493B49a1DeD42aC5B1208cC618f9A9B80";

async function ethereum_tvl(api) {
  return sumTokens2({  owner: ethereum_contract, api, fetchCoValentTokens: true  });
}

async function bitcoin_tvl(api) {
  const [supply, decimals] = await Promise.all([
    icp.getIcrcTotalSupply({ ledger: CKBTC_LEDGER }),
    icp.getIcrcDecimals({ ledger: CKBTC_LEDGER }),
  ]);
  // Coingecko balances use whole-coin numbers; decimal strings are truncated by the SDK.
  api.addCGToken('bitcoin', Number(supply) / 10 ** decimals);
}

module.exports = {
  timetravel: false,
  methodology: `Counts ETH and ERC20 tokens held at ${ethereum_contract} on Ethereum. The Bitcoin bucket uses the current ckBTC ledger supply as a proxy for BTC backing, excluding burned ckBTC and deposits not yet minted; it does not independently sum Bitcoin UTXOs.`,
  ethereum: {
    tvl: ethereum_tvl,
  },
  bitcoin: { tvl: bitcoin_tvl },
};
