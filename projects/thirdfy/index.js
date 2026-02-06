const { sumTokens2 } = require("../helper/unwrapLPs");
const { cachedGraphQuery } = require('../helper/cache');

const BASE_CHAIN = 'base';
const ALGEBRA_SUBGRAPH_URL = "https://api.studio.thegraph.com/query/47039/thirdfy-base/version/latest";
const ICHI_SUBGRAPH_URL = "https://api.studio.thegraph.com/query/88584/base-v-2-thirdfy/version/latest";

async function tvl(api) {
  const [poolsData, vaultsData] = await Promise.all([
    getAlgebraPoolsData(),
    getIchiVaultsData()
  ]);

  const allOwners = [...poolsData.owners, ...vaultsData.owners];
  const allTokensSet = new Set([...poolsData.tokens, ...vaultsData.tokens]);
  const allTokens = Array.from(allTokensSet);

  return sumTokens2({ 
    owners: allOwners, 
    tokens: allTokens, 
    api 
  });
}

async function getAlgebraPoolsData() {
  const query = `
    query {
      pools(
        where: { liquidity_gt: "0" }
        first: 1000
        orderBy: totalValueLockedUSD
        orderDirection: desc
      ) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `;

  const data = await cachedGraphQuery('thirdfy-algebra', ALGEBRA_SUBGRAPH_URL, query);
  const pools = data?.pools || [];

  const owners = pools.map(pool => pool.id);
  const tokensSet = new Set();
  
  pools.forEach(pool => {
    tokensSet.add(pool.token0.id);
    tokensSet.add(pool.token1.id);
  });
  
  return {
    owners,
    tokens: Array.from(tokensSet)
  };
}


async function getIchiVaultsData() {
  const query = `
    query {
      ichiVaults(
        first: 100
        orderBy: totalSupply
        orderDirection: desc
        where: { 
          totalSupply_gt: "0"
        }
      ) {
        id
        token0
        token1
        totalAmount0
        totalAmount1
      }
    }
  `;

  const data = await cachedGraphQuery('thirdfy-ichi', ICHI_SUBGRAPH_URL, query);
  const vaults = data?.ichiVaults || [];


  const owners = [];
  const tokensSet = new Set();
  
  vaults.forEach(vault => {
    const amount0 = parseFloat(vault.totalAmount0 || 0);
    const amount1 = parseFloat(vault.totalAmount1 || 0);
    
    if (amount0 > 0 || amount1 > 0) {
      owners.push(vault.id);
      
      if (amount0 > 0) tokensSet.add(vault.token0);
      if (amount1 > 0) tokensSet.add(vault.token1);
    }
  });
  
  return {
    owners,
    tokens: Array.from(tokensSet)
  };
}

module.exports = {
  methodology: "TVL: Total value of all coins held in the smart contracts of the protocol",
  start: 1752451200,
  [BASE_CHAIN]: { tvl },
};
