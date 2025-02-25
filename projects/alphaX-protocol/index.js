const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const walletAddresses = {
  ethereum: ['0xA61a6E696B7C566DA42B80dA27d96e7104bcec99'],
  arbitrum: ['0x552E7A55802f3350C707a243E402aa50Eda9D286']
}

const tokenAddress = {
  ethereum: [ADDRESSES.ethereum.USDT],
  arbitrum: [ADDRESSES.arbitrum.USDT],
}

Object.keys(walletAddresses).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: walletAddresses[chain], tokens: tokenAddress[chain], })
  }
})