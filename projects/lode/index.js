const sdk = require('@defillama/sdk');
const { getLogs2 } = require('../helper/cache/getLogs');

const LODE_HOOK = '0x8f24193CC75Fc64A30a038442BcD622FF4070088'.toLowerCase();
const DEPLOY_BLOCK = 25072859;
const SUBGRAPH = 'DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G';

const POOL_CONFIGURED =
  'event PoolConfigured(bytes32 indexed poolId, uint24 premiumBps, address splitter, address operator, uint256 minAuctionInput)';

async function tvl(api) {
  const poolsConfigured = await getLogs2({
    api,
    target: LODE_HOOK,
    eventAbi: POOL_CONFIGURED,
    fromBlock: DEPLOY_BLOCK,
    useIndexer: true,
  });

  const lodePoolIds = [...new Set(poolsConfigured.map((l) => String(l.poolId).toLowerCase()))];
  if (lodePoolIds.length === 0) return;

  const query = `{
    pools(where: { id_in: ${JSON.stringify(lodePoolIds)} }, first: 1000) {
      token0 { id decimals }
      token1 { id decimals }
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }`;

  const { pools } = await sdk.graph.request(SUBGRAPH, query);
  for (const pool of pools) {
    api.addToken(pool.token0.id, pool.totalValueLockedToken0 * 10 ** pool.token0.decimals);
    api.addToken(pool.token1.id, pool.totalValueLockedToken1 * 10 ** pool.token1.decimals);
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'Value locked in uni v4 pools with lode hooks',
  start: '2026-05-08',
  ethereum: { tvl },
};
