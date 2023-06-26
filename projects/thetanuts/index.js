const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Ethereum Vaults
const ethCallVault = '0x9014f8E90423766343Ed4fe41668563526dF6715'
const ethPutVault = '0x6d2Cdb589BE6037Df1AeA5dC433829aD5aF30013'
const wbtcCallVault = '0x60a4422B6B52aEF50647c67F29D6a7e6DAc3CCBC'

const lunaPutVault = '0x49d8cde90cefdd4f8568f7d895e686fdb76b146e'
const algoPutVault = '0xC2DD9C7F526C7465D14bbBb25991DaB35f8Ea2B4'
const algoCallVault = '0xb8b5A6E1F300b023e9CdCa31AA94B0D66badd982'
const bitPutVault = '0x4Ca3e8bD2F471415b9131E35bdcEC0819a4E7a83'
const bitCallVault = '0x9F639524db6DfD57613895b0abb49A53c11B3f0e'

// Ethereum - Stronghold IndexUSDC vaults
const indexUSDC_BTC_1wk = "0x3BA337F3167eA35910E6979D5BC3b0AeE60E7d59"
const indexUSDC_ETH_2wk_a = "0xE1c93dE547cc85CBD568295f6CC322B1dbBCf8Ae"
const indexUSDC_AVAX_2wk_b = "0x248038fDb6F00f4B636812CA6A7F06b81a195AB8"
const indexUSDC_FTM_2wk_a = "0x182E7DAD39C8412ce1258B01f1a25afDC6c2294d"
const indexUSDC_SOL_2wk_b = "0xb466a23c77df358B8B1e86514411c5Fe0D613896"
const indexUSDC_MATIC_2wk_a = "0xAD57221ae9897DA08656aaaBd5B1D4673d4eDE71"
const indexUSDC_BNB_2wk_b = "0xE5e8caA04C4b9E1C9bd944A2a78a48b05c3ef3AF"

// Ethereum - Stronghold IndexETH vaults
const indexETH_BiWeekly_A = "0xcb317b4b7CB45ef6D5Aa4e43171d16760dFE5eeA"
const indexETH_BiWeekly_B = "0x71F5d6fa67c2C9D2b76246569093390d02F80678"

// Ethereum - Stronghold IndexBTC vaults
const indexBTC_BiWeekly_A = "0xB2d3102944dEc6c4D7B0d87cA9De6eB13B70c11e"
const indexBTC_BiWeekly_B = "0xB1105529305f166531b7d857B1d6f28000278aff"

// Avalanche Vaults
const avaxCallVault = '0xd06Bd68d58eD40CC2031238A3993b99172ea37cA'
const avaxPutVault = '0xa84aA41B6287aFE467ccE688f3796A2205198F07'

// Fantom Vaults
const ftmCallVault = '0x302ABD505757FD355C8ef3cF8b4918D6404f4996'
const ftmPutVault = '0x7EDa4C29726355D0d8E85001B9152158b35Eae4f'

//BSC Vaults
//BSC Vaults
const adaCallVault = '0xF98297A842f52Cd1f6c6f5f003Cd701813b1C461'
const adaPutVault = '0x8BE731cB3b301b4a209C1A38ea14D6438e6913F6'
const bchCallVault = '0xc879ecC0d2cdA26072e9049178a99B26C51eDF8a'
const bchPutVault = '0xfe9B8054B947aCEeC01912Cf1811DB06fc804b69'
const wbnbCallVault = '0x9EF72De1782431cf54518c42C06e26014E7201D1'
const wbnbPutVault = '0xc75C3BE0Bc41857B9c1a675475F6E0a7c5Db63fC'

//Woo Vaults
const wooSynVault_Bi_10 = '0x74b9C75ee344cc6D323489906c571912980d03ac'
const wooSynVault_Bi_25 = '0x91E3d1461B4655E48Be431895E483C3b17915DA5'
const wooSynVault_Mo_10 = '0x68B727b3D2EC73026FD1c7B9f736604f1c09C541'
const wooSynVault_Mo_25 = '0x640C8EEFa86bA6B93fA1cdEBDA0766cb64dA2d17'

//Polygon Vaults
const wMaticCallVault = '0x9dA79023Af00d1f2054BB1eED0D49004fe41C5b5'
const wMaticPutVault = '0x1724B8679A9CaD6CABDef7DbEE1d5b03b44584B2'

// Polygon - Stronghold IndexUST vaults
const indexUST_LUNA_2wk_a = "0x400f7569AfCF3E756A427DD7522DFE2De4664717"
const indexUST_LUNA_2wk_b = "0x112AdEC687FA605CE3221943C301Ed99B7C33Ed7"

//Aurora Vaults
const nearCallVault = '0xfc7F11Bb0d97d9db1f701eEA0fDE611536F1EB5F'

//Boba Vaults
const bobaCallVault = '0x5a9f1D95C59365613B4224e690Bb4971DD246142'
const bobaPutVault = '0xff5fe7909fc4d0d6643f1e8be8cba72610d0b485'

//Arbitrum Vaults
const arbCallVault = '0x0833EC3262Dcc417D88f85Ed5E1EBAf768080f41'

// Ethereum Assets
const weth = ADDRESSES.ethereum.WETH
const usdc = ADDRESSES.ethereum.USDC
const wbtc = ADDRESSES.ethereum.WBTC
const ust = '0xa693b19d2931d498c5b318df961919bb4aee87a5'
const tUSDC = '0x9f238fae3d1f1982716f136836fc2c0d1c2928ab'
const tAlgo = '0x0354762a3c01730d07d2f7098365d64dc81b565d'
const bit = '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5'

// Avalanche Assets
const wavax = ADDRESSES.avax.WAVAX
const usdce = ADDRESSES.avax.USDC_e
const usdc_avax = ADDRESSES.avax.USDC

// Fantom Assets
const wftm = ADDRESSES.fantom.WFTM
const fusdc = ADDRESSES.fantom.USDC

// Binance Smart Chain Assets
const busd = ADDRESSES.bsc.BUSD
const ada = '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47'
const bch = '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf'
const wbnb = ADDRESSES.bsc.WBNB
const woo = '0x4691937a7508860F876c9c0a2a617E7d9E945D4B'

// Polygon Assets
const wmatic = ADDRESSES.polygon.WMATIC_2
const pousdc = ADDRESSES.polygon.USDC
const ust_matic_wormhole = '0xE6469Ba6D2fD6130788E0eA9C0a0515900563b59'

// Aurora Assets
const near = ADDRESSES.aurora.NEAR

// Boba Assets
let boba = ADDRESSES.boba.BOBA
const bobaUSDC = ADDRESSES.boba.USDC

// Arbitrum assets
let arb = '0x912ce59144191c1204e64559fe8253a0e49e6548'

module.exports = {
  methodology: `Only the funds deposited by the users into our vaults are calculated as TVL.`,
  hallmarks: [
    [Math.floor(new Date('2022-09-30') / 1e3), 'Thetanuts migration V0 -> V1'],
  ],
}

const config = {
  ethereum: {
    tokensAndOwners: [
      [weth, ethCallVault,],
      [usdc, ethPutVault,],
      [wbtc, wbtcCallVault,],
      [ust, lunaPutVault,],
      [tUSDC, algoPutVault,],
      [tAlgo, algoCallVault,],
      [usdc, bitPutVault,],
      [bit, bitCallVault,],

      [usdc, indexUSDC_BTC_1wk,],
      [usdc, indexUSDC_ETH_2wk_a,],
      [usdc, indexUSDC_AVAX_2wk_b,],
      [usdc, indexUSDC_FTM_2wk_a,],
      [usdc, indexUSDC_SOL_2wk_b,],
      [usdc, indexUSDC_MATIC_2wk_a,],
      [usdc, indexUSDC_BNB_2wk_b,],

      [weth, indexETH_BiWeekly_A,],
      [weth, indexETH_BiWeekly_B,],
      [wbtc, indexBTC_BiWeekly_A,],
      [wbtc, indexBTC_BiWeekly_B,],

    ]
  },
  avax: {
    tokensAndOwners: [
      [wavax, avaxCallVault,],
      [usdc_avax, avaxPutVault,],
    ]
  },
  arbitrum: {
    tokensAndOwners: [
      [arb, arbCallVault,],
    ]
  },
  fantom: {
    tokensAndOwners: [
      [wftm, ftmCallVault,],
      [fusdc, ftmPutVault,],
    ]
  },
  bsc: {
    tokensAndOwners: [
      [busd, adaPutVault,],
      [ada, adaCallVault,],
      [busd, bchPutVault,],
      [bch, bchCallVault,],
      [busd, wbnbPutVault,],
      [wbnb, wbnbCallVault,],

      [woo, wooSynVault_Bi_10,],
      [busd, wooSynVault_Bi_10,],
      [woo, wooSynVault_Bi_25,],
      [busd, wooSynVault_Bi_25,],
      [woo, wooSynVault_Mo_10,],
      [busd, wooSynVault_Mo_10,],
      [woo, wooSynVault_Mo_25,],
      [busd, wooSynVault_Mo_25,],
    ]
  },
  polygon: {
    tokensAndOwners: [
      [wmatic, wMaticCallVault,],
      [pousdc, wMaticPutVault,],
      [ust_matic_wormhole, indexUST_LUNA_2wk_a,],
      [ust_matic_wormhole, indexUST_LUNA_2wk_b,],
    ]
  },
  boba: {
    tokensAndOwners: [
      [boba, bobaCallVault,],
      [bobaUSDC, bobaPutVault,],
    ]
  },
  aurora: {
    tokensAndOwners: [
      [near, nearCallVault,],
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { tokensAndOwners } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners, })
  }
})