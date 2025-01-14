const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const tokens = [
    coreAssets.null,  
    coreAssets.ethereum.WBTC 
];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: "0x0feCcB11C5B61B3922C511d0f002c0b72D770dCE", tokens: tokens })
  },
  methodology: "Currently TVL is calculated as the sum of the assets locked inside the staking pool, including WBTC and native Ethereum on the contract."
};
