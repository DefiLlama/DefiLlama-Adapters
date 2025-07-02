/**
 * Maple Finance TVL & Borrowed Amounts Adapter
 * 
 * This adapter fetches data from Maple Finance's GraphQL API to calculate:
 * - Total Value Locked (TVL): Sum of all pool cash, cash in DeFi strategies, and collateral
 * - Total Borrowed: Sum of all principal out (active loans)
 * - Total Staking: Sum of all staked assets in stSYRUP ERC-4626 vault
 * 
 * 
 * References:
 * - Maple Finance API Docs: https://studio.apollographql.com/public/maple-api/variant/mainnet/home
 * 
 */

const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const stSYRUP = "0xc7E8b36E0766D9B04c93De68A9D47dD11f260B45";

const POOL_V2_START_BLOCK = 16186377;
const STAKING_START_BLOCK = 20735662;

const ENDPOINT = "https://api.maple.finance/v2/graphql";
const POOLS_QUERY = `
  query example($block: Block_height) {
    poolV2S(block: $block) {
      id
      name
      collateralValue
      principalOut
      strategiesDeployed
      tvl
      assets
      asset {
        symbol
      }
      poolMeta {
        state
        asset
        poolCollaterals {
          addresses
          assetAmount
        }
      }
    }
  }
`;

/**
 * Fetches pool data from Maple Finance's GraphQL API
 * @param {number} block Ethereum block number
 * @returns {Promise<Array<{id: string, name: string, collateralValue: string, principalOut: string, strategiesDeployed: string, tvl: string, assets: string[], asset: {symbol: string}, poolMeta: {state: string, asset: string, poolCollaterals: Array<{addresses: string[], assetAmount: string}>}}>>} Array of pool objects
 */
const getPools = async (block) => {
  const payload = {
    query: POOLS_QUERY,
    variables: { block: { number: block - 10 } },
    headers: { "Content-Type": "application/json" }
  };

  const { data } = await axios.post(ENDPOINT, payload);
  return data.data.poolV2S;
};

/**
 * Calculates total value based on specified property and returns API response format
 * @param {Object} api DefiLlama SDK api object
 * @param {string} key Property to sum
 * @returns {Promise<{usd: number}>} Total value in USD
 */
const processPools = async (api, key) => {
  const block = await api.getBlock();
  
  if (block < POOL_V2_START_BLOCK) return console.error('Error: Impossible to backfill - The queried block is earlier than the deployment block of poolsV2');
  const pools = await getPools(block);

  pools.forEach((pool) => {
    const { id, name, asset: { symbol }, assets, collateralValue, principalOut, strategiesDeployed, poolMeta } = pool
    const token = ADDRESSES.ethereum[symbol] ?? null
    if (!token) return;
    const balance = key === "collateralValue" ? Number(collateralValue) + Number(assets) + Number(strategiesDeployed) : Number(principalOut)
    api.add(token, balance)
  })
};

/**
 * Calculates total staked value in Maple's stSYRUP ERC-4626 vault
 * @param {Object} api DefiLlama SDK api object
 * @returns {Promise<Object>} Total staked value in USD
 */
const staking = async (api) => {
  const block = await api.getBlock()
  if (block < STAKING_START_BLOCK) return;
  return api.erc4626Sum({ calls: [stSYRUP], tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })
}

module.exports = {
  hallmarks: [[1670976000, 'V2 Deployment']],
  solana: { tvl: () => ({})},
  ethereum: { 
    tvl: async (api) => processPools(api, "collateralValue"),
    borrowed: async (api) => processPools(api),
    staking
  }
};
