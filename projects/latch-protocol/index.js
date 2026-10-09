const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/tokenMapping");

// PancakeSwap Infinity fork: a single Vault holds every pool's tokens, the pool managers hold nothing
const vault = "0xaC44C903CE3d89054fD5b70e0E396f26b214CBE3";
const managers = [
  { address: "0x3d4afd3190b1e5036e410abb576f99c02D6fBb20", eventAbi: "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)" }, // CLPoolManager
  { address: "0xbD6274D94102C3fCafE043f8EF7C7F33f33B255A", eventAbi: "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)" }, // BinPoolManager
];

const config = {
  robinhood: {
    fromBlock: 74031752,
    blacklistedTokens: [
      "0x2A21c0826848f2D597B7C87A4B931dE1407958A6", // LTT1 test token
      "0xa29927045BDFfd61B8F539D491085F1b6f7A8bE4", // LTT2 test token
    ],
  },
  base: { fromBlock: 51856707 },
};

async function tvl(api) {
  const { fromBlock, blacklistedTokens = [] } = config[api.chain];
  const tokens = new Set();
  const hookTokens = {};
  for (const { address, eventAbi } of managers) {
    const logs = await getLogs2({ api, target: address, fromBlock, eventAbi });
    logs.forEach(({ currency0, currency1, hooks }) => {
      tokens.add(currency0);
      tokens.add(currency1);
      if (hooks === nullAddress) return;
      hookTokens[hooks] = hookTokens[hooks] || new Set();
      hookTokens[hooks].add(currency0).add(currency1);
    });
  }
  const ownerTokens = [[[...tokens], vault], ...Object.entries(hookTokens).map(([hook, t]) => [[...t], hook])];
  return sumTokens2({ api, ownerTokens, blacklistedTokens, permitFailure: true });
}

module.exports = {
  methodology: "TVL is the Vault's balance of every token in a pool initialized on the CL or Bin pool manager, plus any balance held by each pool's hook contract.",
  robinhood: { tvl, start: "2026-09-27" },
  base: { tvl, start: "2026-09-27" },
};
