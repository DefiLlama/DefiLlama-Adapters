const { call } = require('../helper/chain/ton')
const { sumTokensExport } = require("../helper/chain/ton");
const sdk = require('@defillama/sdk')
const ADDRESSES = require("../helper/coreAssets.json");

const tonpoolsContractAddress =
  "EQA7y9QkiP4xtX_BhOpY4xgVlLM7LPcYUA4QhBHhFZeL4fTa";

const tonpoolUSDTContractAddress =
  "EQDrSz9W4tjwnqy1F4z-O4Vkdp8g2YP94cmh12X5RbYpejCw";

async function tvl(api) {
  const result = await call({ target: tonpoolUSDTContractAddress, abi: 'poolBalances' })
  const balances = {
    'coingecko:tether': result[1] / 1e6,
  }
  
  const tonpoolsContractBalances = await sumTokensExport({
    owners: [tonpoolsContractAddress],
    tokens: [ADDRESSES.null],
  })(api);

  sdk.util.mergeBalances(balances, tonpoolsContractBalances);

  return balances
}

module.exports = {
  methodology: "Ton Pools's TVL includes all deposited supported assets",
  ton: {
    tvl: (api) => tvl(api)
  },
};

