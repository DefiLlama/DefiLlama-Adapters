const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    base: {
        tvl: sumTokensExport({
            owners: [
                '0x9da1bB4e725ACc0d96010b7cE2A7244Cda446617',
                '0x4Fdce033b9F30019337dDC5cC028DC023580585e'
            ],
            tokens: [ADDRESSES.base.USDC]
        })
    }
};
