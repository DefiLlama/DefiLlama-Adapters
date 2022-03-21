const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const USDC_VAULT = "0x756d09263483dC5A6A0023bb80933db2C680703E";
const WFTM_VAULT = "0x22c538c1EeF31B662b71D5C8DB47847d30784976";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WFTM = "0x4e15361fd6b4bb609fa63c81a2be19d873717870";

async function tvl() {
  let balances = {};

  const usdcVaultTVL = await sdk.api.abi.call({
    target: USDC_VAULT,
    abi: abi["totalAssets"],
    chain: "fantom",
  });

  const wftmVaultTVL = await sdk.api.abi.call({
    target: WFTM_VAULT,
    abi: abi["totalAssets"],
    chain: "fantom",
  });

  balances[USDC] = usdcVaultTVL.output;
  balances[WFTM] = wftmVaultTVL.output;

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: `Counts deposits made to the the USDC and wFTM vaults`,
  fantom: {
    tvl,
  },
};
