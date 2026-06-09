// beatUSD (Hyperbeat USD) - treasury-backed, $1-pegged stablecoin on HyperEVM.
// Minted 1:1 when users deposit into their Hyperbeat account, so total supply
// equals the cash balances held across all accounts. beatUSD is not in
// DefiLlama's price feed, so we value it directly at $1 (6 decimals).
const beatUSD = '0x669abe85F96a9e3B34723F7Be9bC6F250aBC0Cc1'

const tvl = async (api) => {
  const supply = await api.call({ target: beatUSD, abi: 'erc20:totalSupply' })
  api.addUSDValue(supply / 1e6)
}

module.exports = {
  methodology: 'TVL is the total supply of beatUSD (Hyperbeat USD), a treasury-backed $1 stablecoin minted 1:1 against user account balances.',
  start: '2025-11-11',
  hyperliquid: { tvl },
}
