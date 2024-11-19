const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const vaults = [
  '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88',
  '0x7223442cad8e9cA474fC40109ab981608F8c4273',
  '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
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
  for (let i = 0; i < vaults.length; i++) {
    const bv = vaults[i]
    const ba = vaultAccountant[i]
    const bvSupply = await api.call({
      target: bv,
      abi: 'uint256:totalSupply',
    });
    let [base, quote] = await Promise.all([
      api.call({
        target: ba,
        abi: "function base() external view returns (address)",
      }),
      api.call({
        target: ba,
        abi: "function getRate() external view returns (uint256 rate)",
      }),
    ]);
    if(base.toLowerCase() === String(ADDRESSES.ethereum.WETH).toLowerCase()) {
      base = ADDRESSES.ethereum.EETH
    } 
    const denominator = Math.pow(10, (String(quote).length-1))
    api.add(base, bvSupply * quote / denominator ) 
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: vaultsTvl,
  },
}