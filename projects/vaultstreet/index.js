const tokens = [
  '0x7ea76108975ec0998b9bc2db04b4eca986400dd7', // primeUSD
  '0xF05F7Ab9B05D9Dcf99B8E9bBAE8E5e4A3201D004', // CARRY
]

async function tvl(api) {
  api.add(tokens, await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' }))
}

module.exports = {
  methodology: 'TVL is the total supply of primeUSD and CARRY.',
  doublecounted: true,
  ethereum: { tvl },
}
