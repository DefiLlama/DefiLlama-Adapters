/**
 * Maple Finance TVL & Borrowed Amounts Adapter
 * 
 * This adapter fetches data from Maple Finance's GraphQL API to calculate:
 * - Total Value Locked (TVL): Pool cash and cash in DeFi strategies on Ethereum, plus loan
 *   collateral booked on the chain it is actually custodied on (BTC on bitcoin, XRP on ripple, ...)
 * - Total Borrowed: Sum of all principal out (active loans)
 * - Total Staking: Sum of all staked assets in stSYRUP ERC-4626 vault
 * 
 * 
 * References:
 * - Maple Finance API Docs: https://studio.apollographql.com/public/maple-api/variant/mainnet/home
 * 
 */

const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');
const axios = require('axios');

const stSYRUP = "0xc7E8b36E0766D9B04c93De68A9D47dD11f260B45";

const POOL_V2_START_BLOCK = 16186377;
const STAKING_START_BLOCK = 20735662;

// Loans are issued from Ethereum pools but the collateral is custodied natively, so each
// collateral asset is credited to its own chain instead of the pool's chain
const COLLATERALS = {
  BTC: { chain: 'bitcoin', cgId: 'bitcoin' },
  XRP: { chain: 'ripple', token: ADDRESSES.ripple.XRP },
  HYPE: { chain: 'hyperliquid', cgId: 'hyperliquid' },
  SOL: { chain: 'solana', token: ADDRESSES.solana.SOL },
  jitoSOL: { chain: 'solana', token: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn' },
  ETH: { chain: 'ethereum', token: ADDRESSES.null },
  WBTC: { chain: 'ethereum', token: ADDRESSES.ethereum.WBTC },
  LBTC: { chain: 'ethereum', token: ADDRESSES.ethereum.LBTC },
  cbBTC: { chain: 'ethereum', token: ADDRESSES.ethereum.cbBTC },
  sUSDS: { chain: 'ethereum', token: ADDRESSES.ethereum.sUSDS },
  USDG: { chain: 'ethereum', token: ADDRESSES.ethereum.USDG },
  USDC: { chain: 'ethereum', token: ADDRESSES.ethereum.USDC },
  USDT: { chain: 'ethereum', token: ADDRESSES.ethereum.USDT },
  USTB: { chain: 'ethereum', token: '0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e' },
  USDtb: { chain: 'ethereum', token: '0xC139190F447e929f090Edeb554D95AbB8b18aC1C' },
  weETH: { chain: 'ethereum', token: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee' },
  tETH: { chain: 'ethereum', token: '0xD11c452fc99cF405034ee446803b6F6c1F6d5ED8' },
  USR: { chain: 'ethereum', token: '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110' },
  ATH: { chain: 'ethereum', token: '0xbe0Ed4138121EcFC5c0E56B40517da27E6c5226B' },
};

const ENDPOINT = "https://api.maple.finance/v2/graphql";
const POOLS_QUERY = `
  query example($block: Block_height) {
    poolV2S(block: $block) {
      name
      collateralValue
      principalOut
      strategiesDeployed
      assets
      asset {
        symbol
      }
      poolMeta {
        poolCollaterals {
          assetSymbol
          assetDecimals
          assetAmount
        }
      }
    }
  }
`;

// every chain's tvl needs the same snapshot, keyed by run timestamp so only one request is made
const poolCache = {};

/**
 * Fetches pool data from Maple Finance's GraphQL API, at the Ethereum block of the current run
 * @param {Object} api DefiLlama SDK api object
 * @returns {Promise<Array<{name: string, collateralValue: string, principalOut: string, strategiesDeployed: string, assets: string, asset: {symbol: string}, poolMeta: {poolCollaterals: Array<{assetSymbol: string, assetDecimals: number, assetAmount: string}>}}>>} Array of pool objects
 */
const getPools = async (api) => {
  const key = api.timestamp ?? 'latest';
  if (!poolCache[key]) poolCache[key] = fetchPools(api);
  return poolCache[key];
};

const fetchPools = async (api) => {
  const ethApi = api.chain === 'ethereum' ? api : new sdk.ChainApi({ chain: 'ethereum', timestamp: api.timestamp });
  const block = await ethApi.getBlock();

  if (block < POOL_V2_START_BLOCK) {
    sdk.log('Maple: impossible to backfill - the queried block is earlier than the deployment block of poolsV2');
    return [];
  }

  const payload = { query: POOLS_QUERY, variables: { block: { number: block - 10 } } };
  const { data } = await axios.post(ENDPOINT, payload);
  return data.data.poolV2S;
};

/**
 * Adds the loan collateral that is custodied on the given chain
 * @param {Object} api DefiLlama SDK api object
 * @param {Array} pools Pools returned by getPools
 */
const addCollateral = (api, pools) => {
  pools.forEach(({ name, collateralValue, poolMeta }) => {
    const collaterals = (poolMeta?.poolCollaterals ?? []).filter(({ assetAmount }) => Number(assetAmount) > 0);
    // a pool that reports collateral but lists none would silently drop out of tvl
    if (!collaterals.length && Number(collateralValue) > 0) throw new Error(`Maple: pool ${name} reports collateral but lists no collateral assets`);
    collaterals.forEach(({ assetSymbol, assetDecimals, assetAmount }) => {
      const collateral = COLLATERALS[assetSymbol];
      if (!collateral) throw new Error(`Maple: unmapped collateral asset ${assetSymbol} in pool ${name}`);
      if (collateral.chain !== api.chain) return;
      if (collateral.cgId) api.addCGToken(collateral.cgId, Number(assetAmount) / 10 ** assetDecimals);
      else api.add(collateral.token, assetAmount); // Maple reports the amount in the token's own decimals
    });
  });
};

/**
 * Pool cash plus cash deployed in DeFi strategies, both denominated in the pool asset
 * @param {Object} api DefiLlama SDK api object
 */
const addPoolCash = (api, pools) => {
  pools.forEach(({ asset: { symbol }, assets, strategiesDeployed }) => {
    const token = ADDRESSES.ethereum[symbol] ?? null;
    if (!token) return;
    api.add(token, Number(assets) + Number(strategiesDeployed));
  });
};

const ethereumTvl = async (api) => {
  const pools = await getPools(api);
  addPoolCash(api, pools);
  addCollateral(api, pools);
};

const collateralTvl = async (api) => {
  addCollateral(api, await getPools(api));
};

const borrowed = async (api) => {
  const pools = await getPools(api);
  pools.forEach(({ asset: { symbol }, principalOut }) => {
    const token = ADDRESSES.ethereum[symbol] ?? null;
    if (!token) return;
    api.add(token, Number(principalOut));
  });
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
  hallmarks: [['2022-12-14', 'V2 Deployment']],
  // poolMeta.poolCollaterals is not block scoped - the API returns the current collateral for any
  // block, so backfilling would rewrite history with today's holdings
  timetravel: false,
  methodology: 'TVL is pool cash and cash deployed in DeFi strategies on Ethereum, plus the loan collateral reported by the Maple API, each collateral asset counted on the chain it is custodied on. Borrowed is the principal outstanding on active loans, staking is the assets held in the stSYRUP vault.',
  ethereum: {
    tvl: ethereumTvl,
    borrowed,
    staking
  },
};

// derived from COLLATERALS so a newly mapped chain cannot be silently dropped for want of an export
Object.values(COLLATERALS).forEach(({ chain }) => {
  if (chain !== 'ethereum' && !module.exports[chain]) module.exports[chain] = { tvl: collateralTvl };
});
