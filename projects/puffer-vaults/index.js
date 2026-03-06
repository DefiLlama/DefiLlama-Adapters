const vaults = [
  '0x196ead472583bc1e9af7a05f860d9857e1bd3dcc',
  '0x82c40e07277eBb92935f79cE92268F80dDc7caB4',
  '0x170d847a8320f3b6a77ee15b0cae430e3ec933a0',
]

const accountants = [
  '0xa9fb7e2922216debe3fd5e1bbe7591ee446dc21c',
  '0xe0bDb7b9225A2CeB42998dc2E51D4D3CDeb7e3Be',
  '0x2afb28b0561d99b5e00829ec2ef54946a00a35f7',
]

async function tvl(api) {
  const supplies = await api.multiCall({ calls: vaults, abi: 'uint256:totalSupply' })
  const quotes = await api.multiCall({ calls: accountants, abi: 'uint256:getRate' })
  const bases = await api.multiCall({ calls: accountants, abi: 'address:base' })

  for (let i = 0; i < vaults.length; i++) {
    const bvSupply = supplies[i]
    let base = bases[i]
    const quote = quotes[i]

    const denominator = Math.pow(10, (String(quote).length - 1))
    api.add(base, bvSupply * quote / denominator)
  }
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: 'Get the total supply of each vault, then multiply by the quote (getRate) to get the TVL of the vault in the base token.',
  ethereum: { tvl },
}
