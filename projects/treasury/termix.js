const { treasuryExports } = require("../helper/treasury");

// Protocol fee recipient — receives the 2% protocol fee from the escrow and
// campaign-vault contracts on both chains.
const FEE_RECIPIENT = "0x1095deD95CB6e81C01204F7A94950dd559195E42";

module.exports = treasuryExports({
  bsc: {
    owners: [FEE_RECIPIENT],
    fetchCoValentTokens: false,
    tokens: [
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
      "0x55d398326f99059fF775485246999027B3197955", // USDT
    ],
  },
  base: {
    owners: [FEE_RECIPIENT],
    fetchCoValentTokens: false,
    tokens: [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
      "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // USDT
    ],
  },
});
