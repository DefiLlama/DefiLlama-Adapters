const ADDRESSES = require('../helper/coreAssets.json')

// https://usd8.fi/docs/addresses.html
const TREASURY = '0x0EaE2d44dfeb2154F60CD702Dc2C9c5aBb090F05'
const REGISTRY = '0x9BfF24a44Bb20F8D1f1dE86EcA56295c5Bb46430'
const USD8 = '0x2fE01f5E235eeaB9045066f873f531dE20f31947'

async function tvl(api) {
  // USDC backing USD8: idle in the Treasury plus USDC deployed to its reserve strategies.
  const reserve = await api.call({ target: TREASURY, abi: 'uint256:getReserveBalance' })
  api.add(ADDRESSES.ethereum.USDC, reserve)

  // Cover Pools: single-asset ERC-4626 vaults that back USD8's DeFi insurance payouts.
  const [assets, pools] = await api.call({
    target: REGISTRY,
    abi: 'function coverPools() view returns (address[] assets, address[] poolAddrs)',
  })
  const balances = await api.multiCall({ abi: 'uint256:totalAssets', calls: pools })
  // a USD8 cover pool holds USD8, which the reserve above already backs
  assets.forEach((asset, i) => { if (asset.toLowerCase() !== USD8.toLowerCase()) api.add(asset, balances[i]) })
}

module.exports = {
  methodology: 'TVL is the USDC reserve backing USD8 (held by the Treasury or deployed to its reserve strategies, read from Treasury.getReserveBalance) plus the assets deposited in USD8 Cover Pools (totalAssets of each pool listed by the Registry), excluding any USD8 Cover Pool since that USD8 is already backed by the reserve. Reserve USDC supplied to Morpho through a strategy is also counted in Morpho TVL.',
  start: '2026-10-17',
  doublecounted: true,
  ethereum: { tvl },
}
