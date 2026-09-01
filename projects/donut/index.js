const { sumTokens2 } = require("../helper/unwrapLPs");

// DONUT/WETH LP token
const LP_ADDRESS = "0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703";
// Auction contract - reads paymentReceiver dynamically
const AUCTION_ADDRESS = "0xC23E316705Feef0922F0651488264db90133ED38";
// Original burn address - always track this even if paymentReceiver changes
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

async function pool2(api) {
  // Read current paymentReceiver from Auction contract
  const paymentReceiver = await api.call({
    abi: "address:paymentReceiver",
    target: AUCTION_ADDRESS,
  });

  // Track LP at both dead address AND current paymentReceiver
  // This ensures we count all LP ever burned, even if paymentReceiver changes
  const owners = [DEAD_ADDRESS];
  if (paymentReceiver.toLowerCase() !== DEAD_ADDRESS.toLowerCase()) {
    owners.push(paymentReceiver);
  }

  await sumTokens2({
    api,
    owners,
    tokens: [LP_ADDRESS],
    resolveLP: true,
  });
}

module.exports = {
  methodology:
    "Pool2 tracks the value of permanently burned DONUT/WETH LP tokens at the dead address plus the current Auction paymentReceiver.",
  base: {
    tvl: () => ({}),
    pool2,
  },
};
