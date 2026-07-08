// prynt — bonding-curve memecoin launchpad on Robinhood Chain (Arbitrum Orbit L2, chainId 4663).
//
// TVL model: every token launches on its own BondingCurve, which custodies real ETH against a
// constant-product curve until it graduates to Uniswap V2. By the contract's invariant the curve's
// native ETH balance == its real ETH reserve right up until migration, at which point the ETH leaves
// the curve for a Uniswap V2 pool (that pool is attributed to Uniswap, not prynt — so we do NOT count
// it here and there is no double counting). TVL is therefore the sum of native ETH held across every
// still-active bonding curve. Curves are discovered from the factory's TokenCreated logs.
//
// Destination file in the PR: projects/prynt/index.js
//
// -----------------------------------------------------------------------------------------------------
const { getLogs } = require("../helper/cache/getLogs");

const NULL = "0x0000000000000000000000000000000000000000"; // native ETH sentinel for sumTokens

const FACTORY = "0x5c0cdFA92C6645b6ee83e686598DbC29260F885d";
const FROM_BLOCK = 4394643; // factory deployment block on Robinhood Chain

const TOKEN_CREATED =
  "event TokenCreated(address indexed token, address indexed creator, address indexed curve, string name, string symbol, string metadataURI, uint256 timestamp)";

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: TOKEN_CREATED,
    onlyArgs: true,
  });
  const curves = logs.map((l) => l.curve);
  // Native ETH held by each live curve. Migrated curves hold ~0, so they contribute nothing.
  return api.sumTokens({ owners: curves, tokens: [NULL] });
}

module.exports = {
  methodology:
    "TVL is the native ETH escrowed in each active bonding curve before graduation. A curve's ETH balance equals its real ETH reserve until it graduates to a Uniswap V2 pool, at which point the ETH exits the curve; the resulting Uniswap LP is counted under Uniswap, not prynt, so there is no double counting.",
  start: "2026-07-07",
  robinhood: {
    tvl,
  },
};
