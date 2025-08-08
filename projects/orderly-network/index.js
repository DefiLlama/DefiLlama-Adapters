const ADDRESSES = require('../helper/coreAssets.json')
const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');
const { sumTokens2 } = require('../helper/solana');
const fallbackData = require('./fallback.json');

const ASSET_MANAGER_CONTRACT = 'asset-manager.orderly-network.near';
const GET_LISTED_TOKENS_METHOD = 'get_listed_tokens';
const FT_NEAR = 'wrap.near';

const OWNER_MAP = {
  '1': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '10': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '56': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '137': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '42161': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '43114': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '8453': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '5000': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '1329': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '146': '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9',
  '1514': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '2741': '0xE80F2396A266e898FBbD251b89CFE65B3e41fD18',
  '2818': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '34443': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '80094': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '98866': '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
  '900900900': '2AoLiH5kVBG2ot1qKoh4ro8F95KQb7HEBbJmkxrwYBec',
}

const CHAIN_MAPPING = {
  '1': 'ethereum',
  '10': 'optimism', 
  '56': 'bsc',
  '137': 'polygon',
  '42161': 'arbitrum',
  '43114': 'avax',
  '8453': 'base',
  '5000': 'mantle',
  '1329': 'sei',
  '146': 'sonic',
  '1514': 'sty',
  '2741': 'abstract',
  '2818': 'morph',
  '34443': 'mode',
  '80094': 'berachain',
  '98866': 'plume',
  '900900900': 'solana',
}

async function fetchTokenData() {
  try {
    const response = await fetch('https://api.orderly.org/v1/public/token');
    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.rows) {
      console.error('Failed to fetch token data from Orderly API, using fallback data');
      return fallbackData.data.rows.filter(token => token.is_collateral);
    }
    
    const collateralTokens = data.data.rows.filter(token => token.is_collateral);
    return collateralTokens;
  } catch (error) {
    console.error('Error fetching token data:', error);
    console.log('Using fallback data due to API error');
    return fallbackData.data.rows.filter(token => token.is_collateral);
  }
}

let tokenDataByChain = null;
let initializationPromise = null;

async function initializeTokenData() {
  if (tokenDataByChain) return tokenDataByChain;
  if (initializationPromise) return initializationPromise;
  
  initializationPromise = (async () => {
    const tokens = await fetchTokenData();
    tokenDataByChain = {};
    
    tokens.forEach(token => {
      token.chain_details.forEach(chainDetail => {
        const mappedChain = CHAIN_MAPPING[chainDetail.chain_id];
        if (mappedChain) {
          if (!tokenDataByChain[mappedChain]) {
            tokenDataByChain[mappedChain] = [];
          }
          
          if (chainDetail.contract_address === '') {
            tokenDataByChain[mappedChain].push(nullAddress);
          } else if (chainDetail.contract_address) {
            tokenDataByChain[mappedChain].push(chainDetail.contract_address);
          }
        }
      });
    });
    
    return tokenDataByChain;
  })();
  
  return initializationPromise;
}

async function tvl() {
  let ftTokens = (await call(ASSET_MANAGER_CONTRACT, GET_LISTED_TOKENS_METHOD, {})).filter(address => address.includes('.'));

  // NOTE: balances for FT tokens
  let balances = await addTokenBalances(ftTokens, ASSET_MANAGER_CONTRACT);

  // NOTE: add near balance for tokens
  const asset_manager_contract_state = await view_account(ASSET_MANAGER_CONTRACT);
  sumSingleBalance(balances, FT_NEAR, asset_manager_contract_state['amount']);

  return balances;
}

function createEvmTvl(chainName) {
  return async () => {
    await initializeTokenData();
    const chainTokens = tokenDataByChain[chainName] || [];
    
    if (chainTokens.length === 0) {
      return {};
    }
    
    const chainId = Object.keys(CHAIN_MAPPING).find(id => CHAIN_MAPPING[id] === chainName);
    const owner = OWNER_MAP[chainId];
    if (!owner) {
      console.error(`No owner found for chain ${chainName} (${chainId})`);
      return {};
    }
    
    return sumTokensExport({ owner, tokens: chainTokens, chain: chainName })();
  };
}

module.exports = {
  timetravel: false,
  near: { tvl },
  methodology: 'All the tokens deposited into Orderly Network by chain'
};

function createSolanaTvl() {
  return async () => {
    await initializeTokenData();
    const solanaTokens = tokenDataByChain['solana'] || [];
    
    if (solanaTokens.length === 0) {
      return {};
    }
    
    const solanaOwner = OWNER_MAP['900900900'];
    if (!solanaOwner) {
      console.error('No Solana owner found');
      return {};
    }
    
    return sumTokens2({ owners: [solanaOwner], tokens: solanaTokens });
  };
}

module.exports.solana = { 
  tvl: createSolanaTvl()
};

Object.values(CHAIN_MAPPING).forEach(chainName => {
  if (chainName !== 'solana') {
    module.exports[chainName] = {
      tvl: createEvmTvl(chainName)
    };
  }
});