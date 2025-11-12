const { functionViewWithApiKey } = require("../helper/chain/aptos");
const cellanaAddress = "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1"
const apiKey = "AG-D6FATNFSEBBKFTMMXVFRXKIDZWJJFFDPC"

async function _getPools() {
  return functionViewWithApiKey({ functionStr: `${cellanaAddress}::liquidity_pool::all_pool_addresses`, type_arguments: [], args: [], apiKey: apiKey })
}

async function _getPoolReserves(poolAddress) {
  return functionViewWithApiKey({ functionStr: `${cellanaAddress}::liquidity_pool::pool_reserves`, type_arguments: ['0x1::object::ObjectCore'], args: [poolAddress], apiKey: apiKey })
}

async function _getTokenOfPool(poolAddress) {
  return functionViewWithApiKey({ functionStr: `${cellanaAddress}::liquidity_pool::supported_token_strings`, type_arguments: [], args: [poolAddress], apiKey: apiKey })
}


async function _getTvl() {
  const pools = (await _getPools())
  const tokenTvlMap = new Map();

  for (const pool of pools) {
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
    "Counts the lamports in each coin container in the Cellena contract account.",
  aptos: {

    tvl: async (api) => {
      const tokenTvlMap = await _getTvl()
      console.log(tokenTvlMap)
      for (const [key, value] of tokenTvlMap) {
        api.add(key, value)
      }
    }
  }
}