const ADDRESSES = require('../helper/coreAssets.json')

const vaults = [
  '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88',
  '0x7223442cad8e9cA474fC40109ab981608F8c4273',
  ADDRESSES.ethereum.EBTC,
  '0x352180974C71f84a934953Cf49C4E538a6F9c997',
  '0xeDa663610638E6557c27e2f4e973D3393e844E70',
]

const vaultAccountant = [
  '0xbe16605B22a7faCEf247363312121670DFe5afBE',
  '0x126af21dc55C300B7D0bBfC4F3898F558aE8156b',
  '0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F',
  '0xBae19b38Bf727Be64AF0B578c34985c3D612e2Ba',
  '0x1D4F0F05e50312d3E7B65659Ef7d06aa74651e0C',
]

async function vaultsTvl(api) {
  const supplies = await api.multiCall({ calls: vaults, abi: 'uint256:totalSupply' })
  const quotes = await api.multiCall({ calls: vaultAccountant, abi: 'uint256:getRate' })
  const bases = await api.multiCall({ calls: vaultAccountant, abi: 'address:base' })
  for (let i = 0; i < vaults.length; i++) {
    const bvSupply = supplies[i]
    let base = bases[i]
    const quote = quotes[i]
    if (base.toLowerCase() === ADDRESSES.ethereum.WETH.toLowerCase())
      base = ADDRESSES.ethereum.EETH

    const denominator = Math.pow(10, (String(quote).length - 1))
    api.add(base, bvSupply * quote / denominator)
  }
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: vaultsTvl,
  },
}