const { function_view } = require("../helper/chain/aptos");
const { sleep } = require("../helper/utils");
const cellanaAddress = "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1"

const MAX_RETRIES = 3;

async function callWithRetry(fn) {
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try { return await fn() } catch (e) {
      if (i === MAX_RETRIES) throw e;
      await sleep(200 * (i + 1));
    }
  }
}

async function _getPools() {
  return function_view({ functionStr: `${cellanaAddress}::liquidity_pool::all_pool_addresses`, type_arguments: [], args: [] })
}

async function _getPoolReserves(poolAddress) {
  return function_view({ functionStr: `${cellanaAddress}::liquidity_pool::pool_reserves`, type_arguments: ['0x1::object::ObjectCore'], args: [poolAddress] })
}

async function _getTokenOfPool(poolAddress) {
  return function_view({ functionStr: `${cellanaAddress}::liquidity_pool::supported_token_strings`, type_arguments: [], args: [poolAddress] })
}


async function tvl(api) {
  const pools = (await _getPools())

  for (const pool of pools) {
    const poolAddress = pool.inner
    const reserves = await callWithRetry(() => _getPoolReserves(poolAddress));
    const tokens = await callWithRetry(() => _getTokenOfPool(poolAddress));

    if (!reserves || !tokens || tokens.length < 2)
      throw new Error(`Invalid data for pool ${poolAddress}`);

    api.add(tokens[0], reserves[0]);
    api.add(tokens[1], reserves[1]);
    await sleep(200);
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the lamports in each coin container in the Cellana contract account.",
  aptos: {
    tvl,
  }
}