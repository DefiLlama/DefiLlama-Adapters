const adapter = require("../projects/stride-hyperlane");

module.exports = {
  tvl: adapter.celestia.tvl,
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "This adapter tracks the amount of TIA bridged from Celestia to Stride via Hyperlane, using a lock-and-mint mechanism. The TVL reflects the amount of TIA locked on Stride, representing assets originally from Celestia.",
  chain: "Celestia",
  name: "Stride Hyperlane",
};
