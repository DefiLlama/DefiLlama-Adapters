const { function_view } = require("../helper/chain/aptos");
const contractAddress = "0x12169b6e1bf75ab1a2b2d987d20f8dd4c191e5dbc2066cb7e9af40b1fa7fb659"

async function _getAllPools() {
  return function_view({ functionStr: `${contractAddress}::liquidity_pool::pools`, type_arguments: [], args: [] })
}

async function _getPoolReserves(poolAddress) {
  return function_view({ functionStr: `${contractAddress}::liquidity_pool::pool_reserves`, type_arguments: [], args: [poolAddress] })
}

async function _getTokenOfPool(poolAddress) {
  return function_view({ functionStr: `${contractAddress}::liquidity_pool::supported_inner_assets`, type_arguments: [], args: [poolAddress] })
}

async function _getTvl() {
  const allPools = (await _getAllPools())
  const tokenTvlMap = new Map();

  for (const pool of allPools) {
    const poolAddress = pool.inner
    try {
      const reserves = await _getPoolReserves(poolAddress);
      const tokens = await _getTokenOfPool(poolAddress); 

      if (!reserves || !tokens || tokens.length < 2) {
        console.warn(`Invalid data for pool ${poolAddress}`);
        continue;
      }

      const reserveX = Number(reserves[0] || 0);
      const reserveY = Number(reserves[1] || 0);

      const tokenX = tokens[0];
      const tokenY = tokens[1];

      tokenTvlMap.set(tokenX, (tokenTvlMap.get(tokenX) || 0) + reserveX);
      tokenTvlMap.set(tokenY, (tokenTvlMap.get(tokenY) || 0) + reserveY);

    } catch (error) {
      console.error(`Error processing pool ${poolAddress}:`, error);
    }
  }
  return tokenTvlMap
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the total liquidity in all pools on Earnium.",
  aptos: {
    tvl: async (api) => {
      const tokenTvlMap = await _getTvl()
      for (const [key, value] of tokenTvlMap) {
        api.add(key.inner, value)
      }
    }
  }
}
