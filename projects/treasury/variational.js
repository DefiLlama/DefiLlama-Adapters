const { treasuryExports, nullAddress } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const PROTOCOL_TREASURY = '0x5e91b40467fb8902c46a7b6cb90482363188d645';

module.exports = treasuryExports({
    arbitrum: {
        owners: [PROTOCOL_TREASURY],
        tokens: [
            nullAddress,
            ADDRESSES.arbitrum.USDC_CIRCLE
        ],
    }
})