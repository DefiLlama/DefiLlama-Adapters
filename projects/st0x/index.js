const { sumTokens2 } = require("../helper/unwrapLPs");

// St0x tokenised equities on Base (wrapped versions with Hydrex liquidity pools)
// These tokens represent tokenised US equities with full redemption rights.
// TVL = total supply of wrapped tokens that have active Hydrex DEX pools.

const ORDERBOOK = "0xe522cB4a5fCb2eb31a52Ff41a4653d85A4fd7C9D";

const tokens = [
  "0xFF05E1bD696900dc6A52CA35Ca61Bb1024eDa8e2", // wtMSTR - Wrapped MicroStrategy
  "0x5cDa0E1CA4ce2af96315f7F8963C85399c172204", // wtCOIN - Wrapped Coinbase
  "0x31C2C14134e6E3B7ef9478297F199331133Fc2d8", // wtSPYM - Wrapped SPDR S&P 500 ETF
];

async function tvl(api) {
  return sumTokens2({ api, owners: [ORDERBOOK], tokens });
}

module.exports = {
  methodology:
    "TVL is calculated as the value of St0x tokenised equity tokens held in the Rain Orderbook contract, which serves as the liquidity venue for Hydrex pools.",
  start: 1710593051,
  base: {
    tvl,
  },
};
