// DOTT (Dump on the Trenches) — memecoin launchpad + trading terminal on
// Robinhood Chain. TVL = ETH held in DumpFactory bonding curves that have not
// yet graduated (pump.fun-style methodology). Curve addresses are read from the
// factory's Launched events; native ETH balances are summed. On graduation a
// token migrates its liquidity to a Uniswap V3 pool (counted by Uniswap), and
// the curve's ETH balance drops to ~0 — so summing native balances counts only
// pre-graduation reserves and never double-counts graduated liquidity.

const { getLogs2 } = require("../helper/cache/getLogs");

const FACTORY = "0x4B4a24aBbb7b92AFeb12D0Bca3C054fe1E7069E1"; // DumpFactory proxy
const LAUNCHED_ABI =
  "event Launched(address indexed token, address indexed curve, address indexed creator, string name, string symbol, string metadata, uint256 firstBuyWei)";
const START_BLOCK = 5025502; // DumpFactory deploy block

async function tvl(api) {
  const logs = await getLogs2({
    api,
    factory: FACTORY,
    eventAbi: LAUNCHED_ABI,
    fromBlock: START_BLOCK,
  });
  const owners = logs.map((l) => l.curve);
  return api.sumTokens({
    owners,
    tokens: ["0x0000000000000000000000000000000000000000"], // native ETH
  });
}

module.exports = {
  methodology:
    "Counts the ETH held in DOTT (DumpFactory) bonding curves on Robinhood Chain that have not yet graduated. Curve addresses come from the factory's Launched events and their native ETH balances are summed. Graduated tokens migrate liquidity to a Uniswap V3 pool (counted by Uniswap), so only pre-graduation curve reserves are counted here to avoid double-counting.",
  robinhood: { tvl },
};
