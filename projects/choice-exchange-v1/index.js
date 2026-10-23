const sdk = require("@defillama/sdk");
const { getFactoryTvl } = require("../terraswap/factoryTvl");
const { queryContract, getBalance2, getBalance } = require("../helper/chain/cosmos");

// terraswap-style CosmWasm factory on Injective
const factory = "inj1k9lcqtn3y92h4t3tdsu7z8qx292mhxhgsssmxg";
// CosmWasm CLMM (concentrated liquidity) factory, each pool contract holds its own tokens
// https://github.com/choice-exchange/choice_exchange/blob/main/deployed_contracts.md
const clmmFactory = "inj1k58yqvsww97asl6eajx0lja6np03naddfc6cs7";

async function getClmmPools(chain) {
  const pools = [];
  let start_after;
  while (true) {
    const page = await queryContract({ contract: clmmFactory, chain, data: { get_all_pools: { start_after, limit: 100 } } });
    pools.push(...page);
    if (page.length < 100) return pools;
    const last = page[page.length - 1];
    start_after = [last.token0, last.token1, last.fee];
  }
}

async function clmmTvl(api) {
  const pools = await getClmmPools(api.chain);
  let cw20Queries = 0;
  let cw20Failures = 0;
  for (const { pool_address, token0, token1 } of pools) {
    // tokens are prefixed `n:` (bank denom) or `c:` (cw20); only the pool's own pair is counted
    const tokens = [token0, token1];
    const denoms = tokens.filter((t) => t.startsWith("n:")).map((t) => t.slice(2));
    const cw20s = tokens.filter((t) => t.startsWith("c:")).map((t) => t.slice(2));
    if (denoms.length) {
      const balances = await getBalance2({ owner: pool_address, chain: api.chain, tokens: denoms });
      // `erc20:0x..` bank denoms are MultiVM Token Standard twins of the Injective EVM erc20
      Object.entries(balances).forEach(([denom, amount]) => api.add(denom.startsWith("erc20:") ? denom.slice(6) : denom, amount));
    }
    // the factory accepts any cw20 address, so a token that fails the balance query only skips that balance
    for (const token of cw20s) {
      cw20Queries++;
      try {
        api.add(token, await getBalance({ token, owner: pool_address, chain: api.chain }));
      } catch (e) {
        cw20Failures++;
        sdk.log(`choice clmm: cw20 balance query failed for ${token} in ${pool_address}`);
      }
    }
  }
  // every cw20 query failing points to an LCD problem, not a bad token
  if (cw20Queries && cw20Failures === cw20Queries) throw new Error("choice clmm: all cw20 balance queries failed");
}

async function tvl(api) {
  await clmmTvl(api);
  return getFactoryTvl(factory)(api);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX: the reserves of every pair contract created by the Choice Exchange v1 (CosmWasm) factory on Injective, plus the tokens held by every pool of its CosmWasm CLMM factory.",
  injective: { tvl },
};
