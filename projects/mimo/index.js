const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const config = {
  ethereum: 
  {
    vaultCore: [
      '0x68E88c802F146eAD2f99F3A91Fb880D1A2509672', //PAR
      '0x917b9D8E62739986EC182E0f988C7F938651aFD7', //paUSD
    ],
    collaterals: [
      ADDRESSES.ethereum.WETH, //wETH
      ADDRESSES.ethereum.WBTC, //wBTC
      ADDRESSES.ethereum.USDC, //USDC
      ADDRESSES.ethereum.RAI, //RAI
      ADDRESSES.ethereum.LUSD, //LUSD
      ADDRESSES.ethereum.CRV, //CRV
      ADDRESSES.ethereum.BAL, //BAL
      ADDRESSES.ethereum.AAVE, //AAVE
      ADDRESSES.ethereum.LINK, //LINK
      ADDRESSES.ethereum.SUSHI, //SUSHI
      ADDRESSES.ethereum.FRAX, //FRAX
      ADDRESSES.ethereum.DAI, //DAI
      ADDRESSES.ethereum.WSTETH, //WSTETH
      ADDRESSES.ethereum.RETH, //RETH
      ADDRESSES.ethereum.cbETH, //cbETH
      ADDRESSES.ethereum.CRVUSD, //CRVUSD
      ADDRESSES.ethereum.pyUSD, //pyUSD
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', //MKR
      '0xaF4ce7CD4F8891ecf1799878c3e9A35b8BE57E09' //wUSK
    ],
  },
  polygon:  {
      vaultCore: [
        '0x78C48A7d7Fc69735fDab448fe6068bbA44a920E6', //PAR
        '0xc0459Eff90be3dCd1aDA71E1E8BDB7619a16c1A4', //paUSD
      ],
      collaterals: [
        ADDRESSES.polygon.WMATIC_2, //wMATIC 
        ADDRESSES.polygon.stMATIC, //stMATIC
        ADDRESSES.polygon.MATICX, //MATICX  
        ADDRESSES.polygon.WETH_1, //wETH 
        ADDRESSES.polygon.WBTC, //wBTC 
        ADDRESSES.polygon.USDC, //USDC 
        ADDRESSES.polygon.USDC_CIRCLE, //USDC_CIRCLE 
        ADDRESSES.polygon.CRV, //CRV 
        ADDRESSES.polygon.BAL, //BAL 
        ADDRESSES.polygon.AAVE, //AAVE 
        ADDRESSES.polygon.LINK, //LINK 
        ADDRESSES.polygon.SUSHI, //SUSHI
        ADDRESSES.polygon.DAI, //DAI
        ADDRESSES.polygon.WSTETH, //WSTETH
        "0x01d1a890D40d890d59795aFCce22F5AdbB511A3a", //wFRK
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