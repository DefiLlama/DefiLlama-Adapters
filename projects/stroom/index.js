const STRBTC = '0xb2723d5df98689eca6a4e7321121662ddb9b3017'

async function tvl(api) {
  const supply = await api.call({
    abi: 'erc20:totalSupply',
    target: STRBTC,
  })
  // supply in satoshi → convert to BTC
  api.addCGToken('bitcoin', Number(supply) / 1e8)
}

module.exports = {
  methodology: 'TVL equals the BTC backing strBTC. We read strBTC totalSupply (in satoshis) on Ethereum, divide by 1e8 to get BTC, and value it using the BTC price.',
  start: 23045877,
  ethereum: {
    tvl,
  },
} 