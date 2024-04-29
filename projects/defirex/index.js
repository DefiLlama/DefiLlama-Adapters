const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      ownerTokens: [
        {
          tokens: [nullAddress, ADDRESSES.ethereum.USDT /*USDT*/, ADDRESSES.ethereum.DAI/*DAI*/],
          holders: '0xb942ca22e0eb0f2524F53f999aE33fD3B2D58E3E',      // Strategy controller contract
        },
        {
          tokens: ['0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643'/*cDAI*/, '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'/*cETH*/],
          holders: '0x0BCbAb2FeCC30B7341132B4Ebb36d352E035f1bD',      // Wallet strategy contract with user funds deposited in Compound
        },
        {
          tokens: [ADDRESSES.ethereum.DAI /*DAI*/],
          holders: '0x65D4853d663CeE114A0aA1c946E95479C53e78c2',      // user rewards in DAI token
        }].map(i => [i.tokens, i.holders])
    }),
  }
}