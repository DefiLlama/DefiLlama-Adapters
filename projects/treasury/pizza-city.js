/**
 * Pizza City - Treasury Adapter
 * 
 * Submit to: https://github.com/DefiLlama/DefiLlama-Adapters
 * Folder: projects/treasury/pizza-city.js
 * 
 * Tracks protocol-owned assets that could theoretically be used for other purposes.
 * Note: Treasury WETH is converted to permanently locked LP, so balance is typically low.
 */

const { treasuryExports } = require("../helper/treasury");

const PIZZA_TREASURY = '0xc6b4694b906EA134595D3400364d7Acc319684ec';
const PIZZA_TOKEN = '0x13b628fF6Db92070C0FBad79523240E0f5DeFb07';

module.exports = treasuryExports({
  base: {
    owners: [PIZZA_TREASURY],
    ownTokens: [PIZZA_TOKEN],
  },
});

