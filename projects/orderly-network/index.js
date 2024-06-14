const ADDRESSES = require('../helper/coreAssets.json')
const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');
const { sumTokensExport } = require('../helper/unwrapLPs');

const ASSET_MANAGER_CONTRACT = 'asset-manager.orderly-network.near';
const GET_LISTED_TOKENS_METHOD = 'get_listed_tokens';
const FT_NEAR = 'wrap.near';

const owner = '0x816f722424b49cf1275cc86da9840fbd5a6167e9'

const tokenAddress = {
  arbitrum: ADDRESSES.arbitrum.USDC_CIRCLE,
  optimism: ADDRESSES.optimism.USDC_CIRCLE,
}

async function tvl() {
  let ftTokens = (await call(ASSET_MANAGER_CONTRACT, GET_LISTED_TOKENS_METHOD, {}));

  // NOTE: balances for FT tokens
  let balances = await addTokenBalances(ftTokens, ASSET_MANAGER_CONTRACT);

  // NOTE: add near balance for tokens
  const asset_manager_contract_state = await view_account(ASSET_MANAGER_CONTRACT);
  sumSingleBalance(balances, FT_NEAR, asset_manager_contract_state['amount']);

  return balances;
}

module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
  arbitrum: {
    tvl: sumTokensExport({ owner, tokens: [tokenAddress.arbitrum] }),
  },
  optimism: {
    tvl: sumTokensExport({ owner, tokens: [tokenAddress.optimism] }),
  },
  methodology: 'All the tokens deposited into Orderly Network by chain'
};
