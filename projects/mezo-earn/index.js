const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const VEBTC_CONTRACT  = "0x3D4b1b884A7a1E59fE8589a3296EC8f8cBB6f279";
const VEMEZO_CONTRACT = "0xb90fdAd3DFD180458D62Cc6acedc983D78E20122";

module.exports = {
  methodology: 'TVL counts BTC locked by users in the veBTC vote-escrow contract. MEZO locked in veMEZO is the protocol own governance token and is reported separately under staking.',
  mezo: {
    tvl: sumTokensExport({ tokensAndOwners: [[ADDRESSES.mezo.BTC, VEBTC_CONTRACT]] }),
    staking: sumTokensExport({ tokensAndOwners: [[ADDRESSES.mezo.MEZO, VEMEZO_CONTRACT]] }),
  }
}
