const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const config = {
  ethereum: [
    // ['0xef9cd7882c067686691b6ff49e650b43afbbcc6b', '0x919a35A4F40c479B3319E3c3A2484893c06fd7de'],
    [ADDRESSES.ethereum.USDC, '0xff60d81287BF425f7B2838a61274E926440ddAa6'],
    [ADDRESSES.ethereum.USDT, '0xff60d81287BF425f7B2838a61274E926440ddAa6'],
    [ADDRESSES.ethereum.FRAX, '0x6f88e8fbF5311ab47527f4Fb5eC10078ec30ab10'],
  ],
  wan: [
    // ['0xC6F4465A6a521124C8e3096B62575c157999D361', '0xe96E4d6075d1C7848bA67A6850591a095ADB83Eb'],
    ['0x11e77E27Af5539872efEd10abaA0b408cfd9fBBD', '0x297FF55afEF50C9820d50eA757B5bEBa784757AD'],
  ],
  bsc: [
    // ['0xdfd9e2a17596cad6295ecffda42d9b6f63f7b5d5', '0xf2E1641b299e60a23838564aAb190C52da9c9323'],
    [ADDRESSES.bsc.BUSD, '0xA3f70ADd496D2C1c2C1Be5514A5fcf0328337530'],
    [ADDRESSES.bsc.USDT, '0xA3f70ADd496D2C1c2C1Be5514A5fcf0328337530'],
  ],
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2021-5-17')/1e3), 'FinNexus erc20 contract is hacked'],
  ],
}

Object.keys(config).forEach(chain => {
  const tokensAndOwners = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokensAndOwners, })
  }
})


