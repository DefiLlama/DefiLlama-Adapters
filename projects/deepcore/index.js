const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/tokenMapping");
const { sliceIntoChunks } = require("../helper/utils");

// same addresses on every chain; the Vault custodies the tokens of every pool
const VAULT = "0x405515DB94aDBF3A827349f2C096809639581D09";
const CL_POOL_MANAGER = "0xE23978EBBf83Eab3f0226674d1183b5D3ED32FeC";
const BIN_POOL_MANAGER = "0x004a786C4cB79358e2f86467B0eBFD87028648F4";

// fromBlock: CLPoolManager deployment block
const config = {
  hyperliquid: { fromBlock: 48129462 },
  bsc: { fromBlock: 126766127 },
  base: { fromBlock: 52409470 },
  robinhood: { fromBlock: 84732137 },
};

const managers = [
  [CL_POOL_MANAGER, "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)"],
  [BIN_POOL_MANAGER, "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)"],
];

async function tvl(api) {
  const { fromBlock } = config[api.chain];
  const tokens = new Set();
  const hookTokens = {};

  for (const [target, eventAbi] of managers) {
    const logs = await getLogs2({ api, target, fromBlock, eventAbi });
    for (const { currency0, currency1, hooks } of logs) {
      const pair = [currency0, currency1].map((t) => t.toLowerCase());
      pair.forEach((t) => tokens.add(t));
      const hook = hooks.toLowerCase();
      if (hook === nullAddress) continue;
      hookTokens[hook] = hookTokens[hook] || new Set();
      pair.forEach((t) => hookTokens[hook].add(t));
    }
  }

  // hooks can hold their own balances, as in uniswap-v4
  const ownerTokens = Object.entries(hookTokens).map(([hook, t]) => [[...t], hook]);
  for (const chunk of sliceIntoChunks([...tokens], 1000)) ownerTokens.push([chunk, VAULT]);

  return sumTokens2({ api, ownerTokens, permitFailure: true });
}

module.exports = {
  methodology:
    "DeepCore is a singleton AMM: one Vault custodies every token for the whole protocol, and pool managers hold nothing. TVL is the Vault's balance of every token that has appeared as currency0 or currency1 in an Initialize event from CLPoolManager or BinPoolManager, plus any balance held by the hook contract each pool was created with. Native currency appears as the zero address in a pool key and is read as the Vault's native balance.",
  start: "2026-10-10",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
