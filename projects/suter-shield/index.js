const { sumTokensExport,  } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/tokenMapping')
const config = {
  ethereum: [
    [ADDRESSES.null, '0x02b4E089E96a0A672dE0a0d93E2869B899b15a44'],
    [nullAddress, '0x934cc5704165711296207b5AFc87933AE0685a4C'],
    [ADDRESSES.ethereum.USDT, '0x29abf1a011cdfb9548dc8faa6d19b1b39808bf58'],
    [ADDRESSES.ethereum.USDT, '0xB8fcF79EAd34E98e45fc21E5dB1C5C561d906371'],
    [ADDRESSES.ethereum.DAI, '0x54A8e0C76Eec21DD30842FbbcA2D336669102b77'],
    [ADDRESSES.ethereum.DAI, '0xbdf418486D438e44F5aAC6aF86330dA638ea70AD'],
  ], bsc: [
    [ADDRESSES.null, '0x2A00d7d2de1E147a3BCAa122B4EC5D6f9F0c1147'],
    [ADDRESSES.null, '0x5bb6eE37a6503fe381207c3BAC0Aa6d7B33590Fa'],
    [ADDRESSES.bsc.BUSD, '0xe557c77Ed24df7cDF21ED55a8C56Ea36CeBD5BD2'],
    [ADDRESSES.bsc.BUSD, '0x382926Ba4D92E5d7652A85Aa7085Ffb15b6b6C89'],
    ['0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', '0x8cc4c8529c0D8bb9B9FA197530d656cCBcB88DeB'],
    ['0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', '0xa19e53Af2381F34AEcA80cDcEBF6c4a3F37037a2'],
    ['0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5', '0x9D529c70fD8e072786b721190f6E6B30e433690a'],
    ['0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5', '0x6F3Ad49e287c2dC12aA5f0bD9e8173C57d1AdECa'],
  ]
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners: config[chain], })
  }
})
