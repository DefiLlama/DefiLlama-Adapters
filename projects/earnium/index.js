const { function_view } = require("../helper/chain/aptos");
const contractAddress = "0x12169b6e1bf75ab1a2b2d987d20f8dd4c191e5dbc2066cb7e9af40b1fa7fb659"

const view = (fn, args = []) => function_view({ functionStr: `${contractAddress}::${fn}`, type_arguments: [], args })

// wrapped FA -> original coin type is a fixed mapping, resolved once per asset
const originalCache = {}
function getOriginal(asset) {
  if (!originalCache[asset]) originalCache[asset] = _getOriginal(asset).catch(e => { delete originalCache[asset]; throw e })
  return originalCache[asset]
}

async function _getOriginal(asset) {
  const original = await view('coin_wrapper::get_original', [asset])
  // the wrapper returns zero-padded accounts (0x000...1::aptos_coin::AptosCoin), pricing keys use the short form
  return original.replace(/^0x0+(?=[0-9a-f])/, '0x')
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the total liquidity in all pools on Earnium.",
  aptos: {
    tvl: async (api) => {
      const pools = await view('liquidity_pool::pools')
      for (const { inner: pool } of pools) {
        // pool_metadata returns (token_a, token_b, reserve_a, reserve_b, ...) in one call,
        // replacing the separate pool_reserves + supported_inner_assets views
        const [tokenA, tokenB, reserveA, reserveB] = await view('liquidity_pool::pool_metadata', [pool])
        api.add(await getOriginal(tokenA.inner), reserveA)
        api.add(await getOriginal(tokenB.inner), reserveB)
      }
    }
  }
}
