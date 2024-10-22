const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  xdc: { tvl: sumTokensExport({ owner: '0xcB71dC7b30205eB7Ce27B2cB36b24ba331ecD42a', tokens: [ADDRESSES.xdc.WXDC], logCalls: true }) },
  ethereum: { tvl: sumTokensExport({
      tokensAndOwners: [
      [ADDRESSES.ethereum.USDT,'0x8936761f2903ed1af2b269e6fa3a79ebb0162c51'],
      [ADDRESSES.ethereum.WETH,'0x8936761f2903ed1af2b269e6fa3a79ebb0162c51'],
      [ADDRESSES.ethereum.USDT, '0x37aca97a99d1b4260a5e9821d0ef14947fb68970'],
      [ADDRESSES.ethereum.WETH, '0x37aca97a99d1b4260a5e9821d0ef14947fb68970'],
      ['0x4a220e6096b25eadb88358cb44068a3248254675', '0x37aca97a99d1b4260a5e9821d0ef14947fb68970'],
      ],
      logCalls: true
    }) 
  },
}