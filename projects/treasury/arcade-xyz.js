const { treasuryExports } = require("../helper/treasury");

// node test.js projects/treasury/arcade-xyz.js

const ARCADE_TREASURY = '0xac2b57b372E198F09d4bF5F445CA1228771C12c5';
const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const ARCD_TOKEN = '0xe020B01B6fbD83066aa2e8ee0CCD1eB8d9Cc70bF';

module.exports = treasuryExports({
        ethereum: {
            owners: [ARCADE_TREASURY],
            ownTokens: [ARCD_TOKEN, ETH_ADDRESS]
        }
})