const ADDRESSES = require('../coreAssets.json')
const { compoundExports2, methodology } = require('../compound')
const { buildProtocolExports } = require('./utils')

const chainExportKeys = new Set(['staking', 'pool2', 'borrowed', 'vesting'])

function compoundExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (typeof config === 'string') {
      result[chain] = compoundExports2({ comptroller: config })
    } else {
      const compoundConfig = { ...config }
      for (const key of chainExportKeys) delete compoundConfig[key]
      result[chain] = compoundExports2(compoundConfig)
    }
  })
  return result
}

const configs = {
  'bencu': {
    metis: { comptroller: '0xC5986Df018D1ff8ecA79fd3f266428616617cDF3' },
  },
  'rho-markets': {
    methodology,
    scroll: { comptroller: '0x8a67AB98A291d1AEA2E1eB0a79ae4ab7f2D76041', cether: '0x639355f34Ca9935E0004e30bD77b9cE2ADA0E692' },
  },
  'quantus': {
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
    monad: { comptroller: '0xFc57bF0733e5e65d8549fc2922919Cfb97e62D5f' },
    megaeth: { comptroller: '0x1F1416EbbeAb7a13fC5B6111A1E77696Be600413' },
  },
  'takara': {
    methodology,
    sei: {
      comptroller: '0x71034bf5eC0FAd7aEE81a213403c8892F3d8CAeE',
      blacklistedTokens: [
        '0x7F3C2A5bCA48150c7Ce07DcEAb9B73336a7e592a',
        '0x963Db326b734FD58a9396C020BBb52C14acaFb02',
        '0xabFb7A392a6DaaC50f99c5D14B5f27EFfd08Fe03',
      ],
    },
  },
  'peridot': {
    methodology: 'TVL is calculated by summing the underlying token balances of all markets in the Peridot lending protocol. Borrowed balances are also tracked separately.',
    bsc: { comptroller: '0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14' },
    monad: { comptroller: '0x6D208789f0a978aF789A3C8Ba515749598940716', blacklistedMarkets: ['0xf8255935e62aa000c89de46a97d2f00bfff147e7'], cether: '0x2FB2861402A22244464435773dd1C6951735CdF7' },
  },
  'hover': {
    kava: { comptroller: '0x3A4Ec955a18eF6eB33025599505E7d404a4d59eC', cether: '0xb51eFaF2f7aFb8a2F5Be0b730281E414FB487636' },
  },
  'enzo': {
    btr: { cether: '0xe277Aed3fF3Eb9824EdC52Fe7703DF0c5ED8B313', comptroller: '0xe688a4a94AD1D32CD52A01306fc0a9552749F322', cetheEquivalent: ADDRESSES.btr.WBTC },
  },
  'jax-protocol': {
    taiko: { comptroller: '0x8D86d4070b9432863FE9522B2c931C410085E1d4', cether: '0xdc1af71e6b9b4572cdf7832496efbea06cbecfc5' },
  },
  'capyfi': {
    lac: { comptroller: '0x123Abe3A273FDBCeC7fc0EBedc05AaeF4eE63060', cether: '0x465ebfceb3953e2922b686f2b4006173664d16ce' },
    ethereum: { comptroller: '0x0b9af1fd73885aD52680A1aeAa7A3f17AC702afA', cether: '0x37DE57183491Fa9745d8Fa5DCd950f0c3a4645c9', blacklistedTokens: ['0xbaa6bc4e24686d710b9318b49b0bb16ec7c46bfa'] },
    wc: { comptroller: '0x589d63300976759a0fc74ea6fA7D951f581252D7', cether: '0xaAd91abe333c4536FFbF02b83daBaB49C9Aa23ed' },
  },
  'elara': {
    methodology,
    zircuit: { comptroller: '0x695aCEf58D1a10Cf13CBb4bbB2dfB7eDDd89B296' },
  },
  'basic': {
    iotex: { cether: '0x83C51de03f03C5E23f02F674dbD2032e164112Fc', comptroller: '0x47D7B83947Aa12fEb95f5f55527Dc9B32E4ec009', cetheEquivalent: ADDRESSES.iotex.WIOTX },
  },
  'whitehole-finance': {
    arbitrum: { comptroller: '0x1d019f2d14bdb81bab7ba4ec7e02017837a7a43aeDa48F', abis: { getAllMarkets: 'address[]:allMarkets', totalBorrows: 'uint256:totalBorrow' } },
  },
  'loanshark': {
    scroll: { comptroller: '0xEFB0697700E5c489073a9BDF7EF94a2B2bc884a5', cether: '0xF017f9CF11558d143E603d56Ec81E4E3B6d39D7F' },
  },
  'kawa': {
    sei: { comptroller: '0xD527237E176647cbF8A7c7bCeFEfBf9130Bec948', cether: '0x20E56093357d91Ce85B0E3c2f0E4bdc676E94eDB' },
  },
  'jiblend': {
    jbc: { comptroller: '0x603122Cdd36abCD164e448e1f3fbd33730edf35a', cether: '0xAc3e5aD93DDeac9B32772c8A864B5E73820c5d16' },
  },
  'ionise-io': {
    zilliqa: { comptroller: '0x5F8B5312636Af3bA626C12327a5d8EE4301A65F8', cether: '0x9386c982fcb1aecbd949d04143d8a9e32b4b52bb' },
  },
  'blume-fm': {
    blast: { comptroller: '0x4EdF556c5664b4f86Ec50dB0F58B58B26210DC31' },
  },
  'basilisk': {
    era: { comptroller: '0x4085f99720e699106bc483dAb6CAED171EdA8D15', cether: '0x1e8F1099a3fe6D2c1A960528394F4fEB8f8A288D' },
  },
  'asofinance': {
    blast: { comptroller: '0xD5e60A396842D6C1D5470E16DA0BfDbb7Ba47101', cether: '0x001FF326A2836bdD77B28E992344983681071f87' },
  },
  'neku': {
    arbitrum: { comptroller: '0xD5B649c7d27C13a2b80425daEe8Cb6023015Dc6B', cether: '0xbc4a19345c598d73939b62371cf9891128eccb8b' },
    moonriver: { comptroller: '0xD5B649c7d27C13a2b80425daEe8Cb6023015Dc6B', cether: '0xbc4a19345c598d73939b62371cf9891128eccb8b' },
    bsc: { comptroller: '0xD5B649c7d27C13a2b80425daEe8Cb6023015Dc6B', cether: '0xbc4a19345c598d73939b62371cf9891128eccb8b' },
  },
  'nyke': {
    methodology,
    ethereumclassic: { comptroller: '0x0040DCf62C380833dE60a502649567e939635fdB', cether: '0x2896c67c0cea9D4954d6d8f695b6680fCfa7C0e0' },
  },
  'metalend': {
    ronin: { comptroller: '0x9E8FD99Fc64Cd2fF4B5846361a7eC457f2b3808e' },
  },
  'olafinance': {
    fantom: { comptroller: '0x892701d128d63c9856A9Eb5d967982F78FD3F2AE' },
  },
  'orbiter-one': {
    moonbeam: { comptroller: '0x27DC3DAdBfb40ADc677A2D5ef192d40aD7c4c97D', cether: '0xCc444ca6bba3764Fc55BeEFe4FFA27435cF6c259' },
  },
  'torches': {
    kcc: { comptroller: '0xfbAFd34A4644DC4f7c5b2Ae150279162Eb2B0dF6' },
  },
  'trustin': {
    btr: { comptroller: '0xF2EBc006a55ADFb3f50A521E5Db848942e7Dbb1F' },
  },
  'coslend': {
    evmos: { comptroller: '0x5b32B588Af5F99F4e5c4038dDE6BDD991024F650' },
  },
  'huckleberry-lending': {
    moonriver: { comptroller: '0xcffef313b69d83cb9ba35d9c0f882b027b846ddc', cether: '0x455d0c83623215095849abcf7cc046f78e3edae0' },
  },
  'knightswap-lending': {
    methodology,
    bsc: { comptroller: '0x4f92913b86d5e79593fa2e475a8232b22ef17ed1' },
  },
  'apeswap-lending': {
    methodology,
    bsc: { comptroller: '0xad48b2c9dc6709a560018c678e918253a65df86e' },
  },
  'netweave-lending': {
    mode: { comptroller: '0x86112d3176c537B953560EA6fE43f79382E7bffE' },
  },
  'forlend': {
    findora: { comptroller: '0x3b056De20d662B09f73bDb28Ea6fa7b7aC82259C' },
  },
  'lander': {
    bsc: { comptroller: '0x344655CB08a25A7b2501CafB47CdF9490cE7fad3' },
  },
  'traderjoe-lend': {
    methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph. The staking portion of TVL includes the JoeTokens within the JoeBar contract.',
    avax: { comptroller: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC', cether: '0xC22F01ddc8010Ee05574028528614634684EC29e' },
  },
  'reactorfusion': {
    telos: { comptroller: '0x19646a04BfDcf3553Adc8fAAf8B16D76EC41E494', cether: '0x7d94D2F6f91ED5ED0104D89B3D263026D990Ac5f' },
    era: { comptroller: '0x23848c28Af1C3AA7B999fA57e6b6E8599C17F3f2', cether: '0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6' },
  },
  'deepr-finance': {
    methodology,
    shimmer_evm: { comptroller: '0xF7E452A8685D57083Edf4e4CC8064EcDcF71D7B7' },
    iotaevm: { comptroller: '0xee07121d97FDEA35675e02017837a7a43aeDa48F' },
  },
  'tonpound': {
    methodology,
    ethereum: { comptroller: '0x1775286Cbe9db126a95AbF52c58a3214FCA26803' },
  },
  'solidlizard-lending': {
    methodology: 'Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets',
    arbitrum: {
      comptroller: '0x9FfBdfcc508e76ee2b719eF6218879E938eF056C',
      staking: ['0x08153c4C19Cb438A3bdC6303aF962a30E9f5e0B1', '0xe6AF844d5740B6B297B6Dd7Fb2ce299Ee9E3d16F'],
      pool2: ['0x8082F587Ff2B24dadB2220026F4FCa9323Ed8080', '0xB70005C4980d78e8bE47D4C9ccCd7300D6a02501'],
    },
  },
  'teralend': {
    flare: { comptroller: '0xEBf6ed25aB1F79B5C10C7145C5167367bE31651f', cether: '0x02350987093a804556d65be52063E85eaF80C806', isInsolvent: true },
  },
  'strike': {
    ethereum: { comptroller: '0xe2e17b2CBbf48211FA7eB8A875360e5e39bA2602', cether: '0xbee9cf658702527b0acb2719c1faa29edc006a92', isInsolvent: true },
  },
  'fenrirfinance': {
    bsc: { comptroller: '0x56b4B49f31517be8DacC2ED471BCc20508A0e29D', isInsolvent: true },
  },
  'paribus': {
    arbitrum: { comptroller: '0x712E2B12D75fe092838A3D2ad14B6fF73d3fdbc9', cether: '0xaffd437801434643b734d0b2853654876f66f7d7', isInsolvent: true },
  },
  'fusefi-lending': {
    hallmarks: [['2022-03-31', 'Ola Finance exploit']],
    fuse: { comptroller: '0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340', isInsolvent: true },
  },
  'mendi-finance': {
    methodology: 'Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets',
    linea: {
      comptroller: '0x1b4d3b0421dDc1eB216D230Bc01527422Fb93103',
      staking: [['0x150b1e51738cdf0ccfe472594c62d7d6074921ca', '0xcf8dedcdc62317beaedfbee3c77c08425f284486'], '0x43e8809ea748eff3204ee01f08872f063e44065f'],
    },
  },
}

module.exports = buildProtocolExports(configs, compoundExportFn)
