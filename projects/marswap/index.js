const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')

const config = {
  bsc: ['0xe19165248159B6cB2A2e35bF398581C777C9979A'],
  ethereum: ['0x5e763172d59b3b580af29a1c9fa4ac1cee69c5dd'],
  shibarium: ["0xBe0223f65813C7c82E195B48F8AAaAcb304FbAe7","0xd871a3f5d3bB9c00DDB0cC772690351B9712968D"],
  base: ["0xeE42fe6d6Be1eF43701DDAbc417AD22d82C5ecC3"],
  cronos: ["0xD716B78F0002C23190B024fc93C33CF73E30b8A6"],
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {    tvl: sdk.util.sumChainTvls(config[chain].map((factory) => getUniTVL({ factory, useDefaultCoreAssets: true, hasStablePools: true, })))  }
})