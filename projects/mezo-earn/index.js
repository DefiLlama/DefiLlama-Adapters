const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const VEBTC_CONTRACT  = "0x3D4b1b884A7a1E59fE8589a3296EC8f8cBB6f279";
const VEMEZO_CONTRACT = "0xb90fdAd3DFD180458D62Cc6acedc983D78E20122";

module.exports = {
    methodology: 'Sum of BTC and MEZO locked by users in Mezo Earn vote-escrow contracts (veBTC, veMEZO) for governance voting power.',
    mezo: {
        tvl: sumTokensExport({ tokensAndOwners: [[ADDRESSES.mezo.MEZO, VEMEZO_CONTRACT], [ADDRESSES.mezo.BTC, VEBTC_CONTRACT]]})
    }
}
