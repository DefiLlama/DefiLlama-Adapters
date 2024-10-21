const { sumTokensExport } = require('../helper/chain/ton')
const ADDRESSES = require("../helper/coreAssets.json");

const tonpoolsContractAddress = "EQA7y9QkiP4xtX_BhOpY4xgVlLM7LPcYUA4QhBHhFZeL4fTa";

module.exports = {
  methodology: "Ton Pools's TVL includes all deposited supported assets",
  ton: {
    tvl: sumTokensExport({ owner: tonpoolsContractAddress, tokens: [ADDRESSES.null] }),
  },
}
