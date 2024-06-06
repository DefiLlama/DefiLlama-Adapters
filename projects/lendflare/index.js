const convexBooster = require('./convexBooster.js');
const supplyBooster = require('./supplyBooster.js');
const sdk = require('@defillama/sdk')

module.exports = {
        ethereum: {
        tvl: sdk.util.sumChainTvls([convexBooster.tvl, supplyBooster.tvl]),
    }
};
