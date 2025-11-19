const { aptosTVL } = require('../helper/kaching-helper.js');

async function tvl() {
  try {
    const totalUsdc = await aptosTVL();
    if (isNaN(totalUsdc) || totalUsdc < 0) return {};

    return {
      'aptos:0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC':
        Math.floor(totalUsdc * 1e6)
    };
  } catch (e) {
    console.error('Error computing TVL:', e);
    return {};
  }
}

module.exports = {
  methodology:
    "Kaching! allows users to pay using any supported token across supported chains. Kaching! payment abstraction layer swaps and bridges these tokens into USDC on Aptos, which powers the pot size, winnings, and payouts. TVL reflects the total USDC held in the protocol's smart contracts, including active lottery pot balances and treasury reserves used for prize payouts.",
  aptos: { tvl }
};