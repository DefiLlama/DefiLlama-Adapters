const ADDRESSES = require('../helper/coreAssets.json')

// trUSD, the Tori Finance synthetic dollar (Ethereum, 18 decimals).
const trUSD = '0xd0580192E98eA6CEB9c7b6191Ed2E27560911697'

async function tvl(api) {
  // TVL is the circulating supply of trUSD, the Tori Finance synthetic dollar, on Ethereum.
  // trUSD is valued 1:1 in USD (via USDC, which DefiLlama prices at ~$1) until trUSD is
  // priced directly by DefiLlama's coins oracle. Supply is normalised from 18 to 6 decimals.
  const supply = await api.call({ target: trUSD, abi: 'erc20:totalSupply' })
  api.add(ADDRESSES.ethereum.USDC, supply / 1e12)
}

module.exports = {
  methodology: 'TVL is the circulating supply of trUSD, the Tori Finance synthetic dollar, on Ethereum, valued 1:1 in USD. The same supply is reported in the stablecoins dataset, so this protocol is marked doublecounted to avoid inflating aggregate DeFi TVL.',
  doublecounted: true,
  ethereum: { tvl },
}
