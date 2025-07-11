const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const config = {
  ethereum: { contract: '0xDFcB2aB25b7978C112E9E08a2c70d52b035F1776', tokens: [nullAddress, ADDRESSES.ethereum.WETH, '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d'] }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: config[chain].contract, tokens: config[chain].tokens, })
  }
})