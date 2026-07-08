const { getLogs2 } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/sumTokens");

const FACTORY = "0x5c0cdFA92C6645b6ee83e686598DbC29260F885d";
const FROM_BLOCK = 4394643;
const TOKEN_CREATED =
  "event TokenCreated(address indexed token, address indexed creator, address indexed curve, string name, string symbol, string metadataURI, uint256 timestamp)";

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: TOKEN_CREATED,
  });
  const curves = logs.map((l) => l.curve);
  // Native ETH held by each live curve. Migrated curves hold ~0, so they contribute nothing.
  return api.sumTokens({ owners: curves, tokens: [nullAddress] });
}

module.exports = {
  methodology:
    "TVL is the native ETH escrowed in each active bonding curve before graduation. A curve's ETH balance equals its real ETH reserve until it graduates to a Uniswap V2 pool, at which point the ETH exits the curve; the resulting Uniswap LP is counted under Uniswap, not prynt, so there is no double counting.",
  start: "2026-07-07",
  robinhood: { tvl },
};
