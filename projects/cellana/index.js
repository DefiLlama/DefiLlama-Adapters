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


async function tvl(api) {
  const pools = (await _getPools())

  for (const pool of pools) {
    const poolAddress = pool.inner
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
    api.add(tokenX, reserveX);
    api.add(tokenY, reserveY);
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the lamports in each coin container in the Cellena contract account.",
  aptos: {
    tvl,
  }
}