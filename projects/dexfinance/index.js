const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const ETF_ABI = {
  'getCurrentTokens': "address[]:getCurrentTokens"
};
const { sumTokensExport, } = require('../helper/unwrapLPs')

const REGULATION_STAKING_POOL = '0xd69db827939e26511068aa2bf742e7463b292190'
const REWARD_POOL = '0x4c7371a351a465c38dc129e4d084b9b8aef14041'
const FARM = '0xcc180bfa5d2c3ac191758b721c9bbbb263b3fd1c'
const TREASURY = '0xa5f3d6a33c5a5bcdff8f81c88ca00f457b699e0f'

const ETF_INDEX_POOL = '0x60ebfd605cb25c7796f729c78a4453acecb1ce03'

const TOKENS = {
  USDEX_USDC_LP: '0x79f3bb5534b8f060b37b3e5dea032a39412f6b10',
  DEXSHARE_BNB_LP: '0x65d83463fc023bffbd8ac9a1a2e1037f4bbdb399',
  DEXIRA_BNB_LP: '0x01b279a06f5f26bd3f469a3e730097184973fc8a',
  DEXSHARE: '0xf4914e6d97a75f014acfcf4072f11be5cffc4ca6',
  DEXIRA: '0x147e07976e1ae78287c33aafaab87760d32e50a5',
  WDEX_DEXSHARE: '0x6647047433df4cfc9912d092fd155b9d972a4a85',
  BNB: ADDRESSES.bsc.WBNB,
};

async function tvl(api) {
  const tokens = await api.call({  abi: ETF_ABI.getCurrentTokens, target:ETF_INDEX_POOL })
  return api.sumTokens({ owner: ETF_INDEX_POOL, tokens, })
}

async function farmWDEX_DEXSHARE(api) {
  const [
    bal,
    iraBal,
    shareBal,
    totalSupply,
  ] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: TOKENS.WDEX_DEXSHARE, params: FARM }),
    api.call({ abi: 'erc20:balanceOf', target: TOKENS.DEXIRA, params: TOKENS.WDEX_DEXSHARE }),
    api.call({ abi: 'erc20:balanceOf', target: TOKENS.DEXSHARE, params: TOKENS.WDEX_DEXSHARE }),
    api.call({ abi: 'erc20:totalSupply', target: TOKENS.WDEX_DEXSHARE, }),
  ])
  const ratio = bal / totalSupply
  api.add(TOKENS.DEXIRA, iraBal * ratio)
  api.add(TOKENS.DEXSHARE, shareBal * ratio)
  return api.getBalances()
}

module.exports = {
  bsc: {
    tvl,
    pool2: sdk.util.sumChainTvls([
      sumTokensExport({ tokens: [TOKENS.USDEX_USDC_LP, TOKENS.DEXSHARE_BNB_LP,], owner: FARM, }),
      farmWDEX_DEXSHARE
    ]),
    staking: sumTokensExport({
      tokensAndOwners: [
        [TOKENS.DEXSHARE, REGULATION_STAKING_POOL,],
        [TOKENS.DEXSHARE, REWARD_POOL,],
      ],
    }),
  },
  hallmarks: [
    ['2022-12-19', "DexEtf Launch"],
    ['2022-12-21', "DexVaults Launch"],
  ],
};