const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const tonpoolsContractAddress =
  "EQA7y9QkiP4xtX_BhOpY4xgVlLM7LPcYUA4QhBHhFZeL4fTa";

const tonpoolUSDTContractAddress =
  "EQDrSz9W4tjwnqy1F4z-O4Vkdp8g2YP94cmh12X5RbYpejCw";

module.exports = {
  methodology: "Ton Pools's TVL includes all deposited supported assets",
  ton: {
    tvl: sumTokensExport({
      owners: [tonpoolsContractAddress, tonpoolUSDTContractAddress],
      tokens: [ADDRESSES.null],
    }),
  },
};

