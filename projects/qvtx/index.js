// QVTX TVL Protocol Adapter for DefiLlama
// Tracks pQUSD (fiat-backed USD stablecoin) total supply on Polygon.
// Pool TVL tracked via stablecoins: https://github.com/DefiLlama/peggedassets-server
// Protocol: https://qvtx.net

const sdk = require('@defillama/sdk')

const PQUSD = '0x8d58dEbF89740Da1416d5f1904E4286096174B5A'

async function tvl(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: PQUSD })
  api.add(PQUSD, supply)
}

module.exports = {
  methodology: 'TVL counts pQUSD (fiat-backed USD stablecoin) total supply on Polygon. Each pQUSD is backed 1:1 by USD reserves held by Quantvestrix Inc.',
  polygon: { tvl },
}
