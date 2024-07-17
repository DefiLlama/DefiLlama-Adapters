const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const AUSDC_CONTRACT = '0x4e65fe4dba92790696d040ac24aa414708f5c0ab'
const SZDEBT_CONTRACT = '0xb0a00c4b3d77c896f46dc6b204695e22de7a185d'
const SIZE_PROXY_CONTRACT = '0xC2a429681CAd7C1ce36442fbf7A4a68B11eFF940'
const tokens = [
  ADDRESSES.base.WETH,
  AUSDC_CONTRACT,
]

async function borrowed(api) {
  const totalDebt = await api.call({ abi: 'erc20:totalSupply', target: SZDEBT_CONTRACT, });

  return api.add(ADDRESSES.base.USDbC, totalDebt)
}

module.exports = {
  base: {
    tvl: sumTokensExport({ tokens, owner: SIZE_PROXY_CONTRACT }),
    borrowed
  }
}
