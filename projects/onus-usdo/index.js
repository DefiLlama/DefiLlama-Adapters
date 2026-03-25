const ADDRESSES = require('../helper/coreAssets.json')

const owner = '0x3D513abc13f53A1E18Ae59A7B5B0930E55733C87'
const onuBUSD = '0xdfB5E8a4AC08E46258A12AbE737bba5D8c452508'
const BUSD = ADDRESSES.ethereum.BUSD

const tvl = async (api) => {
  const balance = await api.call({ target: onuBUSD, params: owner, abi: 'erc20:balanceOf' })
  api.add(BUSD, balance, { skipChain: true })
}

module.exports = {
  onus: { tvl }
}