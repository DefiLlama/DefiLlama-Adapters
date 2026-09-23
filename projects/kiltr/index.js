// DefiLlama-Adapters TVL adapter for Kiltr (Balancer v2 + v3 style Vaults on Robinhood Chain, chainId 4663).
// Target path in DefiLlama/DefiLlama-Adapters: projects/kiltr/index.js
// Balances are summed straight from the Vaults: every pool token sits in the Vault, so Vault ERC20 balances == protocol TVL.
// Pool tokens (v2 composable pool tokens (KPT)) are excluded via `blacklistedTokens`.
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

const CHAIN = "robinhood"; // registered in projects/helper/chains.json; WETH/USDG in coreAssets.json
const V2_VAULT = "0x8d1addff942c185e81848a19203b994f5cf07df2";
const V3_VAULT = "0x371bd29a7befc4efcdfa2c5261316c74843573d3";
const V2_START = 67292293;
const V3_START = 67292959;

async function tvl(api) {
  // v2: PoolRegistered -> pool addresses (KPT pool tokens to blacklist) ; TokensRegistered -> tokens held by the Vault
  const registered = await getLogs({ api, target: V2_VAULT, fromBlock: V2_START, eventAbi: "event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)", onlyArgs: true, extraKey: "v2-pool-registered" });
  const tokensV2 = await getLogs({ api, target: V2_VAULT, fromBlock: V2_START, eventAbi: "event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)", onlyArgs: true, extraKey: "v2-tokens-registered" });
  // v3: PoolRegistered(address indexed pool, ...) — read the pool address from topic[1], then Vault.getPoolTokens(pool) for the tokens
  const V3_POOL_REGISTERED = "0xbc1561eeab9f40962e2fb827a7ff9c7cdb47a9d7c84caeefa4ed90e043842dad";
  const rawV3 = await getLogs({ api, target: V3_VAULT, fromBlock: V3_START, topics: [V3_POOL_REGISTERED], extraKey: "v3-pool-registered" });
  const v3Pools = rawV3.map((l) => "0x" + l.topics[1].slice(26));
  const v3TokenLists = await api.multiCall({ abi: "function getPoolTokens(address pool) view returns (address[] tokens)", calls: v3Pools, target: V3_VAULT, permitFailure: true });
  const bpts = [...registered.map((l) => l.poolAddress), ...v3Pools];
  const v2Tokens = tokensV2.flatMap((l) => l.tokens);
  const v3Tokens = v3TokenLists.flatMap((t) => t || []);
  await sumTokens2({ api, owner: V2_VAULT, tokens: v2Tokens, blacklistedTokens: bpts });
  await sumTokens2({ api, owner: V3_VAULT, tokens: v3Tokens, blacklistedTokens: bpts });
  return api.getBalances();
}

module.exports = {
  methodology: "TVL is the sum of every pool token held by the Kiltr v2 and v3 Vaults (Balancer-style single-Vault architecture). Composable pool tokens (KPT) held by the Vault are excluded. Prices via DefiLlama's coin API.",
  start: V2_START,
  [CHAIN]: { tvl },
};
