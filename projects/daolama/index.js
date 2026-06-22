const ADDRESSES = require('../helper/coreAssets.json');
const __x_constants = {
  POOL_ADDRESS: 'EQCkeTvOSTBwBtP06X2BX7THj_dlX67PhgYRGuKfjWtB9FVb'
};
const { POOL_ADDRESS } = __x_constants;
const { sumTokensExport } = require('../helper/chain/ton');
const __inl_tvl = {
  tvl: sumTokensExport({
    owners: [POOL_ADDRESS],
    tokens: [ADDRESSES.ton.TON, ADDRESSES.ton.USDT]
  }),
};
const { tvl } = __inl_tvl;
const { call } = require('../helper/chain/ton');

async function borrowed(api) {
  const result = await call({
    target: POOL_ADDRESS,
    abi: 'get_pool_data',
  });
  const borrowedTon = result[2];
  api.add(ADDRESSES.ton.TON, borrowedTon);
}

module.exports = {
  methodology: 'Counts the pool size as the TVL. Borrowed coins are not counted towards the TVL.',
  timetravel: false,
  misrepresentedTokens: true,
  ton: {
    tvl,
    borrowed,
  }
}
