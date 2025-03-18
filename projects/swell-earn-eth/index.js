const sdk = require('@defillama/sdk')
const { sumTokens2, PANCAKE_NFT_ADDRESS } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const earnETHVault = '0x9Ed15383940CC380fAEF0a75edacE507cC775f22';
const pancakeswapMasterChef = '0x556B9306565093C855AEA9AE92A594704c2Cd59e'

const ethTokens = [
  '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0', // rswETH
  '0xf951E335afb289353dc249e82926178EaC7DEd78', // swETH
  ADDRESSES.ethereum.WSTETH, // wstETH
  ADDRESSES.ethereum.WETH, // WETH
  "0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6", // apxETH
  "0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6", // pxETH
  ADDRESSES.ethereum.WEETH, // weETH
  "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110", // ezETH
  "0xC329400492c6ff2438472D4651Ad17389fCb843a", // sym_wstETH
  "0x38B86004842D3FA4596f0b7A0b53DE90745Ab654", // sym_swETH
  "0xB26ff591F44b04E78de18f43B46f8b70C6676984", // sym_cbETH
  "0x5fD13359Ba15A84B76f7F87568309040176167cd", // Amphor_ETH
  "0x8a053350ca5F9352a16deD26ab333e2D251DAd7c", // mmETH
  "0x32bd822d615A3658A68b6fDD30c2fcb2C996D678", // mswETH
  "0x49446A0874197839D15395B908328a74ccc96Bc0", // mstETH
  "0x997949eEA781c04E4801d9c0902540236A317B07", // PT_rstETH_25JUL2024
  "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d", // PT_weETH_26DEC2024
  "0xf7906F274c174A52d444175729E3fa98f9bde285", // PT_ezETH_26DEC2024
  "0x5cb12D56F5346a016DBBA8CA90635d82e6D1bcEa", // PT_rswETH_27JUN2024
  "0xc69Ad9baB1dEE23F4605a82b3354F8E40d1E5966", // PT_weETH_27JUN2024
]

const pendleLPTokens = [
  "0x7C7FbB2d11803C35Aa3e283985237aD27f64406B", //rswETH 26Dec2024
  "0x0e1C5509B503358eA1Dac119C1D413e28Cc4b303", //swETH 26December2024
]

const vaultTokens = [
  "0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0", // Re7 WETH
]

const swellTokens = [
  ADDRESSES.swellchain.rswETH, // rswETH
  ADDRESSES.swellchain.swETH, // swETH
  '0xC3d33a0Ea1582410075567c589af895fcaF1127c', // tempest weeth/eth
]

const tokens = [
  ...ethTokens,
  ...pendleLPTokens,
  ...vaultTokens,
]


const ethTvl = async (api) => {
  return sumTokens2({
    api,
    owner: earnETHVault, tokens,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, earnETHVault]],
    uniV3ExtraConfig: { nftIdFetcher: pancakeswapMasterChef },
    fetchCoValentTokens: true
  })
}

const swellTvl = async (api) => {
  return sumTokens2({
    api,
    owner: earnETHVault,
    tokens: swellTokens
  })
}

const earnBTCVault = '0x66E47E6957B85Cf62564610B76dD206BB04d831a';

const ethBTCTvl = async (api) => {
  const ethTokens = [
    ADDRESSES.ethereum.WBTC, // WBTC
    '0x8DB2350D78aBc13f5673A411D4700BCF87864dDE', // swBTC
    ADDRESSES.ethereum.cbBTC, // cbBTC
    ADDRESSES.mantle.FBTC, // fBTC
    '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e', // pumpBTC
    '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa', // tBTC
    ADDRESSES.ethereum.LBTC, // LBTC
    '0x7A56E1C57C7475CCf742a1832B028F0456652F97', // solvBTC
  ]

  return sumTokens2({ api, owner: earnBTCVault, tokens: ethTokens, fetchCoValentTokens: true })
}

const swellBTCTvl = async (api) => {

  const swellTokens = [
    ADDRESSES.swellchain.stBTC, // stBTC
    ADDRESSES.swellchain.uBTC_1, // uBTC
  ]

  return sumTokens2({ api, owner: earnBTCVault, tokens: swellTokens })

}

module.exports = {
  methodology: 'TVL represents the sum of tokens deposited in the vault + LP positions',
  doublecounted: true,
  ethereum: { tvl: sdk.util.sumChainTvls([ethTvl, ethBTCTvl]) },
  swellchain: { tvl: sdk.util.sumChainTvls([swellTvl, swellBTCTvl]) },
}