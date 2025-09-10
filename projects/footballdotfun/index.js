const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    base: {
        tvl: sumTokensExport({
            owner: '0x9da1bB4e725ACc0d96010b7cE2A7244Cda446617',
            tokens: [ADDRESSES.base.USDC]
        })
    }
};
