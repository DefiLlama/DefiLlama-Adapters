const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const config = {
  ethereum: {
    vaultCore: ['0x4026BdCD023331D52533e3374983ded99CcBB6d4'],
    collaterals: [
    ADDRESSES.ethereum.WETH, //wETH
    ADDRESSES.ethereum.WBTC, //wBTC
    ADDRESSES.ethereum.USDC, //USDC
    ],
  },
  polygon: {
    vaultCore: ['0x03175c19cb1d30fa6060331a9ec181e04cac6ab0'],
    collaterals: [
      ADDRESSES.polygon.WMATIC_2, //wMATIC
      ADDRESSES.polygon.WETH_1, //wETH
      ADDRESSES.polygon.WBTC, //wBTC
      ADDRESSES.polygon.USDC, //USDC
    ],
  },
  fantom: {
    vaultCore: ['0xB2b4feB22731Ae013344eF63B61f4A0e09fa370e'],
    collaterals:[
      ADDRESSES.fantom.WFTM, //wFTM
      '0x74b23882a30290451A17c44f4F05243b6b58C76d', //ETH
      '0x321162Cd933E2Be498Cd2267a90534A804051b11', //BTC
      ADDRESSES.fantom.USDC, //USDC
    ],
  }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { vaultCore: owners, collaterals: tokens } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, owners, tokens, })
  }
})