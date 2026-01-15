const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')

// Ethereum Vaults
const ethCallVault = '0x9014f8E90423766343Ed4fe41668563526dF6715'
const ethPutVault = '0x6d2Cdb589BE6037Df1AeA5dC433829aD5aF30013'
const wbtcCallVault = '0x60a4422B6B52aEF50647c67F29D6a7e6DAc3CCBC'

// Ethereum - Wheel
const synWethBi = '0x3567e2A6E161f3623307Aa4e59ceab6dEFf6291f'

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

// Ethereum - Boosted Positions (Aave V2 Fork)
const PTeETH_27JUN24 = '0xc69Ad9baB1dEE23F4605a82b3354F8E40d1E5966'
const aPTeETH_27JUN24 = '0xE6A9465B9DA25Ddacc55AF5F2a111Db4E80Ba20D'
const aWETH = '0xE41645Db7C6813993eEA1cBA83912cE07d8a6d29'
const PTUSDe_25JUL24 = '0xa0021EF8970104c2d008F38D92f115ad56a9B8e1'
const aPTUSDe_25JUL24 = '0xCe51Ca8D61dAb1f84bD95329218b87E95054aB22'
const aUSDC = '0xFB3CbdA3145Fac86040bE8501e0750cd1ddDA0Af'
const  PTweeths_29AUG24 = '0xda6530efafd63a42d7b9a0a5a60a03839cdb813a'
const aPTweeths_29AUG24 = '0xb33587882dEe85B3dCcd5C82d942BB10119f8BB0'
const  PTunieth_26SEP24 = '0x15fA86404BFbA8b46684552F792558128bFB6418'
const aPTunieth_26SEP24 = '0x4390a8E941b0B16a8E6B670D878a9eF6d3e11725'
const  PTweeth_26DEC24  = '0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d'
const aPTweeth_26DEC24  = '0xBE8b41bDd18b0f0f47DbF338cfA837469F755d95'
const  PTezeth_26DEC24  = '0xf7906F274c174A52d444175729E3fa98f9bde285'
const aPTezeth_26DEC24  = '0xD9309EA9e2336A9Fe2A15b04D9036Db15A729047'
const  PTksusde_26SEP24 = '0xd351de53277c4218CC29f793263FB60E2fcFC1dC'
const aPTksusde_26SEP24 = '0x2b04E9ebeCC71BC3450C1C7B1FB8E0404E870d59'
const  PTsusde_26SEP24  = '0x6c9f097e044506712B58EAC670c9a5fd4BCceF13'
const aPTsusde_26SEP24  = '0x024F400F55dc1b877695Ba4e8e53a509Fb3F0BF2'


// Avalanche Vaults
const avaxCallVault = '0xd06Bd68d58eD40CC2031238A3993b99172ea37cA'
const avaxPutVault = '0xa84aA41B6287aFE467ccE688f3796A2205198F07'

// Fantom Vaults
const ftmCallVault = '0x302ABD505757FD355C8ef3cF8b4918D6404f4996'
const ftmPutVault = '0x7EDa4C29726355D0d8E85001B9152158b35Eae4f'

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

//cronos vaults
const cronosCallVault = '0x99F05418967d3596CAfd260913b682Fd9b0CBB40'


//Boba Vaults
const bobaCallVault = '0x5a9f1D95C59365613B4224e690Bb4971DD246142'
const bobaPutVault = '0xff5fe7909fc4d0d6643f1e8be8cba72610d0b485'

//Arbitrum Vaults
const arbCallVault = '0x0833EC3262Dcc417D88f85Ed5E1EBAf768080f41'
const arbPutVault = '0xf94ea5B18401821BE07FBfF535B8211B061A7F70'
const ethCallVaultArb = '0x1D1CD4abe0F2AF9d79b5e3149BF4A503f97C1EAd'
const ethPutVaultArb = '0xA8459eC6DF0D9a61058C43a308dD8A2CEc9d550E'
// Assets locked in Aave V2 fork
const aArb_ARB = '0x116a7f52556a57F807CEACe228242C3c91D2C7E5' 
const aUsdc_ARB = '0xBEe683e6e5CE1e7Ea07c6f11DF240AcD92c33632'
const aWeth_ARB = '0xBbf03fC0C8441e9cc50cC087f74899C137597b6e'
// LongLiquidityVaults - Holds aAssets (not counted) and V3 liquidity NFTs
const arbC_LLV = '0x721Bba1556649e9c70E2dF1EAFC04270376025f7'
const arbP_LLV = '0x57eD79afD32c616E4631231636F4597188d20C5e'
const ethC_LLV = '0x078F98Be8A1bb1bD64799B8F05Aca08f5850A69D'
const ethP_LLV = '0xE84CB9daF67644734051c7f6e978968f04F6751e'
// Boosted assets (Selling options backed by yielding assets) (locked in Aave V2 Fork)
const  PTezETH_27JUN24 = '0x8EA5040d423410f1fdc363379Af88e1DB5eA1C34'
const aPTezETH_27JUN24 = '0x2F741a91dCe2a1e1Ed24c88F93A0f3530f1CBf2C'
const  PTrsETH_27JUN24 = '0xAFD22F824D51Fb7EeD4778d303d4388AC644b026'
const aPTrsETH_27JUN24 = '0x121b956D11EaeCFD3f0CdF259D6faFFEbEDD0bC9'
const  PTweETH_27JUN24 = '0x1c27Ad8a19Ba026ADaBD615F6Bc77158130cfBE4'
const aPTweETH_27JUN24 = '0x1B38B4586003E64c6c87F4acaF4f15415C2034EB'

const   PTweETH_26SEP24 = '0xb8b0a120F6A68Dd06209619F62429fB1a8e92feC'
const  aPTweETH_26SEP24 = '0xF5d0866646DF182Fb9BC7FB27B26B84F96b2239d'
const   PTezETH_26SEP24 = '0x2CCFce9bE49465CC6f947b5F6aC9383673733Da9'
const  aPTezETH_26SEP24 = '0x3F9ca12e7D4867E45b289484a3F33bbA2A1b8723'
const   PTrsETH_26SEP24 = '0x30c98c0139B62290E26aC2a2158AC341Dcaf1333'
const  aPTrsETH_26SEP24 = '0x0B6Ef11254edCab4b164daa7e626Dc0d0c2Ad51f'
const  PTuniETH_26DEC24 = '0x22e9ad26ea0e65a7073571d5d7172ff6336084ad'
const aPTuniETH_26DEC24 = '0x3D3a1CAA95D427b9fF63b93cB90e1a470eeBA5D7'

// Polygon zkEVM vaults
const stMaticCallVault = '0x7bF3c7C23501EA3E09B237D6F8AdcB7Ea3CeF41C'

// Ethereum Assets
const weth = ADDRESSES.ethereum.WETH
const usdc = ADDRESSES.ethereum.USDC
const wbtc = ADDRESSES.ethereum.WBTC
const ust = '0xa693b19d2931d498c5b318df961919bb4aee87a5'
const tUSDC = '0x9f238fae3d1f1982716f136836fc2c0d1c2928ab'
const tAlgo = '0x0354762a3c01730d07d2f7098365d64dc81b565d'
const bit = '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5'
const ausdc = '0xBcca60bB61934080951369a648Fb03DF4F96263C' // Aave V2 USDC

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

// cronos assets
const wcro = ADDRESSES.cronos.WCRO_1

// Arbitrum assets
const arb = ADDRESSES.arbitrum.ARB
const usdc_arb = ADDRESSES.arbitrum.USDC_CIRCLE
const weth_arb = ADDRESSES.arbitrum.WETH
const univ3nft_arb = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

// Polygon zkEVM assets
const stMatic = '0x83b874c1e09D316059d929da402dcB1A98e92082'

module.exports = {
  methodology: `Funds deposited into Thetanuts Finance via the Basic Vaults, Lending Market, and AMM are calculated as TVL.`,
  hallmarks: [
    [1646658000, 'Migration from v0 to v1'],
    [1664460000, 'Migration from v1 to v2'],
    [1702472400, 'Launch of Thetanuts Finance v3'],
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
      
      [weth, synWethBi,],
      [usdc, synWethBi,],

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

      [ausdc, indexUSDC_BTC_1wk,],
      [ausdc, indexUSDC_ETH_2wk_a,],
      [ausdc, indexUSDC_AVAX_2wk_b,],
      [ausdc, indexUSDC_MATIC_2wk_a,],
      [ausdc, indexUSDC_BNB_2wk_b,],
      [ausdc, ethPutVault,],

      [weth, aWETH,],
      [PTeETH_27JUN24, aPTeETH_27JUN24,],
      [PTweeths_29AUG24, aPTweeths_29AUG24,],
      [PTunieth_26SEP24, aPTunieth_26SEP24,],

      [PTweeth_26DEC24, aPTweeth_26DEC24,],
      [PTezeth_26DEC24, aPTezeth_26DEC24,],

      [usdc, aUSDC,],
      [PTUSDe_25JUL24, aPTUSDe_25JUL24,],
      [PTsusde_26SEP24, aPTsusde_26SEP24,],
      [PTksusde_26SEP24, aPTksusde_26SEP24,],

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
      [usdc_arb, arbPutVault,],
      [weth_arb, ethCallVaultArb,],
      [usdc_arb, ethPutVaultArb,],
      [arb, aArb_ARB,],
      [weth_arb, aWeth_ARB,],
      [usdc_arb, aUsdc_ARB,],      

      [PTezETH_27JUN24, aPTezETH_27JUN24,],
      [PTrsETH_27JUN24, aPTrsETH_27JUN24,],
      [PTweETH_27JUN24, aPTweETH_27JUN24,],

      [PTezETH_26SEP24, aPTezETH_26SEP24,],
      [PTrsETH_26SEP24, aPTrsETH_26SEP24,],
      [PTweETH_26SEP24, aPTweETH_26SEP24,],
      [PTuniETH_26DEC24, aPTuniETH_26DEC24,],
    ],
    uniV3Owners: [
       arbC_LLV,
       arbP_LLV,
       ethC_LLV,
       ethP_LLV,
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
  cronos: {
    tokensAndOwners: [
      [wcro, cronosCallVault]
    ]
  },
  polygon_zkevm: {
    tokensAndOwners: [
      [stMatic, stMaticCallVault,],
    ]
  },
  inevm: {
    tokensAndOwners: [
      ['0x69011706b3f6C6eaeD7D2Bc13801558B4fd94CBF', '0x6950D30996e8EC8D93dd1602b059b3a38389Bb88'],
      ['0x8358D8291e3bEDb04804975eEa0fe9fe0fAfB147', '0xEc9284b92B8039c4180Ac99863ed73Ee5Ff33E63'],
    ]
  }
}

Object.keys(config).forEach(chain => {
  const { tokensAndOwners, uniV3Owners } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (uniV3Owners) await sumTokens2({ api, owners: uniV3Owners, resolveUniV3: true})
      return sumTokens2({ api, tokensAndOwners})
    }
  }
})
