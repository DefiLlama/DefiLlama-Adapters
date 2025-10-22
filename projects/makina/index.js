const ADDRESSES = require('../helper/coreAssets.json')

const dUSDUSDCcurveLP = '0x32E616F4f17d43f9A5cd9Be0e294727187064cb3'
const dETHETHcurveLP = '0x7D8b8344f2Acc6C1Edba0dA1B5313AF1e30C3369'
const dBITWBTCcurveLP = '0x466eBB6eEeC7a3fd0628f6b05E53E848f9F3451F'

async function tvl(api) {
  // Get the underlying tokens and balances for each Curve LP
  await unwrapCurveLP(api, dUSDUSDCcurveLP)
  await unwrapCurveLP(api, dETHETHcurveLP)
  await unwrapCurveLP(api, dBITWBTCcurveLP)
}

async function unwrapCurveLP(api, lpToken) { 
  // Get the underlying tokens (coins)
  const coins = await api.multiCall({
    abi: 'function coins(uint256) view returns (address)',
    calls: [0, 1].map(i => ({ target: lpToken, params: [i] }))
  })
  
  // Get the balances of underlying tokens in the pool
  const balances = await api.multiCall({
    abi: 'function balances(uint256) view returns (uint256)',
    calls: [0, 1].map(i => ({ target: lpToken, params: [i] }))
  })
  
  // Add the underlying tokens to the TVL
  coins.forEach((coin, i) => {
    if (coin && coin !== ADDRESSES.null) {
      api.add(coin, balances[i])
    }
  })
}


module.exports = {
  methodology: 'Token balance in strategy contracts',
  doublecounted: true, // Curve LPs
  start: '2025-09-29', // Monday, September 29, 2025 12:00:00 AM,
  ethereum: {
    tvl,
  },
}