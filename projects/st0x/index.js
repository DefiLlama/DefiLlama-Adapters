/**
 * St0x tokenised equities on Base (wrapped versions with Hydrex liquidity pools).
 * These tokens represent tokenised US equities with full redemption rights.
 * TVL = total supply of wrapped tokens, priced via DefiLlama price feeds.
 */

const tokens = [
  "0xFF05E1bD696900dc6A52CA35Ca61Bb1024eDa8e2", // wtMSTR - Wrapped MicroStrategy
  "0x5cDa0E1CA4ce2af96315f7F8963C85399c172204", // wtCOIN - Wrapped Coinbase
  "0x31C2C14134e6E3B7ef9478297F199331133Fc2d8", // wtSPYM - Wrapped SPDR S&P 500 ETF
];

/**
 * Calculates TVL by summing the total supply of all St0x wrapped equity tokens.
 * @param {Object} api - DefiLlama SDK API object
 */
async function tvl(api) {
  const supplies = await api.multiCall({ abi: "erc20:totalSupply", calls: tokens });
  api.addTokens(tokens, supplies);
}

module.exports = {
  methodology:
    "TVL is the total supply of St0x wrapped tokenised equity tokens (wtMSTR, wtCOIN, wtSPYM) on Base, priced via DefiLlama price feeds.",
  start: 1770197593,
  base: {
    tvl,
  },
};
