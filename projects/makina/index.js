const ADDRESSES = require('../helper/coreAssets.json')

const dUSDUSDCcurveLP = '0x32E616F4f17d43f9A5cd9Be0e294727187064cb3'
const dETHETHcurveLP = '0x7D8b8344f2Acc6C1Edba0dA1B5313AF1e30C3369'
const dBITWBTCcurveLP = '0x466eBB6eEeC7a3fd0628f6b05E53E848f9F3451F'

const curveLPs = [
  {lp: dUSDUSDCcurveLP, underlying: ADDRESSES.ethereum.USDC, decimals: 6},
  {lp: dETHETHcurveLP, underlying: ADDRESSES.ethereum.WETH, decimals: 18},
  {lp: dBITWBTCcurveLP, underlying: ADDRESSES.ethereum.WBTC, decimals: 8},
]

async function tvl(api) {
  // Get total supply for each Curve LP pool
  const totalSupplies = await api.multiCall({
    abi: 'uint256:totalSupply',
    calls: curveLPs.map(({lp}) => ({ target: lp }))
  })
  
  // Add underlying tokens with their corresponding LP total supplies converted to proper decimals
  curveLPs.forEach(({underlying, decimals}, i) => {
    const totalSupply = totalSupplies[i]
    const convertedAmount = BigInt(totalSupply) / (10n ** BigInt(18-decimals))
    api.add(underlying, convertedAmount)
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