const ADDRESSES = require('../helper/coreAssets.json')
const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');
const { sumTokensExport } = require('../helper/unwrapLPs');
const { sumTokens2 } = require('../helper/solana');

const ASSET_MANAGER_CONTRACT = 'asset-manager.orderly-network.near';
const GET_LISTED_TOKENS_METHOD = 'get_listed_tokens';
const FT_NEAR = 'wrap.near';

const owner = '0x816f722424b49cf1275cc86da9840fbd5a6167e9'

const tokenAddress = {
  arbitrum: ADDRESSES.arbitrum.USDC_CIRCLE,
  optimism: ADDRESSES.optimism.USDC_CIRCLE,
  base: ADDRESSES.base.USDC,
  mantle: ADDRESSES.mantle.USDC,
  polygon: ADDRESSES.polygon.USDC_CIRCLE,
  ethereum: ADDRESSES.ethereum.USDC,
  sei: ADDRESSES.sei.USDC,
  berachain: ADDRESSES.berachain.USDC,
  avax: ADDRESSES.avax.USDC,
  sonic: ADDRESSES.sonic.USDC_e,
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
  near: {    tvl,  },
  solana: { tvl: () => sumTokens2({ tokenAccounts: ['77puyQ4K4ov82qzBuda4q9iMh2Ux49YnnBNWqxQkcrXE']})},
  methodology: 'All the tokens deposited into Orderly Network by chain'
};

Object.keys(tokenAddress).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, tokens: [tokenAddress[chain]] })
  }
})