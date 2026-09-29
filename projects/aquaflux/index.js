const ADDRESSES = require('../helper/coreAssets.json')

const CORE = '0x0da98a8447b6B4aDD9733011A812922954d3e127'
const PALPHA = '0xE47E9bA4EA2320A6ed87246d02Fd5C38485Ed7d1'

async function tvl(api) {
  const balance = await api.call({ abi: 'erc20:balanceOf', target: PALPHA, params: [CORE] })
  const assets = await api.call({
    abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
    target: PALPHA,
    params: [balance],
  })
  const coreTVL = BigInt(assets)
  api.add(ADDRESSES.pharos.USDC, coreTVL)
}

module.exports = {
  doublecounted: true,
  methodology:
    'Counts vault assets held by AquaFluxCore.',
  pharos: {
    tvl,
  },
}
