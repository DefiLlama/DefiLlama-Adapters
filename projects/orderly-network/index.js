const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');

const ASSET_MANAGER_CONTRACT = 'asset-manager.orderly-network.near';
const GET_LISTED_TOKENS_METHOD = 'get_listed_tokens';
const FT_NEAR = 'wrap.near';

async function tvl() {
  let ftTokens = (await call(ASSET_MANAGER_CONTRACT, GET_LISTED_TOKENS_METHOD, {}));

  // NOTE: balances for FT tokens
  let balances = await addTokenBalances(ftTokens, ASSET_MANAGER_CONTRACT);

  // NOTE: add near balance for tokens
  const asset_manager_contract_state = await view_account(ASSET_MANAGER_CONTRACT);
  sumSingleBalance(balances, FT_NEAR, asset_manager_contract_state['amount']);

  return balances;
}

async function arbi_tvl(_, _b, _cb, { api, }) {
  const contract = '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9'
  const hashes = await api.call({  abi: 'function getAllAllowedToken() view returns (bytes32[])', target: contract })
  const tokens = await api.multiCall({  abi: 'function getAllowedToken(bytes32) view returns (address)', calls: hashes, target: contract })
  return api.sumTokens({ owner: contract, tokens })  
}


module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
  /* arbitrum: {
    tvl: arbi_tvl,
  }, */
  methodology: 'Summed up all the tokens deposited into Orderly Network'
}
