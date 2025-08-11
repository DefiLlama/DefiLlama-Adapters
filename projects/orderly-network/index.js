const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');
const { sumTokens2: sumTokensEvm, nullAddress } = require('../helper/unwrapLPs');
const { sumTokens2 } = require('../helper/solana');
const { getConfig } = require('../helper/cache');

const ASSET_MANAGER_CONTRACT = 'asset-manager.orderly-network.near';
const GET_LISTED_TOKENS_METHOD = 'get_listed_tokens';
const FT_NEAR = 'wrap.near';

const OWNER_MAP = {
  'ethereum': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'optimism': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'bsc': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'polygon': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'arbitrum': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'avax': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'base': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'mantle': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'sei': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'sonic': '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9',
  'sty': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'abstract': '0xE80F2396A266e898FBbD251b89CFE65B3e41fD18',
  'morph': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'mode': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'berachain': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'plume': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  'solana': '2AoLiH5kVBG2ot1qKoh4ro8F95KQb7HEBbJmkxrwYBec',
}

async function fetchTokenData(api) {
  const chainId = api.chain === 'solana' ? '900900900' : api.chainId + ''; // Ensure chainId is a string

  const { data: { rows } } = await getConfig('orderly-network/token-data', 'https://api.orderly.org/v1/public/token');
  return rows.filter(token => token.is_collateral).map(i => {
    const chainInfo = i.chain_details.find(chain => chain.chain_id === chainId);
    if (!chainInfo) return null;
    return chainInfo.contract_address === '' ? nullAddress : chainInfo.contract_address
  }).filter(i => i)
}

async function tvlNear() {
  let ftTokens = (await call(ASSET_MANAGER_CONTRACT, GET_LISTED_TOKENS_METHOD, {})).filter(address => address.includes('.'));

  // NOTE: balances for FT tokens
  let balances = await addTokenBalances(ftTokens, ASSET_MANAGER_CONTRACT);

  // NOTE: add near balance for tokens
  const asset_manager_contract_state = await view_account(ASSET_MANAGER_CONTRACT);
  sumSingleBalance(balances, FT_NEAR, asset_manager_contract_state['amount']);

  return balances;
}

async function tvl(api) {
  return sumTokensEvm({ owner: OWNER_MAP[api.chain], tokens: await fetchTokenData(api), api, })
}

module.exports = {
  timetravel: false,
  near: { tvl: tvlNear },
  methodology: 'All the tokens deposited into Orderly Network by chain'
};

Object.keys(OWNER_MAP).forEach(chainName => {
  module.exports[chainName] = { tvl };
});

module.exports.solana = {
  tvl: async (api) => {
    return sumTokens2({ owner: OWNER_MAP.solana, tokens: await fetchTokenData(api) });
  }
};
