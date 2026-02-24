const ADDRESSES = require('../projects/helper/coreAssets.json')
const { compoundExports2, methodology } = require('../projects/helper/compound')
const { mergeExports } = require('../projects/helper/utils')
const { buildProtocolExports } = require('./utils')
const { nullAddress } = require('../projects/helper/tokenMapping')

const chainExportKeys = new Set(['staking', 'pool2', 'borrowed', 'vesting'])

function compoundExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (typeof config === 'string') {
      result[chain] = compoundExports2({ comptroller: config })
    } else if (Array.isArray(config)) {
      // Multiple comptrollers on the same chain - merge their exports
      const exports = config.map(c => {
        const compoundConfig = { ...c }
        for (const key of chainExportKeys) delete compoundConfig[key]
        return { [chain]: compoundExports2(compoundConfig) }
      })
      result[chain] = mergeExports(exports)[chain]
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
  // === Newly migrated adapters below ===
  'tropykus': {
    misrepresentedTokens: true,
    rsk: { comptroller: '0x962308fEf8edFaDD705384840e7701F8f39eD0c0', cether: '0x0aEaDb9d4C6a80462a47E87e76e487fa8b9A37d7', blacklistedTokens: ['0xd2ec53e8dd00d204d3d9313af5474eb9f5188ef6', '0x3134b7fbfca5db217eca523eab1941452cf35163', '0xedaefc6b596ed38d712100976969975a37c84464', '0xe17551201eeaefbd625ca4fb48d49c06e7ac064b'] },
  },
  'tashi': {
    methodology: 'Same as compound, we just get all the collateral (not borrowed money) on the lending markets',
    evmos: { comptroller: '0x053841Bd1D291380726a007eA834Ecd296923260', cether: '0x1cd248D72248A0618932F77093Dc4ceC9757759d' },
  },
  'usdfi-lending': {
    bsc: { comptroller: '0x87363D74CD88A6220926Cf64bDEFd23ae63BE115' },
  },
  'sumer': {
    meter: { comptroller: '0xcB4cdDA50C1B6B0E33F544c98420722093B7Aa88', blacklistedTokens: ['0x755A39999FE536Ec327Cb84110383BFc30fd0F4D', '0x21c4123f62CA28c9ceF3dDd1c8ae71EE9a5003aE'] },
    base: { comptroller: '0x611375907733D9576907E125Fb29704712F0BAfA', blacklistedTokens: ['0xa1aD8481e83a5b279D97ab371bCcd5AE3b446EA6', '0x56048C88309CAF13A942d688bfB9654432910d6e'] },
    arbitrum: { comptroller: '0xBfb69860C91A22A2287df1Ff3Cdf0476c5aab24A', blacklistedTokens: ['0xe4B55045ed14815c7c42eeeF8EE431b89422c389', '0x9C93423939C4e3D48d99baD147AD808BE89B2043', '0xAc6bAF36B28d19EA10959102158Beb3d933C1fbf'] },
    ethereum: { comptroller: '0x60A4570bE892fb41280eDFE9DB75e1a62C70456F', blacklistedTokens: ['0x2509bd3B69440D39238b464d09f9F04A61fd62C6', '0x4342e9bf67F89dea0Cf3c906F5113Dd8b588aC6F', '0x77CcA710E21A94B94a26A98eA23027D64e36B9d4'] },
    core: { comptroller: '0x7f5a7aE2688A7ba6a9B36141335044c058a08b3E', blacklistedTokens: ['0xaAC83D5E45A2f67f2bFd1B804776EFa7DAF6cbF6', '0xaE6388F58b5b35D5B2eEC828C9633E7D245FEf62', '0xe04d21d999faedf1e72ade6629e20a11a1ed14fa'] },
    bsc: { comptroller: '0x15B5220024c3242F7D61177D6ff715cfac4909eD', blacklistedTokens: [] },
    berachain: { comptroller: '0x16C7d1F9EA48F7DE5E8bc3165A04E8340Da574fA', blacklistedTokens: ['0x163cEbBD83A4e2821fF06C9b0707A8A64FEc0AbC', '0xA6ae238D9CaF65DFA67670FDE3156EFeE9334488'] },
    hemi: { comptroller: '0xB2fF02eEF85DC4eaE95Ab32AA887E0cC69DF8d8E', blacklistedTokens: ['0x8C38b023Afe895296e2598AE111752223185b35c', '0xb1FdC3f660b0953253141B2509c43014d5d3d733', '0xc7fFEAa5949d50A408bD92DdB0D1EAcef3F8a3Bc', '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e'] },
    btr: { comptroller: '0xAbcdc5827f92525F56004540459045Ec3e432ebF', blacklistedTokens: ['0x1fbDb3b715c82DCD52BCF06fcc18819951aa9264'] },
    goat: { comptroller: '0x98Ec4C9605D69083089eCAf353037b40017b758e', blacklistedTokens: ['0xAbcdc5827f92525F56004540459045Ec3e432ebF', '0x7465fedB29023d11effe8C74E82A7ecEBf15E947', '0x6A9A65B84843F5fD4aC9a0471C4fc11AFfFBce4a'] },
    zklink: { comptroller: '0xe6099D924efEf37845867D45E3362731EaF8A98D', blacklistedTokens: ['0x0Cf1cC35e296931061c263826B5f62DC04ac1C6B', '0xbEAf16cFD8eFe0FC97C2a07E349B9411F5dC272C', '0x85D431A3a56FDf2d2970635fF627f386b4ae49CC', '0x586E593Ffa60c15Ed722342f3C08cc90410e4fEA'] },
    bsquared: { comptroller: '0xdD9C863197df28f47721107f94eb031b548B5e48', blacklistedTokens: ['0x8C38b023Afe895296e2598AE111752223185b35c', '0xb1FdC3f660b0953253141B2509c43014d5d3d733'] },
    monad: { comptroller: '0x2d9b96648C784906253c7FA94817437EF59Cf226', blacklistedTokens: ['0x8bf591eae535f93a242d5a954d3cde648b48a5a8'] },
  },
  'segment-finance': {
    methodology: 'Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets',
    op_bnb: { comptroller: '0x71ac0e9A7113130280040d0189d0556f45a8CBB5', cether: '0x7e844423510A5081DE839e600F7960C7cE84eb82' },
    bsc: { comptroller: '0x57E09c96DAEE58B77dc771B017de015C38060173', cether: '0x5fcea94b96858048433359bb5278a402363328c3' },
    bob: { comptroller: '0xcD7C4F508652f33295F0aEd075936Cd95A4D2911', cether: '0xd7c6cc5aef7396182c5d7ebdac66ff674f3ddcf4', blacklistedTokens: ['0xecf21b335B41f9d5A89f6186A99c19a3c467871f'] },
    rsk: { comptroller: '0x2eea8fbA494d5008ba72f80E0091Cc74dB5f9926', cether: '0x8F9958ec0FeeccCf0feC871B7bBB3D8d0B7A4D3c' },
    core: { comptroller: '0xaba65b87eBEdB2D753b37AeCECD1E168341eE0DD', cether: '0xb57A4b3ccE8d999A1e6B0357c0a31C3808401B42' },
    bsquared: { comptroller: '0x69a6B3B96b26a15A588081Df17F46d61f625741c', cether: '0xEff5cD04B461247F5008b35074F45Ba0f0b11eFf' },
  },
  'compound-onchain': {
    hallmarks: [['2020-06-15', 'COMP distribution begins']],
    methodology: `${require('../projects/helper/methodologies').lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
    ethereum: { comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', cether: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5' },
  },
  'cream': {
    timetravel: false,
    start: '2020-09-08',
    ethereum: { comptroller: '0xbdC857eae1D15ad171E11af6FC3e99413Ed57Ec4' },
    bsc: { comptroller: '0x589DE0F0Ccf905477646599bb3E5C622C84cC0BA', cether: '0x1Ffe17B99b439bE0aFC831239dDECda2A790fF3A', cetheEquivalent: ADDRESSES.bsc.WBNB },
    polygon: { comptroller: '0x20ca53e2395fa571798623f1cfbd11fe2c114c24' },
    arbitrum: { comptroller: '0xbadaC56c9aca307079e8B8FC699987AAc89813ee' },
    base: { comptroller: '0x94d31f92a7f85b51F0B628467B3E660BA3e8D799' },
  },
  '0xLend': {
    kcc: { comptroller: '0x337d8719f70D514367aBe780F7c1eAd1c0113Bc7', cether: '0x309f1639018e8b272126c4b99af442aa25dcd1f2', isInsolvent: true },
    era: { comptroller: '0x599bb9202EE2D2F95EDe9f88F622854f7ef2c371', cether: '0x9dae6c8c431ffc6d21b836e0d8d113e8365defb9' },
    blast: { comptroller: '0x1DD821C9E27fB2399DAb75AedB113c80C755DCa6', cether: '0xd9fcbd7b60966d013a28ff87925f75bb49e9b5ee' },
  },
  'filda': {
    hallmarks: [['2023-04-24', 'Protocol was hacked']],
    heco: { comptroller: '0xb74633f2022452f377403B638167b0A135DB096d', cether: '0x824151251b38056d54a15e56b73c54ba44811af8' },
    iotex: { comptroller: '0x55E5F6E48FD4715e1c05b9dAfa5CfD0B387425Ee' },
    bsc: { comptroller: '0xF0700A310Cb14615a67EEc1A8dAd5791859f65f1' },
    rei: { comptroller: '0xEc1e6e331e990a0D8e40AC51f773e9c998ec7BC3' },
    polygon: { comptroller: '0xfBE0f3A3d1405257Bd69691406Eafa73f5095723' },
    arbitrum: { comptroller: '0xF67EF5E77B350A81DcbA5430Bc8bE876eDa8D591' },
    elastos: { comptroller: '0xE52792E024697A6be770e5d6F1C455550265B2CD' },
    kava: { comptroller: '0xD2CBE89a36df2546eebc71766264e0F306d38196' },
    bittorrent: { comptroller: '0xE52792E024697A6be770e5d6F1C455550265B2CD' },
  },
  'lumen-money': {
    methodology: 'Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets',
    neon_evm: { comptroller: '0x252dBa92827744e6d2b01f1c9D77dcD3CBAb4573', cether: '0x3A81c854dCF6172cE3a7fFF024ECF20d8Ac2A1af' },
  },
  'nebula': {
    nibiru: { comptroller: '0x7bf2f10A061eAA9d12eff11D1c3cBaf402f86C22', cether: '0xFC0De9060D413b60fEE6B735A0291CC7fC2Dc966' },
  },
  'machfi': {
    sonic: { comptroller: '0x646F91AbD5Ab94B76d1F9C5D9490A2f6DDf25730', cether: '0x9F5d9f2FDDA7494aA58c90165cF8E6B070Fe92e6' },
  },
  'liqee': {
    start: '2021-08-24',
    ethereum: { comptroller: '0x8f1f15DCf4c70873fAF1707973f6029DEc4164b3', abis: { getAllMarkets: 'address[]:getAlliTokens' } },
    bsc: { comptroller: '0x6d290f45A280A688Ff58d095de480364069af110', abis: { getAllMarkets: 'address[]:getAlliTokens' } },
  },
  'ironbank': {
    start: '2020-09-08',
    ethereum: { comptroller: '0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB', isInsolvent: true, blacklistedTokens: ['0x96E61422b6A9bA0e068B6c5ADd4fFaBC6a4aae27', '0x95dfdc8161832e4ff7816ac4b6367ce201538253', '0xfafdf0c4c1cb09d430bf88c75d88bb46dae09967', '0x5555f75e3d5278082200fb451d1b6ba946d8e13b', '0x1cc481ce2bd2ec7bf67d1be64d4878b16078f309', '0x69681f8fde45345c3870bcd5eaf4a05a60e7d227', '0x81d66D255D47662b6B16f3C5bbfBb15283B05BC2', '0x4e3a36A633f63aee0aB57b5054EC78867CB3C0b8'] },
    fantom: { comptroller: '0x4250a6d3bd57455d7c6821eecb6206f507576cd2', isInsolvent: true },
    avax: { comptroller: '0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc' },
    optimism: { comptroller: '0xE0B57FEEd45e7D908f2d0DaCd26F113Cf26715BF' },
  },
  'wepiggy': {
    methodology: 'TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.',
    ethereum: { comptroller: '0x0C8c1ab017c3C0c8A48dD9F1DB2F59022D190f0b', cether: '0x27A94869341838D5783368a8503FdA5fbCd7987c' },
    okexchain: { comptroller: '0xaa87715e858b482931eb2f6f92e504571588390b', cether: '0x621ce6596e0b9ccf635316bfe7fdbc80c3029bec' },
    bsc: { comptroller: '0x8c925623708A94c7DE98a8e83e8200259fF716E0', cether: '0x33A32f0ad4AA704e28C93eD8Ffa61d50d51622a7' },
    polygon: { comptroller: '0xFfceAcfD39117030314A07b2C86dA36E51787948', cether: '0xC1B02E52e9512519EDF99671931772E452fb4399' },
    heco: { comptroller: '0x3401D01E31BB6DefcFc7410c312C0181E19b9dd5', cether: '0x75DCd2536a5f414B8F90Bb7F2F3c015a26dc8c79' },
    arbitrum: { comptroller: '0xaa87715E858b482931eB2f6f92E504571588390b', cether: '0x17933112E9780aBd0F27f2B7d9ddA9E840D43159' },
    optimism: { comptroller: '0x896aecb9E73Bf21C50855B7874729596d0e511CB', cether: '0x8e1e582879Cb8baC6283368e8ede458B63F499a5' },
    moonriver: { comptroller: '0x9a9b2bF1d1c96332C55d0B6aCb8C2B441381116d', cether: '0x621CE6596E0B9CcF635316BFE7FdBC80C3029Bec' },
    harmony: { comptroller: '0xaa87715E858b482931eB2f6f92E504571588390b', cether: '0xd1121aDe04EE215524aeFbF7f8D45029214d668D' },
    oasis: { comptroller: '0x5Ea2321aBFF78E81702cE877319cD775E0dc865B', cether: '0x33A32f0ad4AA704e28C93eD8Ffa61d50d51622a7' },
    aurora: { comptroller: '0xFfceAcfD39117030314A07b2C86dA36E51787948', cether: '0x75DCd2536a5f414B8F90Bb7F2F3c015a26dc8c79' },
    moonbeam: { comptroller: '0x5Ea2321aBFF78E81702cE877319cD775E0dc865B', cether: '0x33A32f0ad4AA704e28C93eD8Ffa61d50d51622a7' },
  },
  'wemix-lend': {
    wemix: { comptroller: '0x929620a759a564e3C273e8a4efCDa5806da168F2', cether: '0x34b9B18fDBE2aBC6DfB41A7f6d39B5E511ce3e23' },
  },
  'vivacity': {
    canto: { comptroller: '0xe49627059Dd2A0fba4A81528207231C508d276CB' },
  },
  'zkfox': {
    era: { comptroller: '0xc3D157Ee5D602E9CEAF6eA4c15C9b52B313A1364' },
  },
  'OCP': {
    hallmarks: [['2022-02-14', 'Project abandoned by the team']],
    bsc: { comptroller: '0xc001c415b7e78ea4a3edf165d8f44b70391f8c3c', blacklistedTokens: ['0x3c70260eee0a2bfc4b375feb810325801f289fbd', '0x5801d0e1c7d977d78e4890880b8e579eb4943276'] },
  },
  'fluxfinance': {
    methodology: `${require('../projects/helper/methodologies').lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
    ethereum: { comptroller: '0x95Af143a021DF745bc78e845b54591C53a8B3A51' },
  },
  'cozy': {
    methodology: 'Count tokens the same way we count for compound',
    ethereum: { comptroller: '0x895879b2c1fbb6ccfcd101f2d3f3c76363664f92' },
  },
  'aurigami': {
    aurora: { comptroller: '0x817af6cfAF35BdC1A634d6cC94eE9e4c68369Aeb', cether: '0xca9511B610bA5fc7E311FDeF9cE16050eE4449E9', cetheEquivalent: '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb' },
  },
  'novation': {
    blast: { comptroller: '0x3090Cd174218BB451C7865bDC621d47E1Bd6831C', abis: { getAllMarkets: 'address[]:allMarkets', totalBorrows: 'uint256:totalBorrow' } },
  },
  'damm-finance': {
    methodology: 'Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets',
    hallmarks: [['2022-10-05', 'Liquidity Bonding Start']],
    ethereum: { comptroller: '0x4F96AB61520a6636331a48A11eaFBA8FB51f74e4', cether: '0xe970c37243F3d0B2AeB041b855Ef6466CB140BcA' },
  },
  'canto-lending': {
    hallmarks: [['2022-08-25', 'Remove canto dex LPs from tvl computation']],
    canto: {
      comptroller: '0x5E23dC409Fc2F832f83CEc191E245A191a4bCc5C',
      cether: '0xb65ec550ff356eca6150f733ba9b954b2e0ca488',
      cetheEquivalent: ADDRESSES.canto.WCANTO,
      blacklistedTokens: [
        ADDRESSES.canto.NOTE,
        '0x1d20635535307208919f0b67c3b2065965a85aa9',
        '0x216400ba362d8fce640085755e47075109718c8b',
        '0x30838619c55b787bafc3a4cd9aea851c1cfb7b19',
        '0x9571997a66d63958e1b3de9647c22bd6b9e7228c',
        '0x35db1f3a6a6f07f82c76fcc415db6cfb1a7df833',
      ],
    },
  },
  'bao-markets': {
    ethereum: { comptroller: '0x0Be1fdC1E87127c4fe7C05bAE6437e3cf90Bf8d8', cether: '0xf635fdf9b36b557bd281aa02fdfaebec04cd084a', cetheEquivalent: nullAddress, blacklistedTokens: ['0xe7a52262c1934951207c5fc7a944a82d283c83e5', '0xc0601094C0C88264Ba285fEf0a1b00eF13e79347'] },
  },
  'venus': {
    bsc: { comptroller: '0xfd36e2c2a6789db23113685031d7f16329158384', cether: '0xA07c5b74C9B40447a954e1466938b865b6BBea36' },
    ethereum: { comptroller: '0x687a01ecF6d3907658f7A7c714749fAC32336D1B' },
    op_bnb: { comptroller: '0xd6e3e2a1d8d95cae355d15b3b9f8e5c2511874dd' },
    arbitrum: { comptroller: '0x317c1A5739F39046E20b08ac9BeEa3f10fD43326' },
    era: { comptroller: '0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1' },
    base: { comptroller: '0x0C7973F9598AA62f9e03B94E92C967fD5437426C' },
    optimism: { comptroller: '0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC' },
    unichain: { comptroller: '0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe' },
  },
  'zenolend': {
    apechain: { comptroller: '0xc2C583093Af9241E17B2Ec51844154468D21bF6F' },
    unichain: { comptroller: '0x086036b34689709cFAe75dfC453846b744bD8dcA' },
    soneium: { comptroller: '0x5075A7E2B018f352220874718E3f5Bd38C6DFD5D' },
    sty: { comptroller: '0x5075A7E2B018f352220874718E3f5Bd38C6DFD5D' },
    hemi: { comptroller: '0xc2C583093Af9241E17B2Ec51844154468D21bF6F' },
  },
  'mare-finance-v2': {
    methodology: 'Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets',
    kava: { comptroller: '0xFcD7D41D5cfF03C7f6D573c9732B0506C72f5C72', isInsolvent: true },
  },
  'unitus': {
    start: '2019-07-26',
    ethereum: { comptroller: '0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113', abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens: ['0x1AdC34Af68e970a93062b67344269fD341979eb0', '0x44c324970e5CbC5D4C3F3B7604CbC6640C2dcFbF'] },
    bsc: { comptroller: '0x0b53E608bD058Bb54748C35148484fD627E6dc0A', abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens: ['0x7B933e1c1F44bE9Fb111d87501bAADA7C8518aBe', '0x983A727Aa3491AB251780A13acb5e876D3f2B1d8'] },
    arbitrum: { comptroller: '0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408', abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens: ['0x0385F851060c09A552F1A28Ea3f612660256cBAA', '0x5675546Eb94c2c256e6d7c3F7DcAB59bEa3B0B8B'] },
    optimism: { comptroller: '0xA300A84D8970718Dac32f54F61Bd568142d8BCF4', abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens: ['0x7e7e1d8757b241Aa6791c089314604027544Ce43'] },
    polygon: { comptroller: '0x52eaCd19E38D501D006D2023C813d7E37F025f37', abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens: ['0xc171EBE1A2873F042F1dDdd9327D00527CA29882', '0x15962427A9795005c640A6BF7f99c2BA1531aD6d'] },
    conflux: { comptroller: '0xA377eCF53253275125D0a150aF195186271f6a56', abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens: ['0x6f87b39a2e36F205706921d81a6861B655db6358'] },
    base: { comptroller: '0xBae8d153331129EB40E390A7Dd485363135fcE22', abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens: ['0x82AFc965E4E18009DD8d5AF05cfAa99bF0E605df'] },
  },
  'minterest': {
    hallmarks: [
      ['2023-02-23', 'MINTY distribution begins on Ethereum'],
      ['2024-01-04', 'MINTY distribution begins on Mantle'],
      ['2024-05-31', 'MINTY distribution begins on Taiko'],
      ['2025-02-19', 'MINTY distribution begins on Morph'],
    ],
    ethereum: { comptroller: '0xD13f50274a68ABF2384C79248ADc259b3777c081' },
    mantle: { comptroller: '0xe53a90EFd263363993A3B41Aa29f7DaBde1a932D' },
    taiko: { comptroller: '0xe56c0d4d6A08C05ec42E923EFd06497F115D4799' },
    morph: { comptroller: '0x121D54E653a63D90569813E7c6a4C5E6084ff7DE' },
  },
  'hundredfinance': {
    hallmarks: [['2023-04-15', 'Protocol hacked (oc Optimism)']],
    ethereum: { comptroller: '0x0f390559f258eb8591c8e31cf0905e97cf36ace2', cether: '0xfcd8570ad81e6c77b8d252bebeba62ed980bd64d' },
    arbitrum: { comptroller: '0x0f390559f258eb8591c8e31cf0905e97cf36ace2', cether: '0x8e15a22853a0a60a0fbb0d875055a8e66cff0235' },
    fantom: { comptroller: '0x0f390559f258eb8591c8e31cf0905e97cf36ace2', cether: '0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D' },
    harmony: { comptroller: '0x0f390559f258eb8591c8e31cf0905e97cf36ace2', cether: '0xbb93c7f378b9b531216f9ad7b5748be189a55807' },
    moonriver: { comptroller: '0x7d166777bd19a916c2edf5f1fc1ec138b37e7391', cether: '0xd6fcbccfc375c2c61d7ee2952b329dceba2d4e10' },
    xdai: { comptroller: '0x6bb6ebCf3aC808E26545d59EA60F27A202cE8586', cether: '0x6edcb931168c9f7c20144f201537c0243b19dca4' },
    polygon: { comptroller: '0xedba32185baf7fef9a26ca567bc4a6cbe426e499', cether: '0xEbd7f3349AbA8bB15b897e03D6c1a4Ba95B55e31' },
    optimism: { comptroller: '0x5a5755E1916F547D04eF43176d4cbe0de4503d5d', cether: '0x1A61A72F5Cf5e857f15ee502210b81f8B3a66263', isInsolvent: true },
  },
  'tender-finance': {
    methodology: 'Same as compound, we just get all the collateral (not borrowed money) on the lending markets.',
    arbitrum: { comptroller: '0xeed247Ba513A8D6f78BE9318399f5eD1a4808F8e', cether: '0x0706905b2b21574DEFcF00B5fc48068995FCdCdf', cetheEquivalent: ADDRESSES.arbitrum.WETH },
  },
  'paxo-finance': {
    methodology: `${require('../projects/helper/methodologies').lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses.`,
    polygon: {
      comptroller: '0x1eDf64B621F17dc45c82a65E1312E8df988A94D3',
      staking: ['0xC1704c99278c3e5A91AfB117301eA61B003Aa650', '0xfFA188493C15DfAf2C206c97D8633377847b6a52'],
    },
    xdc: { comptroller: '0x301C76e7b60e9824E32991B8F29e1c4a03B4F65b' },
    linea: { comptroller: '0x301C76e7b60e9824E32991B8F29e1c4a03B4F65b' },
    boba: { comptroller: '0x301C76e7b60e9824E32991B8F29e1c4a03B4F65b' },
  },
  'sonne-finance': {
    optimism: {
      comptroller: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
      isInsolvent: true,
      staking: [['0xdc05d85069dc4aba65954008ff99f2d73ff12618', '0x41279e29586eb20f9a4f65e031af09fced171166'], '0x1DB2466d9F5e10D7090E7152B68d62703a2245F0'],
    },
    base: { comptroller: '0x1DB2466d9F5e10D7090E7152B68d62703a2245F0' },
  },
  'moonwell': {
    hallmarks: [['2022-08-01', 'Nomad Bridge Exploit']],
    moonbeam: {
      comptroller: '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180',
      cether: '0x091608f4e4a15335145be0a279483c0f8e4c7955',
      staking: ['0x8568A675384d761f36eC269D695d6Ce4423cfaB1', '0x511aB53F793683763E5a8829738301368a2411E3'],
    },
    base: {
      comptroller: '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C',
      staking: ['0xe66E3A37C3274Ac24FE8590f7D84A2427194DC17', '0xa88594d404727625a9437c3f886c7643872296ae'],
    },
    optimism: { comptroller: '0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9' },
  },
  'moonwell-apollo': {
    moonriver: {
      comptroller: '0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E',
      cether: '0x6a1a771c7826596652dadc9145feaae62b1cd07f',
      staking: ['0xCd76e63f3AbFA864c53b4B98F57c1aA6539FDa3a', '0xBb8d88bcD9749636BC4D2bE22aaC4Bb3B01A58F1'],
    },
  },
  'donkey': {
    ethereum: {
      comptroller: '0x55e41bc3a99aa24E194D507517b1e8b65eFdAa9e',
      cether: '0xec0d3f28d37a3393cf09ee3ad446c485b6afdaa3',
      staking: [['0x4f2ED52bC4CbdE54e2b3547D3758474A21598D7c', '0x024510151204DeC56Cc4D54ed064f62efAC264d5', '0x2EacD2D7cF5Cba9dA031C0a9C5d7FDeDc056216C', '0x8c9886Aca8B6984c10F988078C5e1D91976dFD16', '0x63D21dBD5A30940C605d77882D065736e8fffC94'], '0x4576E6825B462b6916D2a41E187626E9090A92c6'],
    },
    klaytn: { comptroller: '0x35dc04eE1D6E600C0d13B21FdfB5C83D022CEF25', cether: '0xacc72a0ca4e85f79876ed4c5e6ea29be1cd26c2e' },
  },
  'onyx': {
    ethereum: {
      comptroller: '0x7D61ed92a6778f5ABf5c94085739f1EDAbec2800',
      cether: '0x714bD93aB6ab2F0bcfD2aEaf46A46719991d0d79',
      isInsolvent: true,
      staking: ['0x23445c63FeEf8D85956dc0f19aDe87606D0e19A9', '0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18'],
    },
  },
  // === Array configs (multiple comptrollers on same chain) ===
  'zoro': {
    era: [
      { comptroller: '0x90f2810B85f02122159cB18f6abF2776a7Ca3152', cether: '0x3a6F5eA6b9B781C37F25164D9c25534eDd87d290' },
      { comptroller: '0x410ffcC8f37dCb3116cA8F59B30CCbe4c60F2385', cether: '0x2ff7bF02a7C4f63fBc3b764A12c723B2abdA2905' },
    ],
  },
  'kinetic': {
    flare: [
      { comptroller: '0x8041680Fb73E1Fe5F851e76233DCDfA0f2D2D7c8' },
      { comptroller: '0xDcce91d46Ecb209645A26B5885500127819BeAdd', cether: '0xd7291D5001693d15b6e4d56d73B5d2cD7eCfE5c6' },
      { comptroller: '0x15F69897E6aEBE0463401345543C26d1Fd994abB' },
    ],
  },
  'tectonic': {
    cronos: [
      { comptroller: '0xb3831584acb95ed9ccb0c11f677b5ad01deaeec0', cether: '0xeadf7c01da7e93fdb5f16b0aa9ee85f978e89e95' },
      { comptroller: '0x8312A8d5d1deC499D00eb28e1a2723b13aA53C1e', cether: '0xf4ff4b8ee660d4276eda17e79094a7cc519e9606' },
      { comptroller: '0x7E0067CEf1e7558daFbaB3B1F8F6Fa75Ff64725f', cether: '0x972173afb7eefb80a0815831b318a643442ad0c1' },
    ],
  },
  'mage': {
    methodology,
    merlin: [
      { comptroller: '0xCE3bcCd2b0A457782f79000Be1b534C04B3F5aDD', cether: '0xe3b51f15dc086fba15426b8d42b4cd6feb46968e' },
      { comptroller: '0xe7464Caa3fD31A1A8B458a634e72F94A00695d17' },
    ],
  },
  'keom': {
    polygon_zkevm: [
      { comptroller: '0x6EA32f626e3A5c41547235ebBdf861526e11f482', cether: '0xee1727f5074e747716637e1776b7f7c7133f16b1' },
    ],
    polygon: [
      { comptroller: '0x5B7136CFFd40Eee5B882678a5D02AA25A48d669F', cether: '0x7854D4Cfa7d0B877E399bcbDFfb49536d7A14fc7' },
    ],
    manta: [
      { comptroller: '0x91e9e99AC7C39d5c057F83ef44136dFB1e7adD7d', cether: '0x8903Dc1f4736D2FcB90C1497AebBABA133DaAC76' },
      { comptroller: '0xBAc1e5A0B14490Dd0b32fE769eb5637183D8655d', cether: '0xd773ffa79258F2D7458F1B74d075F4524Ee3CCa0' },
    ],
    astrzk: [
      { comptroller: '0xcD906c5f632daFCBD23d574f85294B32E7986fD9', cether: '0x79D7c05352a900bE30992D525f946eA939f6FA3E' },
    ],
  },
  'orbitlending-io': {
    blast: [
      { comptroller: '0x1E18C3cb491D908241D0db14b081B51be7B6e652', cether: ['0xf9b3b455f5d900f62bc1792a6ca6e1d47b989389', '0x0872b71efc37cb8dde22b2118de3d800427fdba0'], blacklistedTokens: ['0xf92996ddc677a8dcb032ac5fe62bbf00f92ae2ec'], isInsolvent: true },
      { comptroller: '0x273683CA19D9CF827628EE216E4a9604EfB077A3', cether: ['0x795dcd51eac6eb3123b7a4a1f906992eaa54cb0e'], isInsolvent: true },
      { comptroller: '0xe9266ae95bB637A7Ad598CB0390d44262130F433', cether: ['0xafabd582e82042f4a8574f75c36409abea916ac5'], isInsolvent: true },
      { comptroller: '0xfFF8Fc176697D04607cF4e23E91c65aeD1c3d3F5', cether: ['0x530a8d3fdf61112f8a879d753fe02e9e37ec36aa'], isInsolvent: true },
    ],
  },
  'wanlend': {
    methodology,
    wan: [
      { comptroller: '0x21c72522005ccf570f40acaa04b448918aecc2ad', cether: '0xE8548014f731194764AF27C8edc9bbAA7d2f4C46', cetheEquivalent: ADDRESSES.wan.WWAN, isInsolvent: true },
      { comptroller: '0xd6980C52C20Fb106e54cC6c8AE04c089C3F6B9d6', cether: '0x48c42529c4c8e3d10060e04240e9ec6cd0eb1218', cetheEquivalent: ADDRESSES.wan.WWAN },
    ],
  },
  'midas-capital': {
    bsc: [
      { comptroller: '0x1851e32F34565cb95754310b031C5a2Fc0a8a905' },
      { comptroller: '0x31d76A64Bc8BbEffb601fac5884372DEF910F044' },
      { comptroller: '0xb2234eE69555EE4C3b6cEA4fd25c4979BbDBf0fd' },
      { comptroller: '0xEF0B026F93ba744cA3EDf799574538484c2C4f80' },
      { comptroller: '0x5373C052Df65b317e48D6CAD8Bb8AC50995e9459' },
      { comptroller: '0xCB2841d6d300b9245EB7745Db89A0A50D8468501' },
      { comptroller: '0x35F3a59389Dc3174A98610727C2e349E275Dc909' },
      { comptroller: '0x3F239A5C45849391E7b839190597B5130780790d' },
      { comptroller: '0x7f8B5fCA1a63C632776ffc9936D2e323c14B57f8' },
      { comptroller: '0x20a0ED8c794F96C1479e2867995C99E931Ee36Ba' },
      { comptroller: '0x5EB884651F50abc72648447dCeabF2db091e4117' },
      { comptroller: '0xBc06411a6204B36ce6a5559FFBE3a56C5960F6fe' },
      { comptroller: '0x1B6D43501E0c7201Ea061961cBAEc88FB012f57B' },
    ],
    moonbeam: [
      { comptroller: '0xeB2D3A9D962d89b4A9a34ce2bF6a2650c938e185' },
      { comptroller: '0x0fAbd597BDecb0EEE1fDFc9B8458Fe1ed0E35028' },
      { comptroller: '0xCc248E6106CB7B05293eF027D5c1c05BF3E39F21' },
    ],
    polygon: [
      { comptroller: '0xD265ff7e5487E9DD556a4BB900ccA6D087Eb3AD2' },
      { comptroller: '0xB08A309eFBFFa41f36A06b2D0C9a4629749b17a2' },
      { comptroller: '0xBd82D36B9CDfB9747aA12025CeCE3782EDe767FE' },
      { comptroller: '0xF1ABd146B4620D2AE67F34EA39532367F73bbbd2' },
      { comptroller: '0xBd82D36B9CDfB9747aA12025CeCE3782EDe767FE' },
      { comptroller: '0x59013D8a77D656777329D74ea1C88DA796005F1B' },
    ],
    arbitrum: [
      { comptroller: '0x185Fa7d0e7d8A4FE7E09eB9df68B549c660e1116' },
      { comptroller: '0x44a03C14F30D49cB43b7F7E91E987ecC10cc0b09' },
    ],
  },
  'bastion': {
    aurora: [
      { comptroller: '0x6De54724e128274520606f038591A00C5E94a1F6', cether: '0x4E8fE8fd314cFC09BDb0942c5adCC37431abDCD0', cetheEquivalent: '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb' },
      { comptroller: '0xA195b3d7AA34E47Fb2D2e5A682DF2d9EFA2daF06' },
      { comptroller: '0xe1cf09BDa2e089c63330F0Ffe3F6D6b790835973' },
      { comptroller: '0xE550A886716241AFB7ee276e647207D7667e1E79' },
    ],
  },
}

module.exports = buildProtocolExports(configs, compoundExportFn)
