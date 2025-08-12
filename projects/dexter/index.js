const { queryContract } = require("../helper/chain/cosmos");
const { transformDexBalances } = require("../helper/portedTokens");

const config = {
  persistence: {
    contract: 'persistence1k8re7jwz6rnnwrktnejdwkwnncte7ek7gt29gvnl3sdrg9mtnqkstujtpg',
    blacklist: [0, 1, 7, 9, 11],
  },
  babylon: {
    contract: 'bbn18rdj3asllguwr6lnyu2sw8p8nut0shuj3sme27ndvvw4gakjnjqqczzj4x',
    blacklist: [0],
  },
};

async function tvl(api) {
  const chain = api.chain;
  const { contract, blacklist } = config[chain];

  const poolConfig = await queryContract({ chain, contract, data: { config: {} } });
  const nextId = +poolConfig.next_pool_id || 0;

  const blacklistSet = new Set(blacklist);
  const ids = Array.from({ length: nextId }, (_, i) => i).filter(id => !blacklistSet.has(id));

  const pools = await Promise.all(
    ids.map(poolId =>
      queryContract({ chain, contract, data: { get_pool_by_id: { pool_id: String(poolId) } } })
    )
  );

  for (const p of pools) {
    const { assets } = p || {};
    assets?.forEach(({ info, amount }) => {
      const denom = info?.native_token?.denom;
      if (denom && amount) api.add(denom, amount);
    });
  }

  return transformDexBalances({ chain, data: [], balances: api.getBalances() });
}

module.exports = {
  timetravel: false,
  methodology: `Counts the liquidity on all AMM pools`,
  start: '2023-03-26',
  persistence: { tvl },
  babylon: { tvl },
};
