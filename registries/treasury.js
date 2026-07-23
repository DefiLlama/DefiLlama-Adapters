const { treasuryExports } = require('../projects/helper/treasury')
const ADDRESSES = require('../projects/helper/coreAssets.json')
const { nullAddress } = require('../projects/helper/treasury')
const { nullAddress: tokenMappingNullAddress } = require('../projects/helper/tokenMapping')
const bitcoinAddressBook = require('../projects/helper/bitcoin-book/index.js')

// Treasury registry.
//
// Each entry is the exact `config` object that used to be passed to
// `treasuryExports(...)` in projects/treasury/<name>.js. The protocol key is
// `treasury/<name>` so buildImports.js resolves it for the matching
// `treasury/<name>.js` module path.
//
// Only PLAIN adapters (`module.exports = treasuryExports({...})`) belong here.
// Adapters using ohmStaking/ohmTreasury, sumChainTvls, mergeExports, isComplex
// with extra custom code, or any logic beyond a single treasuryExports() call
// stay as individual files in projects/treasury/.
const gmxOwners = [
        '0x4bd1cdaab4254fc43ef6424653ca2375b4c94c0e',
        '0xc6378ddf536410c14666dc59bc92b5ebc0f2f79e',
        '0x0263ad94023a5df6d64f54bfef089f1fbf8a4ca0',
        '0xea8a734db4c7ea50c32b5db8a0cb811707e8ace3',
        '0xe1f7c5209938780625e354dc546e28397f6ce174',
        '0x68863dde14303bced249ca8ec6af85d4694dea6a',
        '0x0339740d92fb8baf73bab0e9eb9494bc0df1cafd',
        '0x2c247a44928d66041d9f7b11a69d7a84d25207ba',
        '0x0a2962120b11A4a36700C5De00D4980E58a2D1C0',
        '0xe57fE47902A35Bc0d82C83e39610Af546E1D18B9',
      ]

const configs = {
  // ----- from batch00.js -----
  'treasury/nexus-mutual': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        '0x2ba592F78dB6436527729929AAf6c908497cB200', // CREAM
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.SAFE,
      ],
      ownTokens: ['0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B', '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE'],
      owners: ['0x586b9b2F8010b284A0197f392156f1A7Eb5e86e9', '0xfc64382c9ce89ba1c21692a68000366a35ff0336'],
    },
  },
  'treasury/hegic': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0xf15968a096fc8f47650001585d23bee819b5affb'],
    },
    ethereum: {
      tokens: [nullAddress, ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.USDC],
      owners: ['0xd884aca1897ac45515cee6d5fd48f341b4023ace', '0x117f55bf3c2e3bcdc7f308504480ee53f754a7ca'],
      ownTokens: ['0x584bC13c7D411c00c01A62e8019472dE68768430'],
    },
  },
  'treasury/tornado-cash': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce', '0x179f48C78f57A3A78f0608cC9197B8972921d1D2'],
      ownTokens: ['0x77777FeDdddFfC19Ff86DB637967013e6C6A116C'],
    },
  },

  // ----- from batch_a00.js -----
  'treasury/1inch': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WBTC,
      ],
      owners: ['0x7951c7ef839e26F63DA87a42C9a87986507f1c07'],
      ownTokens: ['0x111111111117dC0aa78b770fA6A738034120C302'],
    },
    arbitrum: {
      owners: ['0x71890ac6209fae61e9d66691c47b168b8300a7c5'],
    },
  },
  'treasury/3xcalibur': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0x5f49174fdeb42959f3234053b18f5c4ad497cc55'],
    },
  },
  'treasury/40acres': {
    base: { owners: ['0xfF16fd3D147220E6CC002a8e4a1f942ac41DBD23'] },
    optimism: { owners: ['0xfF16fd3D147220E6CC002a8e4a1f942ac41DBD23'] },
    avax: { owners: ['0xfF16fd3D147220E6CC002a8e4a1f942ac41DBD23'] },
  },
  'treasury/aave': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0xBcca60bB61934080951369a648Fb03DF4F96263C', // aUSDC
        '0xd24946147829DEaA935bE2aD85A3291dbf109c80', // ammUSDC
        '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aEthUSDC
        ADDRESSES.ethereum.DAI,
        '0x028171bca77440897b824ca71d1c56cac55b68a3', // aDAI
        '0x79bE75FFC64DD58e66787E4Eae470c8a1FD08ba4', // ammDAI
        '0x018008bfb33d285247A21d44E50697654f754e63', // aEthDAI
        ADDRESSES.ethereum.USDT,
        '0x3ed3b47dd13ec9a98b44e6204a523e766b225811', // aUSDT
        '0x17a79792Fe6fE5C95dFE95Fe3fCEE3CAf4fE4Cb7', // ammUSDT
        '0xFFC97d72E13E01096502Cb8Eb52dEe56f74DAD7B', // aAAVE
        '0xA700b4eB416Be35b2911fd5Dee80678ff64fF6C9', // aEthAAVE
        ADDRESSES.ethereum.WBTC,
        '0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656', // aWBTC
        '0x13B2f6928D7204328b0E8E4BCd0379aA06EA21FA', // ammWBTC
        '0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8', // aEthWBTC
        ADDRESSES.ethereum.WSTETH,
        '0x0B925eD163218f6662a35e0f0371Ac234f9E9371', // aEthwstETH
        '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
        ADDRESSES.ethereum.WETH,
        '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e', // aWETH
        '0xf9Fb4AD91812b704Ba883B11d2B576E890a6730A', // ammWETH
        '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', // aEthWETH
        ADDRESSES.ethereum.CRV,
        '0x8dAE6Cb04688C62d939ed9B68d32Bc62e49970b1', // aCRV
        ADDRESSES.ethereum.SNX,
        '0x35f6B052C598d933D69A4EEC4D04c73A191fE6c2', // aSNX
        ADDRESSES.ethereum.LINK,
        '0xa06bC25B5805d5F8d82847D191Cb4Af5A3e873E0', // aLINK
        '0x5E8C8A7243651DB1384C0dDfDbE39761E8e7E51a', // aEthLINK
        '0xba100000625a3754423978a60c9317c58a424e3d', // BAL
        '0x272F97b7a56a387aE942350bBC7Df5700f8a4576', // aBAL
        ADDRESSES.ethereum.UNI,
        '0xB9D7CB55f463405CDfBe4E90a6D2Df01C2B92BF1', // aUNI
        ADDRESSES.ethereum.MKR,
        '0xc713e5E149D5D0715DcD1c156a020976e7E56B88', // aMKR
        ADDRESSES.ethereum.BUSD,
        '0xA361718326c15715591c299427c62086F69923D9', // aBUSD
        ADDRESSES.ethereum.FRAX,
        '0xd4937682df3C8aEF4FE912A96A74121C0829E664', // aFRAX
        ADDRESSES.ethereum.sUSD,
        '0x6C5024Cd4F8A59110119C56f8933403A539555EB', // aSUSD
        ADDRESSES.ethereum.LUSD, // LUSD
        '0xce1871f791548600cb59efbefFC9c38719142079', // aLUSD
        '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // GUSD
        '0xD37EE7e4f452C6638c96536e68090De8cBcdb583', // aGUSD
        ADDRESSES.ethereum.TUSD,
        '0x101cc05f4A51C0319f570d5E146a8C625198e636', // aTUSD
        '0x8e870d67f660d95d5be530380d0ec0bd388289e1', // USDP
        '0x2e8F4bdbE3d47d7d7DE490437AeA9915D930F1A3', // aUSDP
        '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
        '0xB29130CBcC3F791f077eAdE0266168E808E5151e', // a1INCH
        '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b', // DPI
        '0x6F634c6135D2EBD550000ac92F494F9CB8183dAe', // aDPI
        '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', // ENS
        '0x9a14e23A58edf4EFDcB360f68cd1b95ce2081a2F', // aENS
        ADDRESSES.ethereum.STETH,
        '0x1982b2F5814301d4e9a8b0201555376e62F82428', // aSTETH
        '0xd46ba6d942050d489dbd938a2c909a5d5039a161', // AMPL
        '0x1E6bb68Acec8fefBD87D192bE09bb274170a0548', // aAMPL
        '0x956f47f50a910163d8bf957cf5846d573e7f87ca', // FEI
        '0x683923dB55Fead99A79Fa01A27EeC3cB19679cC3', // aFEI
        '0xa693b19d2931d498c5b318df961919bb4aee87a5', // UST
        '0xc2e2152647F4C26028482Efaf64b2Aa28779EFC4', // aUST
        ADDRESSES.ethereum.BAT,
        '0x05Ec93c0365baAeAbF7AefFb0972ea7ECdD39CF1', // aBAT
        ADDRESSES.ethereum.CVX,
        '0x952749E07d7157bb9644A894dFAF3Bad5eF6D918', // aCVX
        '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c', // ENJ
        '0xaC6Df26a590F08dcC95D5a4705ae8abbc88509Ef', // aENJ
        '0x0f5d2fb29fb7d3cfee444a200298f468908cc942', // MANA
        '0xa685a61171bb30d4072B338c80Cb7b2c865c873E', // aMANA
        '0xdd974d5c2e2928dea5f71b9825b8b646686bd200', // KNC
        '0x39C6b3e42d6A679d7D776778Fe880BC9487C2EDA', // aKNC
        '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919', // RAI
        '0xc9BC48c72154ef3e5425641a3c747242112a46AF', // aRAI
        '0x408e41876cccdc0f92210600ef50372656052a38', // REN
        '0xCC12AbE4ff81c9378D670De1b57F8e0Dd228D77a', // aREN
        '0xd5147bc8e386d91cc5dbe72099dac6c9b99276f5', // RENFIL
        '0x514cd6756CCBe28772d4Cb81bC3156BA9d1744aa', // aRENFIL
        '0xe41d2489571d322189246dafa5ebde1f4699f498', // ZRX
        '0xDf7FF54aAcAcbFf42dfe29DD6144A69b629f8C9e', // aZRX
        ADDRESSES.ethereum.YFI,
        '0x5165d24277cD063F5ac44Efd447B27025e888f37', // aYFI
        '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272', // xSUSHI
        '0xF256CC7847E919FAc9B808cC216cAc87CCF2f47a', // aXSUSHI
      ],
      owners: [
        '0x89c51828427f70d77875c6747759fb17ba10ceb0', // Aave Grants DAO
        '0xe3d9988f676457123c5fd01297605efdd0cba1ae', // Aave V1 Treasury
        '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c', // Aave V2 Collector
        '0x25f2226b597e8f9514b3f68f00f494cf4f286491', // Aave Ecosystem Reserve
        '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5', // V2 Incentives Controller
      ],
      ownTokens: [ADDRESSES.ethereum.AAVE],
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.DAI,
        '0x27F8D03b3a2196956ED754baDc28D73be8830A6e', // amDAI
        '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', // aPOLDAI
        ADDRESSES.polygon.USDC,
        '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F', // amUSDC
        '0x625E7708f30cA75bfd92586e17077590C60eb4cD', // aPolUSDC
        ADDRESSES.polygon.USDT,
        '0x60D55F02A771d515e077c9C2403a1ef324885CeC', // amUSDT
        '0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // aPolUSDT
        '0x1d2a0E5EC8E5bBDCA5CB219e649B565d8e5c3360', // amAAVE
        '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375', // aPolAAVE
        ADDRESSES.polygon.WBTC,
        '0x5c2ed810328349100A66B82b78a1791B101C9D61', // amWBTC
        '0x078f358208685046a11C85e8ad32895DED33A249', // aPolWBTC
        ADDRESSES.polygon.WETH_1,
        '0x28424507fefb6f7f8E9D3860F56504E4e5f5f390', // amWETH
        '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', // aPolWETH
        ADDRESSES.polygon.WMATIC_2, // WMATIC
        '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4', // amWMATIC
        ADDRESSES.polygon.aPolWMATIC, // aPolWMATIC
        '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3', // BAL
        '0xc4195D4060DaEac44058Ed668AA5EfEc50D77ff6', // amBAL
        '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692', // aPolBAL
        '0x172370d5Cd63279eFa6d502DAB29171933a610AF', // CRV
        '0x3Df8f92b7E798820ddcCA2EBEA7BAbda2c90c4aD', // amCRV
        '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf', // aPolCRV
        '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369', // DPI
        '0x81fB82aAcB4aBE262fc57F06fD4c1d2De347D7B1', // amDPI
        '0x724dc807b04555b71ed48a6896b6F41593b8C637', // aPolDPI
        '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7', // GHST
        '0x080b5BF8f360F624628E0fb961F4e67c9e3c7CF1', // amGHST
        '0x8Eb270e296023E9D92081fdF967dDd7878724424', // aPolGHST
        '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', // LINK
        '0x0Ca2e42e8c21954af73Bc9af1213E4e81D6a669A', // amLINK
        '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530', // aPolLINK
        '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a', // SUSHI
        '0x21eC9431B5B55c5339Eb1AE7582763087F98FAc2', // amSUSHI
        '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA', // aPolSUSHI
        '0xE111178A87A3BFf0c8d18DECBa5798827539Ae99', // EURS
        '0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5', // aPolEURS
        '0xa3fa99a148fa48d14ed51d610c367c61876997f1', // MAI
        '0xeBe517846d0F36eCEd99C735cbF6131e1fEB775D', // aPolMAI
        ADDRESSES.polygon.MATICX, // MATICX
        '0x80cA0d8C38d2e2BcbaB66aA1648Bd1C7160500FE', // aPolMATICX
        '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4', // stMATIC
        '0xEA1132120ddcDDA2F119e99Fa7A27a0d036F7Ac9', // aPolSTMATIC
        '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c', // jEUR
        '0x6533afac2E7BCCB20dca161449A13A32D391fb00', // aPolJEUR
        '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4', //agEUR
        '0x8437d7C167dFB82ED4Cb79CD44B7a32A1dd95c77', //aPolAGEUR
      ],
      owners: [
        '0x7734280A4337F37Fbf4651073Db7c28C80B339e9', // Aave V2 Collector
        '0xe8599F3cc5D38a9aD6F3684cd5CEa72f10Dbc383', // Aave V3 Treasury
      ],
      ownTokens: ['0xD6DF932A45C0f255f85145f286eA0b292B21C90B'],
    },
    avax: {
      tokens: [
        ADDRESSES.avax.DAI,
        '0x47AFa96Cdc9fAb46904A55a6ad4bf6660B53c38a', // avDAI
        '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', // aAvaDAI
        ADDRESSES.avax.USDC_e,
        '0x46A51127C3ce23fb7AB1DE06226147F446e4a857', // avUSDC
        '0x625E7708f30cA75bfd92586e17077590C60eb4cD', // aAvaUSDC
        ADDRESSES.avax.USDT_e,
        '0x532E6537FEA298397212F09A61e03311686f548e', // avUSDT
        '0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // aAvaUSDT
        '0xD45B7c061016102f9FA220502908f2c0f1add1D7', // avAAVE
        '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375', // aAvaAAVE
        ADDRESSES.avax.WAVAX,
        '0xDFE521292EcE2A4f44242efBcD66Bc594CA9714B', // avWAVAX
        ADDRESSES.polygon.aPolWMATIC, // aAvaWAVAX
        ADDRESSES.avax.WBTC_e, // WBTC
        '0x686bEF2417b6Dc32C50a3cBfbCC3bb60E1e9a15D', // aWBTC
        '0x078f358208685046a11C85e8ad32895DED33A249', // aAvaWBTC
        ADDRESSES.avax.WETH_e,
        '0x53f7c5869a859F0AeC3D334ee8B4Cf01E3492f21', // aWETH
        '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', // aAvaWETH
        '0x5947bb275c521040051d82396192181b413227a3', // LINK
        '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530', // aAvaLINK
        '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64', // FRAX
        '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA', // aAvaFRAX
        '0x5c49b268c9841aff1cc3b0a418ff5c3442ee3f3b', // MAI
        '0x8Eb270e296023E9D92081fdF967dDd7878724424', // aAvaMAI
        ADDRESSES.avax.SAVAX, // sAVAX
        '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf', // aAvaSAVAX
        ADDRESSES.avax.BTC_b,
        '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692', // aAvaBTC.b
      ],
      owners: [
        '0x467b92aF281d14cB6809913AD016a607b5ba8A36', // Aave V2 Collector
        '0x5ba7fd868c40c16f7aDfAe6CF87121E13FC2F7a0', // Aave V3 Treasury
      ],
      ownTokens: ['0x63a72806098bd3d9520cc43356dd78afe5d386d9'],
    },
    arbitrum: {
      tokens: [
        ADDRESSES.optimism.DAI, // DAI
        '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', // aArbDAI
        '0xd22a58f79e9481d1a88e00c343885a588b34b68b', // EURS
        ADDRESSES.polygon.aPolWMATIC, // aArbEURS
        ADDRESSES.arbitrum.USDC, // USDC
        '0x625E7708f30cA75bfd92586e17077590C60eb4cD', // aArbUSDC
        ADDRESSES.arbitrum.USDT, // USDT
        '0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // aArbUSDT
        '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375', // aArbAAVE
        ADDRESSES.arbitrum.LINK, // LINK
        '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530', // aArbLINK
        ADDRESSES.arbitrum.WBTC, // WBTC
        '0x078f358208685046a11C85e8ad32895DED33A249', // aArbWBTC
        ADDRESSES.arbitrum.WETH, // WETH
        '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', // aArbWETH
      ],
      owners: ['0x053D55f9B5AF8694c503EB288a1B7E552f590710'],
      ownTokens: ['0xba5ddd1f9d7f570dc94a51479a000e3bce967196'],
    },
    optimism: {
      tokens: [
        ADDRESSES.tombchain.FTM, // WETH
        '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', // aOptWETH
        ADDRESSES.optimism.WBTC, // WBTC
        '0x078f358208685046a11C85e8ad32895DED33A249', // aOptWBTC
        ADDRESSES.optimism.OP, // OP
        '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf', // aOptOP
        ADDRESSES.optimism.DAI, // DAI
        '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', // aOptDAI
        ADDRESSES.optimism.sUSD, // sUSD
        ADDRESSES.polygon.aPolWMATIC, // aOptSUSD
        ADDRESSES.optimism.USDC, // USDC
        '0x625E7708f30cA75bfd92586e17077590C60eb4cD', // aOptUSDC
        ADDRESSES.optimism.USDT, // USDT
        '0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // aOptUSDT
        '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375', // aOptAAVE
        '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6', // LINK
        '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530', // aOptLINK
      ],
      owners: ['0xB2289E329D2F85F1eD31Adbb30eA345278F21bcf'],
      ownTokens: ['0x76fb31fb4af56892a25e32cfc43de717950c9278'],
    },
    fantom: {
      tokens: [
        '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf', // aFanCRV
        '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', // aFanDAI
        '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530', // aFanLINK
        '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA', // aFanSUSHI
        '0x625E7708f30cA75bfd92586e17077590C60eb4cD', // aFanUSDC
        '0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // aFanUSDT
        '0x078f358208685046a11C85e8ad32895DED33A249', // aFanWBTC
        '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', // aFanWETH
        ADDRESSES.polygon.aPolWMATIC, // aFanWFTM
      ],
      owners: ['0xBe85413851D195fC6341619cD68BfDc26a25b928'],
      ownTokens: ['0xf329e36C7bF6E5E86ce2150875a84Ce77f477375'],
    },
  },
  'treasury/aavegotchi': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI, //DAI
      ],
      owners: ['0xFFE6280ae4E864D9aF836B562359FD828EcE8020', '0xfb76e9be55758d0042e003c1e46e186360f0627e', '0x53c3CA81EA03001a350166D2Cc0fcd9d4c1b7B62'],
      ownTokens: ['0x3F382DbD960E3a9bbCeaE22651E88158d2791550'],
    },
    polygon: {
      tokens: [nullAddress, ADDRESSES.polygon.DAI, ADDRESSES.polygon.USDC],
      owners: [
        '0xb208f8BB431f580CC4b216826AFfB128cd1431aB',
        '0x27DF5C6dcd360f372e23d5e63645eC0072D0C098',
        '0x939b67F6F6BE63E09B0258621c5A24eecB92631c',
        '0x62DE034b1A69eF853c9d0D8a33D26DF5cF26682E',
        '0x8c8E076Cd7D2A17Ba2a5e5AF7036c2b2B7F790f6',
        '0x48eA1d45142fC645fDcf78C133Ac082eF159Fe14',
        '0x6fb7e0AAFBa16396Ad6c1046027717bcA25F821f',
        '0x921D8FDF089775D5AC61b2d6e8f34F1edd554D8f',
        '0xa8D00712abE7af3446cdC651c159737cCFB43255',
        '0xed7cb3973C7bFE4bf78dA8E5f52EB04c0dF53d3B',
        '0x62DE034b1A69eF853c9d0D8a33D26DF5cF26682E',
        '0x8c8E076Cd7D2A17Ba2a5e5AF7036c2b2B7F790f6',
        '0xAbA69f6E893B18bE066a237f723F43315BBF9D9A',
      ],
      ownTokens: ['0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7'],
    },
  },
  'treasury/abachi': {
    ethereum: {
      owners: ['0x6fce4c6cdd8c4e6c7486553d09bdd9aee61cf095'],
      ownTokens: ['0xBF0B8b7475EdB32D103001Efd19FdD2753d7B76D'],
    },
  },
  'treasury/abracadabra': {
    ethereum: {
      tokens: [
        nullAddress,
        '0x090185f2135308BaD17527004364eBcC2D37e5F6', // SPELL
        ADDRESSES.ethereum.USDT, // USDT
        '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3', // MIM
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.DAI, // DAI
        ADDRESSES.ethereum.CRV, // CRV
        ADDRESSES.ethereum.WETH, // wETH
        '0x4d224452801aced8b2f0aebe155379bb5d594381', // APE
        '0x27B5739e22ad9033bcBf192059122d163b60349D', // st-yCRV
        '0xdCD90C7f6324cfa40d7169ef80b12031770B4325', // yvCurve-stETH
        '0xa258C4606Ca8206D8aA700cE2143D7db854D168c', // yvWETH
        '0xdA816459F1AB5631232FE5e97a05BBBb94970c95', // yvDAI
        '0x3B27F92C0e212C671EA351827EDF93DB27cc0c65', // yvUSDT
        '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE', // yvUSDC
        '0x27b7b1ad7288079A66d12350c828D3C00A6F07d7', // yvCurve-IronBank
        '0x1635b506a88fBF428465Ad65d00e8d6B6E5846C3', // yvCurve-CVXETH
        '0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56', // S*USDC
        '0x38EA452219524Bb87e18dE1C24D3bB59510BD783', // S*USDT
        '0xf35b31B941D94B249EaDED041DB1b05b7097fEb6', // magicAPE
      ],
      owners: ['0x5A7C5505f3CFB9a0D9A8493EC41bf27EE48c406D', '0xdf2c270f610dc35d8ffda5b453e74db5471e126b'],
      ownTokens: ['0x090185f2135308BaD17527004364eBcC2D37e5F6'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.ARB, // ARB
        '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a', // MIM
        ADDRESSES.arbitrum.USDC, // USDC
        ADDRESSES.arbitrum.USDT, // USDT
        '0x85667409a723684fe1e57dd1abde8d88c2f54214', // magicGLP
      ],
      owners: ['0xA71A021EF66B03E45E0d85590432DFCfa1b7174C'],
      ownTokens: [],
    },
  },
  'treasury/across': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0xd16d904b68429b93f1dfcd837f61aedcd224e8f4'],
    },
  },
  'treasury/aimstrong': {
    base: {
      tokens: [nullAddress],
      owners: ['0x81ff99181d4Bdd14f64dC1a0e1A98EF81688bA0a'],
    },
  },
  'treasury/airswap': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.BUSD,
      ],
      owners: ['0x24b4ce3ad4366b73f839c1b1fd11d1f636514534', '0x8e5a68a73470c07d043b57d0751fba8b0315c12c', '0xf8bb149f9525875fa47b8cc632d368eb600faba3'],
      ownTokens: ['0x27054b13b1b798b345b591a4d22e6562d47ea75a'],
    },
  },
  'treasury/ajira-pay-finance': {
    kava: {
      tokens: [
        ADDRESSES.kava.WKAVA, '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
        '0xb44a9b6905af7c801311e8f4e76932ee959c663c', ADDRESSES.kava.axlUSDC,
        '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
        nullAddress,
      ],
      owners: ['0xdBD5c57F3a0A6eFC7c9E91639D72Cc139c581AB4'],
      ownTokens: ['0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'],
    },
    bsc: {
      tokens: [
        ADDRESSES.bsc.USDT, ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.BUSD, ADDRESSES.bsc.USDC,
        '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
        nullAddress,
      ],
      owners: ['0x12A65dFDD9E94Bd7f7547d1C4365c5c067f47ed0'],
      ownTokens: ['0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'],
    },
    polygon: {
      tokens: [
        ADDRESSES.polygon.USDT, ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.WETH_1, ADDRESSES.polygon.WBTC,
        ADDRESSES.polygon.WMATIC_1, ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.BUSD, '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
        nullAddress,
      ],
      owners: ['0xd7B2DEcAAcD75ADb92C1ee0C77e2303c815012d0'],
      ownTokens: ['0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'],
    },
    arbitrum: {
      tokens: [
        ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.USDT,
        ADDRESSES.optimism.DAI, '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
        ADDRESSES.arbitrum.ARB,
        nullAddress,
      ],
      owners: ['0x396B58574c0760E84E16468457c460bdCC6f8b57'],
      ownTokens: ['0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'],
    },
  },
  'treasury/alchemix': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        ADDRESSES.ethereum.DAI, //DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3', //aDAI
        ADDRESSES.ethereum.WETH, //WETH
        ADDRESSES.ethereum.USDT, //USDT
        '0xf16aEe6a71aF1A9Bc8F56975A4c2705ca7A782Bc', //20WETH-80ALC
        ADDRESSES.ethereum.LUSD,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.YFI,
        '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
        ADDRESSES.ethereum.FXS,
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
        '0xF1bB87563A122211d40d393eBf1c633c330377F9', //xpremia
        ADDRESSES.ethereum.FXS,
        '0x7f50786A0b15723D741727882ee99a0BF34e3466',
      ],
      owners: [
        '0x8392F6669292fA56123F71949B52d883aE57e225',
        '0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9',
        '0x9735F7d3Ea56b454b24fFD74C58E9bD85cfaD31B',
        '0xe761bf731A06fE8259FeE05897B2687D56933110',
        '0x06378717d86B8cd2DBa58c87383dA1EDA92d3495',
        '0x3216D2A52f0094AA860ca090BC5C335dE36e6273',
      ],
      ownTokens: ['0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF'],
      blacklistedTokens: ['0xbc6da0fe9ad5f3b0d58160288917aa56653660e9', '0x0100546f2cd4c9d97f798ffc9755e47865ff7ee6'],
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC, //USDC
        ADDRESSES.optimism.OP,
        '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',
      ],
      owners: ['0xc224bf25dcc99236f00843c7d8c4194abe8aa94a'],
      blacklistedTokens: ['0x3e29d3a9316dab217754d13b28646b76607c5f04'],
    },
    fantom: {
      tokens: [
        nullAddress,
        '0x04068da6c83afcfa0e13ba15a6696662335d5b75', //USDC
        '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
        ADDRESSES.fantom.WFTM,
      ],
      owners: ['0x6b291cf19370a14bbb4491b01091e1e29335e605'],
    },
  },
  'treasury/alienbase': {
    base: {
      owners: ['0x4aB9070B7680f802cBf8322e597a4409902171e5'],
      ownTokens: ['0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4'],
    },
  },
  'treasury/alkimiya': {
    base: {
      owners: ['0x62E30D1969FAf92dc8a3C22A1552eB83763eb372'],
    },
  },
  'treasury/alpacacity': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0xd93DC6B8Ef043C3ad409C6480A57b4851b3C055e', '0xF30Ccf37c7058Db0026DE9239d373a1c8723210a'],
      ownTokens: ['0x7cA4408137eb639570F8E647d9bD7B7E8717514A'],
    },
    bsc: {
      tokens: [nullAddress],
      owners: ['0x3226dBce6317dF643EB68bbeF379E6B968b3E669', '0xb9C76Db167Fa6BFd0e6d78063C63B3073C637497', '0x6F712F28834b82B7781311b42a945a6134112B2A'],
      ownTokens: ['0xc5e6689c9c8b02be7c49912ef19e79cf24977f03'],
    },
  },
  'treasury/alphaX-protocol': {
    ethereum: {
      owners: ['0x95e2A6458419b7A38193CB853F45fD7329443A90'],
    },
  },
  'treasury/alphix': {
    base: {
      owners: ['0x240B7e8FcfdB38C94c0b8733A4A50F28A4C99fa8'],
    },
  },
  'treasury/alto': {
    ethereum: { owners: ['0xA1148A1b94262540994Cf9Aa431A13ad39764228'] },
  },
  'treasury/altr-lend': {
    polygon: {
      tokens: [nullAddress],
      owners: ['0x881d440A7e047335BE81BBB27dBA6AEe9c2aa529'],
      ownTokens: ['0xc2A45FE7d40bCAc8369371B08419DDAFd3131b4a'], // LCD
    },
  },
  'treasury/alvara': {
    ethereum: {
      owners: ['0x689ac37b02a36e77d2ad1ea7d923a05233a0d8e2'],
      ownTokens: ['0x8e729198d1C59B82bd6bBa579310C40d740A11C2'], // ALVA
    },
  },
  'treasury/alyx': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.USDT,
      ],
      owners: ['0x576182b7a1b0bC67701ead28a087228c50Aa0982'],
    },
  },
  'treasury/amnis.finance': {
    aptos: {
      tokens: [
        nullAddress,
        ADDRESSES.aptos.APT,
        ADDRESSES.aptos.amAPT,
        ADDRESSES.aptos.stApt,
      ],
      owners: ['0x06b6f37af314f19fea6b1940b2ca2c38c158b45476a70eb8874bd17be7b65c8b'],
    },
  },
  'treasury/antfarm_finance': {
    ethereum: {
      tokens: [nullAddress, '0x518b63Da813D46556FEa041A88b52e3CAa8C16a8', '0x0BF43350076F95e0d16120b4D6bdfA1C9D50BDBD'],
      owners: ['0x529C78Ee582e4293a20Ab60c848506eADd8723D8'],
      ownTokens: ['0x518b63Da813D46556FEa041A88b52e3CAa8C16a8', '0x0BF43350076F95e0d16120b4D6bdfA1C9D50BDBD'],
    },
  },
  'treasury/ape-coin': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.STETH,
      ],
      owners: ['0x03ca52e482912308c287d09ec941b996c18668f5', '0x1633b453c3ca5a244c66f4418ff5120282370053'],
      ownTokens: ['0x4d224452801aced8b2f0aebe155379bb5d594381'],
    },
  },
  'treasury/apex-protocol': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0xae792a7bf5f85a68ffe92bfbfa7a04c72d7cb095'],
    },
  },
  'treasury/apollox': {
    arbitrum: {
      owners: ['0x60ede4402a34762d608ad9ba7bd3797f5bfe544c'],
      ownTokens: [],
      tokens: [nullAddress],
    },
    bsc: {
      owners: ['0x60ede4402a34762d608ad9ba7bd3797f5bfe544c'],
      ownTokens: ['0x78f5d389f5cdccfc41594abab4b0ed02f31398b3'],
      tokens: [ADDRESSES.bsc.USDT],
    },
  },
  'treasury/apyee': {
    ethereum: {
      owners: ['0xEC4d3B6a39D61B85dF61cCb35CE693517992A98e'],
      tokens: [ADDRESSES.ethereum.USDC],
    },
    base: {
      owners: ['0xEC4d3B6a39D61B85dF61cCb35CE693517992A98e'],
      tokens: [ADDRESSES.base.USDC],
    },
    arbitrum: {
      owners: ['0xEC4d3B6a39D61B85dF61cCb35CE693517992A98e'],
      tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
    },
    bsc: {
      owners: ['0xEC4d3B6a39D61B85dF61cCb35CE693517992A98e'],
      tokens: [ADDRESSES.bsc.USDC],
    },
  },
  'treasury/aragon': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        ADDRESSES.ethereum.DAI, //DAI
        ADDRESSES.ethereum.WETH, //WETH
        ADDRESSES.ethereum.UNI, //UNI
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', //ENS
        ADDRESSES.ethereum.BUSD, //BUSD
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', //GRT
        '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c', //yyDAI+yUSDC+yUSDT+yTUSD
        '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', //GTC
        '0xdd974D5C2e2928deA5F71b9825b8b646686BD200', //KNC
        '0x8f8221aFbB33998d8584A2B05749bA73c37a938a', //REQ
        '0x24cCeDEBF841544C9e6a62Af4E8c2fA6e5a46FdE', //BlueSparrow
        '0x232FB065D9d24c34708eeDbF03724f2e95ABE768', //SHEESHA
        '0xaC9Bb427953aC7FDDC562ADcA86CF42D988047Fd', //STT
        '0x0f5d2fb29fb7d3cfee444a200298f468908cc942', //MANA
        ADDRESSES.ethereum.USDT, //USDT
      ],
      owners: ['0xfb633F47A84a1450EE0413f2C32dC1772CcAea3e', '0x7ecd1eac2a07974bcbabafee44b5cc44ceee9540', '0xcafe1a77e84698c83ca8931f54a755176ef75f2c'],
      ownTokens: ['0xa117000000f279D81A1D3cc75430fAA017FA5A2e', '0x9dEF9511fEc79f83AFCBFfe4776B1D817DC775aE'],
    },
  },
  'treasury/arbitrum-dao': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0xf3fc178157fb3c87548baa86f9d24ba38e649b58', '0x2E041280627800801E90E9Ac83532fadb6cAd99A', '0x32e7AF5A8151934F3787d0cD59EB6EDd0a736b1d', '0xbF5041Fc07E1c866D15c749156657B8eEd0fb649', '0xbFc1FECa8B09A5c5D3EFfE7429eBE24b9c09EF58'],
      ownTokens: [ADDRESSES.arbitrum.ARB],
    },
    arbitrum_nova: {
      tokens: [nullAddress],
      owners: ['0x509386DbF5C0BE6fd68Df97A05fdB375136c32De', '0x3B68a689c929327224dBfCe31C1bf72Ffd2559Ce', '0x9fCB6F75D99029f28F6F4a1d277bae49c5CAC79f'],
    },
  },
  'treasury/arcade-xyz': {
    ethereum: {
      owners: ['0xac2b57b372E198F09d4bF5F445CA1228771C12c5'],
      ownTokens: ['0xe020B01B6fbD83066aa2e8ee0CCD1eB8d9Cc70bF', ADDRESSES.GAS_TOKEN_2],
    },
  },

  // ----- from batch_a01.js -----
  'treasury/archer-exchange': {
    solana: {
      owners: [
        'ELGWUVJD6NBNLyJ5Xv98PzoSg9Wh2Y8Bwep9JZgm9nuo',
      ],
    },
  },
  'treasury/archimedes': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86', // ousd
      ],
      owners: ['0x29520fd76494Fd155c04Fa7c5532D2B2695D68C6'],
      ownTokens: ['0x73C69d24ad28e2d43D03CBf35F79fE26EBDE1011'],
    },
  },
  'treasury/atlas-usv': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,
      ],
      owners: ['0x8739f0EeF3163C3db7b994d0e301BC375d757aF6'],
      ownTokens: ['0x88536c9b2c4701b8db824e6a16829d5b5eb84440'],
    },
    polygon: {
      tokens: [
        nullAddress,
        '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1', // mimatic
        ADDRESSES.polygon.DAI, // DAI
        '0x104592a158490a9228070E0A8e5343B499e125D0', // frax
      ],
      owners: ['0x71EF2894E23D7ea7Fd73a3558B3a0bA25689bC86'],
      ownTokens: ['0xac63686230f64bdeaf086fe6764085453ab3023f'],
    },
    avax: {
      tokens: [
        ADDRESSES.avax.DAI, // DAI
      ],
      owners: ['0x53a73b76F84bc5E27A6d3653503Af98e727e2991'],
      ownTokens: ['0xb0a8e082e5f8d2a04e74372c1be47737d85a0e73'],
    },
    bsc: {
      tokens: [
        ADDRESSES.bsc.DAI, // DAI
        ADDRESSES.bsc.BUSD, // busd
      ],
      owners: ['0x4fa7C6f58bb7f30c38d69D7E6fF76911abfd393d'],
      ownTokens: ['0xaf6162dc717cfc8818efc8d6f46a41cf7042fcba'],
    },
  },
  'treasury/augury': {
    polygon: {
      tokens: [nullAddress, '0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4', '0x831753dd7087cac61ab5644b308642cc1c33dc13', ADDRESSES.polygon.USDC, '0x8a953cfe442c5e8855cc6c61b1293fa648bae472', ADDRESSES.polygon.USDT],
      owners: ['0xE2E26BAc2ff37A7aE219EcEF74C5A1Bf95d5f854'],
      ownTokens: ['0x76e63a3E7Ba1e2E61D3DA86a87479f983dE89a7E'],
    },
  },
  'treasury/aura': {
    ethereum: {
      owner: '0xfc78f8e1Af80A3bF5A1783BB59eD2d1b10f78cA9',
      ownTokens: [
        '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF', // AURA
        '0xc29562b045D80fD77c69Bec09541F5c16fe20d9d', // B-80AURA-20WETH
        '0x0Bf1f1E3ccf6A1089710359E312753b44BBF85f8', // sAURA
      ],
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
        ADDRESSES.ethereum.SAFE,
        '0x0d02755a5700414B26FF040e1dE35D337DF56218', // BEND
        '0x616e8BfA43F920657B3497DBf40D6b1A02D4608d', // auraBAL
        '0x3dd0843A028C86e0b760b1A76929d1C5Ef93a2dd', // B-auraBAL-STABLE
      ],
    },
  },
  'treasury/axelar': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0x8d9249e6049bb17c15007bc58a5bec12a5af4346'],
    },
  },
  'treasury/badidea': {
    ethereum: {
      tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
      owners: ['0xe5F6f7181EEc4C2A8ae59e5dE2aFeD32E9ea3250', '0xA41f36D9F8c9eD352Ed80105C921D55559C2F8E9', '0xBA07DbA88B9d3700c169cE82Ced3C1bF4791b3b6', '0x7A748CE254bb2E377aaFd24b81Eb4442c1a57734', '0x33a733B6b613A2178109F2353B6369D2d3a86b0e', '0x22F519e33550A0F521DF80080f8Aabe22e63131d'],
      ownTokens: ['0x32b86b99441480a7E5BD3A26c124ec2373e3F015'],
    },
  },
  'treasury/bancor': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.LINK,
        ADDRESSES.ethereum.DAI,
        '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
        ADDRESSES.ethereum.SNX,
        '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
        '0x4691937a7508860F876c9c0a2a617E7d9E945D4B',
        '0x8f8221aFbB33998d8584A2B05749bA73c37a938a',
        ADDRESSES.ethereum.YFI,
        '0x408e41876cCCDC0F92210600ef50372656052a38',
        '0x1559FA1b8F28238FD5D76D9f434ad86FD20D1559',
        '0xa1faa113cbE53436Df28FF0aEe54275c13B40975',
        ADDRESSES.ethereum.BAT,
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
        ADDRESSES.ethereum.MATIC,
        '0x0f71B8De197A1C84d31de0F1fA7926c365F052B3',
        '0xBC19712FEB3a26080eBf6f2F7849b417FdD792CA',
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE',
        '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
        '0x6710c63432A2De02954fc0f851db07146a6c0312',
        ADDRESSES.ethereum.AAVE,
        ADDRESSES.ethereum.WBTC,
        '0x903bef1736cddf2a537176cf3c64579c3867a881',
        '0x111111517e4929d3dcbdfa7cce55d30d4b6bc4d6', // ichi
        '0x6c6EE5e31d828De241282B9606C8e98Ea48526E2', // hot
        '0x275f5Ad03be0Fa221B4C6649B8AeE09a42D9412A', // mona
        '0x4a220E6096B25EADb88358cb44068A3248254675', // qnt
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', // ENS
        '0xb9EF770B6A5e12E45983C5D80545258aA38F3B78', // zcn
        '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07', // omg
        '0xaA7a9CA87d3694B5755f213B5D04094b8d0F0A6F', // trac
        ADDRESSES.ethereum.WSTETH,
        '0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3', // fodl
        ADDRESSES.ethereum.MKR,
      ],
      owners: ['0x649765821D9f64198c905eC0B2B037a4a52Bc373'],
      ownTokens: ['0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C', '0x48Fb253446873234F2fEBbF9BdeAA72d9d387f94'],
    },
  },
  'treasury/banklessdao': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
        '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321', // VITA
        ADDRESSES.ethereum.RETH, // rETH
        ADDRESSES.ethereum.DAI, // DAI
        '0x3541A5C1b04AdABA0B83F161747815cd7B1516bC', // KNIGHT
        '0xfb5453340C03db5aDe474b27E68B6a9c6b2823Eb', // ROBOT
        ADDRESSES.ethereum.WETH, // WETH
        '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF', // RARI
        '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', // FEI
        '0x0954906da0Bf32d5479e25f46056d22f08464cab', // INDEX
        '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828', // UMA
        '0xbC396689893D065F41bc2C6EcbeE5e0085233447', // PERP
        '0xD56daC73A4d6766464b38ec6D91eB45Ce7457c44', // PAN
        ADDRESSES.ethereum.USDT, // USDT
        '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074', // MASK
        '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7', // GRO
        ADDRESSES.ethereum.SUSHI, // SUSHI
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', // GRT
      ],
      owners: ['0xf26d1Bb347a59F6C283C53156519cC1B1ABacA51'],
      ownTokens: ['0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198', '0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6'],
    },
  },
  'treasury/bankofcronos': {
    cronos: {
      tokens: [
        nullAddress,
        ADDRESSES.cronos.USDC, // USDC
        '0x26043Aaa4D982BeEd7750e2D424547F5D76951d4', // CUSD
        ADDRESSES.cronos.WCRO_1, // WCRO
        '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a', // WETH
        ADDRESSES.cronos.WBTC, // WBTC
      ],
      owners: ['0xBacF28BF21B374459C738289559EF89978D08102'],
    },
  },
  'treasury/baptswap': {
    aptos: {
      owners: ['0x6dc7c3b14905bff00bd58cce4b140b86f2bf4814bd72e8c95caec370ed5fe41c'],
    },
  },
  'treasury/baseswap': {
    base: {
      tokens: [
        nullAddress,
        ADDRESSES.base.USDbC, // USDbC
      ],
      owners: ['0xAF1823bACd8EDDA3b815180a61F8741fA4aBc6Dd'],
    },
  },
  'treasury/battlefly': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC, // USDC
        ADDRESSES.arbitrum.WETH, // WETH
        ADDRESSES.arbitrum.USDT, // USDT
        ADDRESSES.optimism.DAI, // DAI
      ],
      owners: ['0xF5411006eEfD66c213d2fd2033a1d340458B7226'],
      ownTokens: ['0x872bAD41CFc8BA731f811fEa8B2d0b9fd6369585', '0x539bde0d7dbd336b79148aa742883198bbf60342'],
    },
  },
  'treasury/beamable-network': {
    solana: {
      tokens: [
        nullAddress,
      ],
      owners: ['88QishokZbUicErBP4kF18KGXeURo4iTQ9651gkiHk8y', '2cxoaTUEW3CnSXx4fWK4SscJqGaem4CrYmqupSFVsjEs', 'NzHcrCaL1CoE7RNaArmtaoSuJnoSqedfsjTe1C13LSr', 'BNePhTKwPp1fEM7xKDbzd6xBbevCab5brB1gi1CNYRUx'],
      ownTokens: ['BMBtwz6LFDJVJd2aZvL5F64fdvWP3RPn4NP5q9Xe15UD'],
    },
  },
  'treasury/beanstalk': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.SAFE,
        ADDRESSES.ethereum.USDC,
      ],
      owners: ['0xb7ab3f0667eFF5e2299d39C23Aa0C956e8982235', '0x21DE18B6A8f78eDe6D16C50A167f6B222DC08DF7'],
      ownTokens: ['0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab'],
    },
  },
  'treasury/beethovenx': {
    fantom: {
      owners: ['0xa1e849b1d6c2fd31c63eef7822e9e0632411ada7'],
      tokens: [
        nullAddress,
        '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
        '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE', // BOO
        ADDRESSES.fantom.WFTM, // WFTM
        '0x91a40c733c97a6e1bf876eaf9ed8c08102eb491f', // lzDAI
        ADDRESSES.fantom.USDC_L0, // lzUSDC
        '0xcc1b99dDAc1a33c201a742A1851662E87BC7f22C', // lzUSDT
        '0xf1648C50d2863f780c57849D812b4B7686031A3D', // lzWBTC
        '0x695921034f0387eAc4e11620EE91b1b15A6A09fE', // lzWETH
        '0xc5713B6a0F26bf0fdC1c52B90cd184D950be515C', // LINSPIRIT
        '0xde5ed76e7c05ec5e4572cfc88d1acea165109e44', // DEUS
        '0xc3f069d7439baf6d4d6e9478d9cc77778e62d147', // FLIBERO
        '0xf3A602d30dcB723A74a0198313a7551FEacA7DAc', // BPT-QUARTET
        '0x56aD84b777ff732de69E85813DAEE1393a9FFE10', // BPT-FOTO-II
        '0xe3f201D4676d1Aec0Baa8c70f8f07F14B73B3Aec', // bTAROT
        '0x838229095fa83bcd993ef225d01a990e3bc197a8', // BPT-lzFOTO
      ],
      ownTokens: [
        '0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e', // BEETS
        '0x2Cea0dA40cF133721377bB2b0bF4aDc43715BFC3', // BPT-USDCfBEETS
        '0xcdE5a11a4ACB4eE4c805352Cec57E236bdBC3837', // BPT-BEETS-FTM
      ],
    },
    optimism: {
      owners: ['0x2a185c8a3c63d7bfe63ad5d950244ffe9d0a4b60'],
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP, // OP
        ADDRESSES.optimism.USDC,
        '0xFdb794692724153d1488CcdBE0C56c252596735F', // LDO
        '0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921', // BAL
        '0xEf47a07945D53Ee3a511751375A1ed0B79d6232D', // BPT-STABEET-gauge
        '0x38f79beFfC211c6c439b0A3d10A0A673EE63AFb4', // BPT-rETH-ETH-gauge
        '0x61ac9315a1Ae71633E95Fb35601B59180eC8d61d', // BPT-rETH-ETH-aura-vault
        '0x9f43f726dF654E033B04c39989af90ab44875fEB', // BPT-wstETH-ETH-CL-aura-vault
        '0x23Ca0306B21ea71552B148cf3c4db4Fc85AE1929', // BPT-3stable
        '0x88726Ff53eE2dc7F55C17FBd93521B8B92519f49', // BPT-3stable-gauge
      ],
      ownTokens: [
        '0x97513e975a7fA9072c72C92d8000B0dB90b163c5', // BEETS
      ],
    },
    ethereum: {
      owners: ['0xea06e1b4259730724885a39ce3ca670efb020e26'],
      tokens: [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WBTC,
        '0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56', // B-80BAL-20WETH
        '0xc128a9954e6c874ea3d62ce62b468ba073093f25', // veBAL
        '0x616e8BfA43F920657B3497DBf40D6b1A02D4608d', // auraBAL
        '0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac', // vlAURA
        '0xA13a9247ea42D743238089903570127DdA72fE44', // bb-a-USD
      ],
      ownTokens: [],
    },
  },
  'treasury/benddao': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
        '0x4d224452801aced8b2f0aebe155379bb5d594381', // APE
      ],
      owners: ['0x472FcC65Fab565f75B1e0E861864A86FE5bcEd7B'],
      ownTokens: ['0x0d02755a5700414b26ff040e1de35d337df56218'],
    },
  },
  'treasury/beradrome': {
    berachain: {
      tokens: [
        nullAddress,
        '0x5C43a5fEf2b056934478373A53d1cb08030fd382', // BRLY
        ADDRESSES.berachain.HONEY, // HONEY
        '0x18878Df23e2a36f81e820e4b47b4A40576D3159C', // OHM
        '0x231A6BD8eB88Cfa42776B7Ac575CeCAf82bf1E21', // PLUG
      ],
      owners: ['0xaB53AfB5C63E2552e7bD986c0a38E8a8dC58E09C'],
      ownTokens: ['0x40A8d9efE6A2C6C9D193Cc0A4476767748E68133', '0x7F0976b52F6c1ddcD4d6f639537C97DE22fa2b69'],
    },
  },
  'treasury/betswirl': {
    ethereum: {
      owners: ['0x9f72820ee00d54330F9Ba31ff6006116D7ddFE67'],
      ownTokens: ['0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'],
    },
    polygon: {
      owners: ['0xfA695010bF9e757a1abCd2703259F419217aa756'],
      ownTokens: ['0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'],
      blacklistedTokens: ['0x9246a5F10A79a5a939b0C2a75A3AD196aAfDB43b'],
    },
    bsc: {
      owners: ['0xCD25325a6eF20BC5dF9bceAc0cC22a48d2e8f6eF'],
      ownTokens: ['0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'],
      blacklistedTokens: ['0x3e0a7C7dB7bB21bDA290A80c9811DE6d47781671'],
    },
    avax: {
      owners: ['0x1a75280F832280Af93f588f715a5Fb4Ca7918430'],
      ownTokens: ['0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'],
      blacklistedTokens: ['0xc763f8570A48c4c00C80B76107cbE744dDa67b79'],
    },
    arbitrum: {
      owners: ['0xf14C79a7fA22c1f97C779F573c9bF39b6b43381c'],
      ownTokens: ['0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'],
      blacklistedTokens: ['0xe26Ae3d881f3d5dEF58D795f611753804E7A6B26'],
    },
    xdai: {
      owners: ['0x6e36cFcD5d59b96AaBC8699C2Ad31a874224D86e'],
    },
    base: {
      owners: ['0xBf1998e1F1cD52fBfb63e7E646bb39c091A7B70A'],
      ownTokens: ['0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'],
    },
    optimism: {
      owners: ['0xE901680E2E754Fc97288631dc29D91f7a989Cc10'],
    },
    unichain: {
      owners: ['0xBf1998e1F1cD52fBfb63e7E646bb39c091A7B70A'],
    },
  },
  'treasury/bhutan-gov': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
      ],
      owners: [
        '0xA4aA40042EfC208fA5F329485a5B3Aa569DF66C7',
        '0x9bfc2038C0CECC85b2dAb0e4ff9e4FfdAdE58036',
        '0x713d0c63492B156E5d7B59AB96A3895312a6939a',
      ],
    },
  },
  'treasury/bim': {
    base: { owners: ['0xcc0516d2B5D8E156890D894Ee03a42BaC7176972'], ownTokens: ['0x555FFF48549C1A25a723Bd8e7eD10870D82E8379'] },
    optimism: { owners: ['0xcc0516d2B5D8E156890D894Ee03a42BaC7176972'] },
    xdai: { owners: ['0xcc0516d2B5D8E156890D894Ee03a42BaC7176972'] },
    polygon: { owners: ['0xcc0516d2B5D8E156890D894Ee03a42BaC7176972'] },
    bsc: { owners: ['0xcc0516d2B5D8E156890D894Ee03a42BaC7176972'] },
    arbitrum: { owners: ['0xcc0516d2B5D8E156890D894Ee03a42BaC7176972'] },
    ethereum: { owners: ['0xcc0516d2B5D8E156890D894Ee03a42BaC7176972'] },
  },
  'treasury/bitsCrunch': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0xf42c74D82a42a7BEC7565c5a866Baca11260F0AF'],
      ownTokens: ['0xBEF26Bd568e421D6708CCA55Ad6e35f8bfA0C406'],
    },
  },
  'treasury/blazestake': {
    solana: {
      owners: [
        '5sGFdNkBfbMxipRxBo28ZjTC9cEFmQPdC3Smk2gM8DVM',
        '4y86xvbDuyiJaxSYuMUNB5NzRYGfY4knvZJXmmAYTNmJ',
        'DfeAPX17JhfVpz5i2BiSaVhSereFQ8GoWABDw2v8p74j',
        '3SUtLuJVqaTVPnN38bQm6tc6v9kAMXg6Gg4SLuctMxK6',
      ],
      ownTokens: ['BLZEEuZUBVqFhj8adcCFPJvPVCiCyVmh3hkJMrU8KuJA'],
    },
  },
  'treasury/bonsai': {
    arbitrum: {
      tokens: [
        nullAddress, // ETH
        ADDRESSES.arbitrum.fsGLP,
        ADDRESSES.arbitrum.fGLP,
        ADDRESSES.arbitrum.USDC, // USDC.e
        ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.GMX,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.WBTC,
        '0xe4dddfe67e7164b0fe14e218d80dc4c08edc01cb', // KNC
        ADDRESSES.arbitrum.LINK, // LINK
        '0x56659245931cb6920e39c189d2a0e7dd0da2d57b', // IBEX
        '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0', // UNI
        '0x55ff62567f09906a85183b866df84bf599a4bf70', // KROM
        '0x3d9907f9a368ad0a51be60f7da3b97cf940982d8', // GRAIL
        '0x3CAaE25Ee616f2C8E13C74dA0813402eae3F496b', // xGRAIL
        '0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af', // spell
        '0x10010078a54396f62c96df8532dc2b4847d47ed3', // hnd
        '0x32eb7902d4134bf98a28b963d26de779af92a212', // rpdx
        '0xd4d42f0b6def4ce0383636770ef773390d85c61a', // sushi
        '0x2cab3abfc1670d1a452df502e216a66883cdf079', // l2dao
        '0x539bde0d7dbd336b79148aa742883198bbf60342', // magic
        '0x6694340fc020c5e6b96567843da2df01b2ce1eb6', // stg
      ],
      owners: ['0xb137d135Dc8482B633265c21191F50a4bA26145d', '0x8E52cA5A7a9249431F03d60D79DDA5EAB4930178', '0xB0B4bd94D656353a30773Ac883591DDBaBC0c0bA', '0x4e5645bee4eD80C6FEe04DCC15D14A3AC956748A'],
      ownTokens: ['0x79EaD7a012D97eD8DeEcE279f9bC39e264d7Eef9'],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // usdc
      ],
      owners: ['0x9478D820E8d38Ca96610b7FCbE377822C2F60f2c'],
    },
  },
  'treasury/botto': {
    ethereum: {
      owners: [
        '0x000a837ddd815bcba0fa91a98a50aa7a3fa62c9c',
        '0x35bb964878d7b6ddfa69cf0b97ee63fa3c9d9b49',
        '0xfd25808FFffbEf621C4DBf0171Fa647c916CB33b',
      ],
      tokens: [
        nullAddress,
      ],
      ownTokens: ['0x9DFAD1b7102D46b1b197b90095B5c4E9f5845BBA'], // Botto
    },
  },
  'treasury/brewlabs': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.BUSD, // busd
        ADDRESSES.bsc.WBNB, // wbnb
        ADDRESSES.bsc.USDT, // bsc-usd
        '0x9d7107c8E30617CAdc11f9692A19C82ae8bbA938', // roo
        '0xF14D3692B0055Db9Ca4c04065165d59B87E763f1', // mbc
        '0xe91a8D2c584Ca93C7405F15c22CdFE53C29896E3', // dext
        '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // cake
      ],
      owners: ['0x5Ac58191F3BBDF6D037C6C6201aDC9F99c93C53A'],
      ownTokens: ['0x6aAc56305825f712Fd44599E59f2EdE51d42C3e7'],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0x4FD51Cb87ffEFDF1711112b5Bd8aB682E54988eA', // wpt
        ADDRESSES.ethereum.USDT,
        '0x235C8EE913d93c68D2902a8e0b5a643755705726', // bag
        ADDRESSES.ethereum.WETH,
        '0x9d7107c8E30617CAdc11f9692A19C82ae8bbA938', // roo
        '0x089729b0786C8803cff972c16e402f3344d079eA', // bgpt
      ],
      owners: ['0x64961Ffd0d84b2355eC2B5d35B0d8D8825A774dc'],
      ownTokens: ['0xdAd33e12e61dC2f2692F2c12e6303B5Ade7277Ba'],
    },
    polygon: {
      tokens: [
        nullAddress,
      ],
      owners: ['0x3f0DaF02b9cF0DBa7aeF41C1531450Fda01E8ae9'],
      ownTokens: [],
    },
  },

  // ----- from batch_a02.js -----
  'treasury/bullbit-ai': {
    base: {
      owners: ['0x58F7260aD7C9ea00be5DB87259D572470E8f9244', '0xc1dc6D5FD4980170BF871Cc0539C2cAf8035C7C4'],
      tokens: [ADDRESSES.base.USDC],
    },
  },
  'treasury/callput': {
    base: { owners: ['0xF9Ba07Ba4aD84D6Af640ebf28E2B98c135a207A3'] },
  },
  'treasury/camelot': {
    arbitrum: {
      owners: ['0x03ff2d78afb69e0859ec6beb4cf107d3741e97ab'],
      ownTokens: ['0x3d9907f9a368ad0a51be60f7da3b97cf940982d8'],
      tokens: ['0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60'],
    },
  },
  'treasury/cat-in-a-box': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0x98e6475C01D018Ae78c02ef48738f687538226Af'],
      ownTokens: ['0x7690202e2C2297bcD03664e31116d1dFfE7e3B73'],
      resolveUniV3: true,
    },
  },
  'treasury/chapool': {
    op_bnb: {
      tokens: [ADDRESSES.op_bnb.USDT],
      owners: ['0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13'],
    },
  },
  'treasury/cheapgm': {
    ethereum: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    base: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    optimism: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    arbitrum: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    polygon: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    bsc: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    scroll: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    mantle: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    linea: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    era: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    taiko: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    blast: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    mode: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    zora: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    metis: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    celo: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    conflux: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    ronin: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    lisk: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    berachain: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    core: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    bob: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    abstract: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    soneium: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    ink: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    unichain: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    plume_mainnet: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
    sonic: { owners: ['0x21AD6EF3979638D8E73747F22B92c4AAdE145d82'] },
  },
  'treasury/clone': {
    solana: {
      owners: ['GPJyF8fTgKKPykRW1XSrXiEXdJTJLHnhUqdDyyek66Z'],
      ownTokens: [],
    },
  },
  'treasury/comdex': {
    bsc: {
      owners: [
        '0x9057c3a25ff8e71bc05782a3d44a74fa7eb95688',
        '0x54ecbcb04da981f3a6896ad1b83c5ec47ee4d618',
        '0xf98f5908fa0b2b0cb32b79f2612446c7e3bffcad',
        '0x2f30fd7b18b8c69e85131e387d88919ae85f26c1',
      ],
      ownTokens: ['0xc5079966b3190909f69306fE7587ffE493dEdB5F'],
    },
  },
  'treasury/commonwealth': {
    base: {
      owners: [
        '0xdE70B8BC5215BdF03f839BB8cD0F639D4E3E2881',
        '0xA205fD6A798A9Ba8b107A00b8A6a5Af742d6aCb5',
        '0x990eCdf73704f9114Ee28710D171132b5Cfdc6f0',
        '0xa653879692D4D0e6b6E0847ceDd58eAD2F1CC136',
      ],
      ownTokens: ['0x99b2B1A2aDB02B38222ADcD057783D7e5D1FCC7D'],
    },
  },
  'treasury/compound': {
    ethereum: {
      tokens: [
        nullAddress,
        '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.UNI,
        ADDRESSES.ethereum.DAI,
      ],
      owners: ['0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', '0x2775b1c75658Be0F640272CCb8c72ac986009e38', '0x6d903f6003cca6255d85cca4d3b5e5146dc33925'],
      ownTokens: ['0xc00e94Cb662C3520282E6f5717214004A7f26888'],
    },
  },
  'treasury/cream-finance': {
    ethereum: {
      tokens: [
        nullAddress,
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        '0x49D72e3973900A195A155a46441F0C08179FdB64',
      ],
      owners: ['0x6D5a7597896A703Fe8c85775B23395a48f971305'],
      ownTokens: ['0x2ba592F78dB6436527729929AAf6c908497cB200'],
    },
  },
  'treasury/cronos-treasury-reserve': {
    cronos: {
      owners: ['0x96A6cd06338eFE754f200Aba9fF07788c16E5F20'],
      tokens: [
        '0x2e53c5586e12a99d4CAE366E9Fc5C14fE9c6495d',
        '0x9Fae23A2700FEeCd5b93e43fDBc03c76AA7C08A6',
        '0x7a7c9db510aB29A2FC362a4c34260BEcB5cE3446',
        ADDRESSES.cronos.USDC,
        '0x0d0b4a6FC6e7f5635C2FF38dE75AF2e96D6D6804',
      ],
      ownTokens: ['0xF3672F0cF2E45B28AC4a1D50FD8aC2eB555c21FC'],
    },
  },
  'treasury/cryptex': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0x9474b771fb46e538cfed114ca816a3e25bb346cf'],
    },
    ethereum: {
      tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.LINK],
      owners: ['0xa54074b2cc0e96a43048d4a68472F7F046aC0DA8', '0xa70b638B70154EdfCbb8DbbBd04900F328F32c35'],
      ownTokens: ['0x321C2fE4446C7c963dc41Dd58879AF648838f98D'],
    },
  },
  'treasury/cryptodickbutts': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        '0x6d3D490964205c8bC8DeD39e48e88E8Fde45b41f',
        '0x0000000000A39bb272e79075ade125fd351887Ac',
        ADDRESSES.ethereum.DAI,
      ],
      owners: ['0xf14d484b29a8ac040feb489afadb4b972422b4e9'],
      ownTokens: ['0x22BDc8Ad19aE84d9327E81FAD4F5973b91fbaA60'],
    },
  },
  'treasury/cryptonopix': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.WBNB,
      ],
      owners: [
        '0x7f01f344b1950a3C5EA3B9dB7017f93aB0c8f88E',
        '0x31EE4A9Ed7eF0CF0dcdF881eDc9c82C661a40b80',
        '0x90084B88c772ED1bA5dafa71430628fC6aE004ff',
        '0xbc15aaa0B1C37ebb7B506ADe0BFA35F16E67f534',
        '0xf7efE91bB756D7754aE8936e1F6041848f848AD3',
        '0x36E4c71917245746C45bF7A031166489986A75A8',
        '0x02f81Ca4CAb8fB64C82A6F1bC5E3EB32C62AFcA3',
        '0x7FA0a7cAF42B3CB5c3f7e4B73eBb3c797b10e4A5',
        '0xF952A11EB1456316e907f0B47b0dccd66c28B8B3',
        '0x317ba109B74F272253cF8f36c24331FBC5619f59',
        '0x36f15b07ebe31e05c4fcEb562bf973663EEB6Bf5',
        '0x6E653a3f76eCE9C3b1849b2159fDdf3bB20f0DF4',
        '0x16F1b9B34F2596c5538E0ad1B10C85D4B2820b82',
      ],
      ownTokens: ['0xBe96fcF736AD906b1821Ef74A0e4e346C74e6221'],
    },
  },
  'treasury/csrfi': {
    canto: {
      tokens: [nullAddress],
      owners: ['0x8dD3547A42e7FE5aE30B8dC42C570ebE6838dFA2'],
    },
  },
  'treasury/cthulhufinance': {
    optimism: {
      tokens: [nullAddress],
      owners: ['0x371405Aea16D5916703C74580247196BA9EA531F'],
      ownTokens: ['0xF8e943f646816e4B51279B8934753821ED832Dca'],
    },
  },
  'treasury/cubo': {
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.DAI,
        '0xf28164a485b0b2c90639e47b0f377b4a438a16b1',
        '0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f',
        '0xAA7C2879DaF8034722A0977f13c343aF0883E92e',
      ],
      owners: ['0xb495ffc5acd7e2fd909c23c30d182e6719fbe9ec'],
      ownTokens: ['0x381d168DE3991c7413d46e3459b48A5221E3dfE4'],
    },
  },
  'treasury/curve': {
    ethereum: {
      owners: ['0x6508ef65b0bd57eabd0f1d52685a70433b2d290b', '0xe3997288987e6297ad550a69b31439504f513267'],
      ownTokens: [ADDRESSES.ethereum.CRV],
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.CRVUSD,
      ],
    },
  },
  'treasury/cvi': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0x7f4b135782c4a3b1c78c93f23f2016cb5cd96cc8'],
    },
  },
  'treasury/d8x': {
    polygon_zkevm: {
      owners: ['0x097A5e756568420Ae638d66377f120F16D12cCb4'],
      ownTokens: ['0xDc28023CCdfbE553643c41A335a4F555Edf937Df'],
    },
  },
  'treasury/defimarketplus': {
    arbitrum: {
      tokens: [
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WBTC,
      ],
      owners: ['0x68d60e869a77ae1ceB546c07F3351e7D899b0Ce3'],
    },
  },
  'treasury/defi-united': {
    ethereum: {
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.DAI,
      ],
      owners: ['0x0fCa5194baA59a362a835031d9C4A25970effE68'],
    },
  },
  'treasury/defiway': {
    ethereum: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    bsc: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    polygon: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    arbitrum: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    base: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    avax: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    optimism: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    cronos: { owners: ['0xa0bB1ebf52A9307F30509d3b385754c33B7F2E26'] },
    tron: { owners: ['TJHEossM1q87JWEFYRrEfjDju6uEoZY22N'] },
  },
  'treasury/deri-protocol': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0x20a5c32ee19bcdb2635455859e64ba5a1d1acab2'],
    },
  },
  'treasury/dex': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.USDC,
      ],
      owners: ['0xa5f3d6a33c5a5bcdff8f81c88ca00f457b699e0f'],
      ownTokens: [
        '0xf4914e6d97a75f014acfcf4072f11be5cffc4ca6',
        '0x147e07976e1ae78287c33aafaab87760d32e50a5',
        '0x79f3bb5534b8f060b37b3e5dea032a39412f6b10',
        '0x6647047433df4cfc9912d092fd155b9d972a4a85',
        '0x01b279a06f5f26bd3f469a3e730097184973fc8a',
      ],
    },
  },
  'treasury/dexfinance': {
    arbitrum: {
      owners: ['0x776e9df67667cb568f0e7951f74347fd985d615b', '0xacB39b9Bf0462203b4Ca0CB74eC1AffB1b17c3b6'],
      tokens: [
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WETH,
        '0x92a212d9f5eef0b262ac7d84aea64a0d0758b94f',
        '0x4117ec0a779448872d3820f37ba2060ae0b7c34b',
        '0x1b896893dfc86bb67cf57767298b9073d2c1ba2c',
        '0x6985884c4392d348587b19cb9eaaf157f13271cd',
        '0xd56734d7f9979dd94fae3d67c7e928234e71cd4c',
        '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8',
        '0x25d887ce7a35172c62febfd67a1856f20faebb00',
        ADDRESSES.arbitrum.LINK,
        ADDRESSES.arbitrum.GMX,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.WBTC,
      ],
    },
    avax: {
      owners: ['0x776e9df67667cb568f0e7951f74347fd985d615b'],
      tokens: [
        ADDRESSES.avax.USDT_e,
        ADDRESSES.avax.WETH_e,
      ],
    },
    optimism: {
      owners: ['0x776e9df67667cb568f0e7951f74347fd985d615b'],
      tokens: [
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH,
        ADDRESSES.optimism.USDC,
      ],
    },
    manta: {
      owners: ['0x776e9df67667cb568f0e7951f74347fd985d615b'],
      tokens: [
        ADDRESSES.manta.USDC,
        '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        '0x4c2a0f964a37a3ce305fe41c575beeb48c8c3fa2',
        '0x3af03e8c993900f0ea6b84217071e1d4cc783982',
        '0xe68874e57224d1e4e6d4c6b4cf5af7ca51867611',
        '0x6da9ebd271a0676f39c088a2b5fd849d5080c0af',
      ],
    },
    base: {
      owners: ['0x776e9df67667cb568f0e7951f74347fd985d615b', '0x38d52734d7f9da7b45cdba4c2ab116dfe0120327'],
      resolveLP: true,
      resolveUniV3: true,
      ownTokens: ['0x53cb59d32a8d08fc6d3f81454f150946a028a44d'],
      tokens: [
        ADDRESSES.base.USDC,
        '0x532f27101965dd16442e59d40670faf5ebb142e4',
        '0xece7b98bd817ee5b1f2f536daf34d0b6af8bb542',
        '0x5babfc2f240bc5de90eb7e19d789412db1dec402',
        '0x6921b130d297cc43754afba22e5eac0fbf8db75b',
        '0x7d9ce55d54ff3feddb611fc63ff63ec01f26d15f',
        '0xcde90558fc317c69580deeaf3efc509428df9080',
        '0xba0dda8762c24da9487f5fa026a9b64b695a07ea',
        '0xa3d1a8deb97b111454b294e2324efad13a9d8396',
        '0xb79dd08ea68a908a97220c76d19a6aa9cbde4376',
        '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
        '0x7f62ac1e974d65fab4a81821ca6af659a5f46298',
        '0x78b3c724a2f663d11373c4a1978689271895256f',
        ADDRESSES.base.wstETH,
        '0x373504da48418c67e6fcd071f33cb0b3b47613c7',
      ],
    },
  },

  // ----- from batch_a03.js -----
  'treasury/dexhunter': {
    cardano: {
      tokens: [nullAddress],
      owners: ['addr1qx9sltr8w7y3hyjav340zunarmegsvu009ny2k5neccal0p3yzmswj59yx7vn630qh3ce7yjflahhjr3a0a2xkhf30eq3rd5k5'],
    },
  },
  'treasury/dforce': {
    arbitrum: {
      owners: ['0xc097ea3ea6d6851e8c274ace6373107c5a253f62'],
      ownTokens: [],
      tokens: [nullAddress],
    },
  },
  'treasury/dfyn': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        '0x8971dFb268B961a9270632f28B24F2f637c94244',
      ],
      owners: ['0x5C35D4BcF0827a22370915E75c387EC470338c10'],
    },
  },
  'treasury/dodo': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
      ],
      owners: ['0xAB21016BD4127638b8c555e36636449b33dF1C38'],
      ownTokens: ['0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDT,
      ],
      owners: ['0x01d3e7271c278aa3aa56eeba6a109b2c200679fa'],
      ownTokens: ['0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581'],
    },
  },
  'treasury/dopex': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.LUSD,
      ],
      owners: ['0xb8689b7910954BF73431f63482D7dd155537ea7E'],
      ownTokens: ['0xEec2bE5c91ae7f8a338e1e5f3b5DE49d07AfdC81', '0x0ff5A8451A839f5F0BB3562689D9A44089738D11'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.ARB,
      ],
      owners: ['0x2fa6F21eCfE274f594F470c376f5BDd061E08a37'],
      ownTokens: ['0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55', '0x32Eb7902D4134bf98A28b963D26de779AF92A212'],
    },
  },
  'treasury/drefinance': {
    sonic: {
      tokens: [
        nullAddress,
        '0xd4eee4c318794bA6FFA7816A850a166FFf8310a9',
        '0xF8232259D4F92E44eF84F18A0B9877F4060B26F1',
        '0xB781C624397C423Cb62bAe9996cEbedC6734B76b',
        '0x18b6963ebe82b87c338032649aaad4eec43d3ecb',
        ADDRESSES.sonic.USDC_e,
      ],
      owners: ['0x0E43DF9F40Cc6eEd3eC70ea41D6F34329fE75986'],
      ownTokens: ['0xd4eee4c318794bA6FFA7816A850a166FFf8310a9', '0xF8232259D4F92E44eF84F18A0B9877F4060B26F1'],
      resolveLP: true,
    },
  },
  'treasury/dumpfun-gamified-launcher': {
    solana: {
      owners: ['jAvSW1LeQGauZ3rRkR8ysaH4ag3yAheX7vGGTb926vy'],
    },
  },
  'treasury/dxdao': {
    ethereum: {
      tokens: [
        nullAddress,
        '0x6cAcDB97e3fC8136805a9E7c342d866ab77D0957',
        ADDRESSES.ethereum.DAI,
        '0xFe2e637202056d30016725477c5da089Ab0A043A',
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.LUSD,
        ADDRESSES.ethereum.STETH,
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
        ADDRESSES.ethereum.RETH,
        '0x20BC832ca081b91433ff6c17f85701B6e92486c5',
        '0xEd91879919B71bB6905f23af0A68d231EcF87b14',
        '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d',
        '0xF5581dFeFD8Fb0e4aeC526bE659CFaB1f8c781dA',
        ADDRESSES.ethereum.WETH,
      ],
      owners: ['0x519b70055af55a007110b4ff99b0ea33071c720a'],
      ownTokens: ['0xa1d65e8fb6e87b60feccbc582f7f97804b725521'],
    },
  },
  'treasury/dydx': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
      ],
      owners: ['0xE710CEd57456D3A16152c32835B5FB4E72D9eA5b'],
      ownTokens: ['0x92d6c1e31e14520e676a687f0a93788b716beff5'],
    },
  },
  'treasury/ease-org': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDC,
        '0x7CA51456b20697A0E5Be65e5AEb65dfE90f21150',
        '0x43632E3448cd47440fEE797258081414D91A58cE',
      ],
      owners: ['0x1f28ed9d4792a567dad779235c2b766ab84d8e33'],
      ownTokens: ['0xEa5eDef1287AfDF9Eb8A46f9773AbFc10820c61c'],
    },
  },
  'treasury/ebisusbay': {
    cronos: {
      owners: ['0x289A94c5cf403691aca3d222E30335a4957b3ae6'],
      ownTokens: ['0xaF02D78F39C0002D14b95A3bE272DA02379AfF21'],
      tokens: [nullAddress],
    },
  },
  'treasury/edgeX': {
    ethereum: {
      owners: ['0x74B97d2097D64b4D2A3317d4Bda2dAb88B80e7ab', '0xd22faE190736eFFc8ceB3d8845a5D33ae7805392'],
      tokens: [nullAddress, '0x23878914efe38d27c4d67ab83ed1b93a74d4086a'],
    },
  },
  'treasury/elements-fi': {
    arbitrum: {
      owners: ['0x978982772b8e4055b921bf9295c0d74eb36bc54e'],
      ownTokens: ['0x30123A6D38eb4a34B701627211EDE0BFF04Cd618'],
      tokens: [nullAddress],
    },
  },
  'treasury/empyreal': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.USDC,
      ],
      owners: ['0xF548a58DB6d86d466acd00Fc0F6De3b39Ea129D7'],
      ownTokens: ['0x0DDCE00654f968DeD59A444da809F2B234047aB1'],
    },
  },
  'treasury/ens': {
    ethereum: {
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.sUSDS,
        ADDRESSES.ethereum.LINK,
      ],
      resolveUniV3: true,
      resolveStakewiseDeposits: true,
      ownTokens: ['0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
      owners: [
        '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
        '0xd7a029db2585553978190db5e85ec724aa4df23f',
        '0x690f0581ececcf8389c223170778cd9d029606f2',
        '0xcD42b4c4D102cc22864e3A1341Bb0529c17fD87d',
        '0x91c32893216dE3eA0a55ABb9851f581d4503d39b',
        '0xB162Bf7A7fD64eF32b787719335d06B2780e31D1',
        '0x536013c57DAF01D78e8a70cAd1B1abAda9411819',
        '0x9B9c249Be04dd433c7e8FbBF5E61E6741b89966D',
        '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5',
        '0x253553366Da8546fC250F225fe3d25d0C782303b',
        '0x4F2083f5fBede34C2714aFfb3105539775f7FE64',
      ],
    },
  },
  'treasury/equilibre': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0x8B21Bdb9B1aa2094460851dA19185A989529fBe3'],
    },
    kava: {
      tokens: [
        nullAddress,
        '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
        ADDRESSES.kava.WKAVA,
        '0x765277eebeca2e31912c9946eae1021199b39c61',
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
        '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
        '0xC19281F22A075E0F10351cd5D6Ea9f0AC63d4327',
        '0x6c2c113c8cA73dB67224EF4D8C8dFCeC61e52a9C',
        '0xb84Df10966a5D7e1ab46D9276F55d57bD336AFC7',
        ADDRESSES.kava.USX,
        '0x739ca6D71365a08f584c8FC4e1029045Fa8ABC4B',
        '0xd86C8d4279CCaFbec840c782BcC50D201f277419',
        '0x165DBb08de0476271714952C3C1F068693bd60D7',
        '0x74ccbe53f77b08632ce0cb91d3a545bf6b8e0979',
        '0x9d9682577CA889c882412056669bd936894663fd',
        '0xABd380327Fe66724FFDa91A87c772FB8D00bE488',
        ADDRESSES.kava.axlUSDC,
        '0xE1E9dB9b4d51A8878f030094F7965edC5eEC7802',
        '0x7ae97042a4a0eb4d1eb370c34bfec71042a056b7',
        '0x06beE9E7238a331B68D83Df3B5B9B16d5DBa83ff',
        '0x5E237e61469d1A5b85fA8fba63EB4D4498Ea8dEF',
        '0xEffaE8eB4cA7db99e954adc060B736Db78928467',
        '0x489e54EEc6C228A1457975Eb150A7EFb8350b5bE',
        '0x443ab8d6ab303ce28f9031be91c19c6b92e59c8a',
        '0x8549724fcC84ee9ee6c7A676F1Ba2Cc2f43AAF5B',
        '0x53a5dD07127739e5038cE81eff24ec503A6CC479',
        '0xC09c73F7B32573d178138E76C0e286BA21085c20',
        '0x0Fb3E4E84FB78C93E466a2117Be7bc8BC063E430',
        '0x990e157fC8a492c28F5B50022F000183131b9026',
        '0x471F79616569343e8e84a66F342B7B433b958154',
        '0x38481Fdc1aF61E6E72E0Ff46F069315A59779C65',
        '0x13db70Ad2f2b7064EbD5B0CAA13Af445a77360f7',
        '0xFa4384b298084A0ef13F378853DEDbB33A857B31',
        '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
        '0xde5ed76e7c05ec5e4572cfc88d1acea165109e44',
        '0xD22a58f79e9481D1a88e00c343885A588b34b68B',
        '0xde1e704dae0b4051e80dabb26ab6ad6c12262da0',
      ],
      owners: [
        '0x3a724E0082b0E833670cF762Ea6bd711bcBdFf37',
        '0x79dE631fFb7291Acdb50d2717AE32D44D5D00732',
        '0x283270C265eB3D6e910920AdFf85e746C8063fed',
        '0x4722FE058da1D359c1428C8F9B8F5b4531b58D17',
        '0xAb7778933fb44514c864b2610b5d7E2A0bD91DDF',
        '0x498Dd5A79ab7e19Be1dA81738239214F807E3462',
        '0x78B3Ec25D285F7a9EcA8Da8eb6b20Be4d5D70E84',
        '0xfcb3E3797A77946891c88A841d35d47c8F22CF53',
        '0xd5524479C013d19e440872175400F396f35645fF',
        '0x3ca2c227D47DF650ffcD39b64527e7c6e2E91DD1',
        '0xc9C384a9E7e28f7Ef55903eb90947fe3ce71D475',
        '0xA43Dd020E147F3A9C5cCe6860Cc4f51Ff71B56dc',
        '0xb5B0c913acF48Bfb7bcB95e2F4fA241693dea513',
        '0x4396c6e2a70c6b3c7b8a1f9e4043632e1c93d430',
        '0xF9Ec0C05288d6726e1B3a7ccfcaEAc7b134d5F50',
      ],
      ownTokenOwners: [
        '0x3a724E0082b0E833670cF762Ea6bd711bcBdFf37',
        '0x79dE631fFb7291Acdb50d2717AE32D44D5D00732',
        '0x283270C265eB3D6e910920AdFf85e746C8063fed',
        '0x4722FE058da1D359c1428C8F9B8F5b4531b58D17',
        '0xAb7778933fb44514c864b2610b5d7E2A0bD91DDF',
        '0x498Dd5A79ab7e19Be1dA81738239214F807E3462',
        '0x78B3Ec25D285F7a9EcA8Da8eb6b20Be4d5D70E84',
        '0xfcb3E3797A77946891c88A841d35d47c8F22CF53',
        '0xd5524479C013d19e440872175400F396f35645fF',
        '0x3ca2c227D47DF650ffcD39b64527e7c6e2E91DD1',
        '0xc9C384a9E7e28f7Ef55903eb90947fe3ce71D475',
        '0xA43Dd020E147F3A9C5cCe6860Cc4f51Ff71B56dc',
        '0xb5B0c913acF48Bfb7bcB95e2F4fA241693dea513',
        '0x4396c6e2a70c6b3c7b8a1f9e4043632e1c93d430',
        '0xF9Ec0C05288d6726e1B3a7ccfcaEAc7b134d5F50',
      ],
      ownTokens: ['0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73'],
    },
  },
  'treasury/ether': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.OP,
      ],
      owners: ['0x8ba1f109551bD432803012645Ac136ddd64DBA72'],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.TUSD,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
      ],
      owners: ['0x8ba1f109551bD432803012645Ac136ddd64DBA72'],
    },
  },
  'treasury/eth-foundation': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
        ADDRESSES.ethereum.BNB,
        ADDRESSES.ethereum.WETH,
      ],
      owners: ['0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', '0x9fC3dc011b461664c835F2527fffb1169b3C213e'],
    },
  },
  'treasury/ethglobal': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.OP,
      ],
      owners: ['0x336DEe4022d6CC2F95cfe9e0949B9E0EDDAC457D'],
      ownTokens: [],
    },
  },
  'treasury/ethichub': {
    ethereum: {
      owners: ['0xb97Ef216006d72128576D662CFFEd2B4406E3518', '0xb27132625173F813085E438eE19c011867063073'],
      ownTokens: ['0xFd09911130e6930Bf87F2B0554c44F400bD80D3e'],
    },
    celo: {
      owners: ['0xA14B1D7E28C4F9518eb7757ddeE35a18423e1567', '0xa9a824bD0470d0d00938105986ebfbFa71b28530'],
      ownTokens: [ADDRESSES.celo.ETHIX],
    },
  },
  'treasury/euler': {
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
      ],
      owners: ['0xcAD001c30E96765aC90307669d578219D4fb1DCe', '0xC7C5aFDB61e08BE3e2FB09098412b5706EB5c550'],
      ownTokens: ['0xd9Fcd98c322942075A5C3860693e9f4f03AAE07b'],
    },
  },
  'treasury/evedex': {
    eventum: {
      tokens: [ADDRESSES.eventum.USDT],
      owners: ['0x77075c627e51145d54e4EDD54Afa169DA7ff8A17'],
    },
    arbitrum: {
      tokens: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE],
      owners: ['0x16a4f9904e222D298Ac71aA3E3Bd5C19B902C595'],
    },
  },
  'treasury/evmos-dao': {
    evmos: {
      tokens: [
        nullAddress,
        ADDRESSES.evmos.WEVMOS,
        ADDRESSES.evmos.STEVMOS,
        ADDRESSES.evmos.STRIDE,
        ADDRESSES.evmos.AXL_USDC,
      ],
      owners: [
        '0x93354845030274cd4bf1686abd60ab28ec52e1a7',
        '0xc3c5156911bf53f12913b68e0532096536b30600',
        '0x4c3c271ca2e841c0051c0402021ddaef3ce666d0',
        '0x2A72df162bD5B9Ba4cBB4F28bCE590c20db7aEC1',
      ],
    },
  },
  'treasury/extrafi': {
    optimism: {
      owners: ['0xc918a60e4d40d15959a85fa8b35f6db96907babf'],
      ownTokens: [],
      tokens: [],
    },
    base: {
      owners: ['0xc918a60e4d40d15959a85fa8b35f6db96907babf'],
      ownTokens: [],
      tokens: [],
    },
  },
  'treasury/factor-dao': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0x0c415efd785b8308e42c75532d1231a6281ebee2'],
      ownTokens: ['0x6dd963c510c2d2f09d5eddb48ede45fed063eb36'],
    },
  },
  'treasury/fei-protocol': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0x8d5ed43dca8c2f7dfb20cf7b53cc7e593635d7b9'],
      ownTokens: ['0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B'],
    },
  },
  'treasury/femboy-dao': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0xf78A448E464a1fEB693D76c9211D2d03ae488206'],
    },
  },
  'treasury/fjord-foundry': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
      ],
      owners: ['0xcA518c4DB97ECCe85cC82DE3C2B93D8f8b536ca5'],
    },
  },
  'treasury/flair-dex': {
    avax: {
      tokens: [
        nullAddress,
        ADDRESSES.avax.USDt,
        ADDRESSES.avax.USDT_e,
        ADDRESSES.avax.WAVAX,
        ADDRESSES.avax.USDC,
        ADDRESSES.avax.USDC_e,
        ADDRESSES.polygon.BUSD,
        '0x1C1CDF8928824dac36d84B3486D598B9799bA6c0',
        '0x107D2b7C619202D994a4d044c762Dd6F8e0c5326',
      ],
      owners: ['0xAD276dA5aAad4181B991fd93Bc7dCCFb46811003'],
      ownTokens: ['0x107D2b7C619202D994a4d044c762Dd6F8e0c5326'],
    },
  },

  // ----- from batch_a04.js -----
  'treasury/flokifi-locker': {
    ethereum: {
      tokens: [
        nullAddress,
        "0xca7c2771D248dCBe09EABE0CE57A62e18dA178c0",
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        "0x1BD708E01E96d426652b0D50b8c896eaeefee36d",
      ],
      owners: ["0x2b9d5c7f2EAD1A221d771Fb6bb5E35Df04D60AB0", "0xea9a5a3Ac7545E1Ddce79fC5803Df0f317A3D0f6"],
      ownTokens: ["0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E", '0x4507cef57c46789ef8d1a19ea45f4216bae2b528'],
    },
    bsc: {
      tokens: [
        nullAddress,
      ],
      owners: ["0x17e98a24f992BB7bcd62d6722d714A3C74814B94"],
      ownTokens: ["0xfb5B838b6cfEEdC2873aB27866079AC55363D37E", '0x4507cef57c46789ef8d1a19ea45f4216bae2b528'],
    },
  },
  'treasury/foom': {
    ethereum: {
      owners: ['0xffefa70b6deaab975ef15a6474ce9c4214d82b02'],
      ownTokens: ['0xd0d56273290d339aaf1417d9bfa1bb8cfe8a0933'],
    },
  },
  'treasury/forest-protocol': {
    ethereum: {
      tokens: [
        nullAddress,
      ],
      owners: ["0xb785a37De028BDA5379F8D3f8045484F2e582c54"],
      ownTokens: ["0x8D33F0Ae6d111212D9d64B0821c7Cf09E6270C27"],
    },
    bsc: {
      tokens: [
        nullAddress,
      ],
      owners: ["0xb785a37De028BDA5379F8D3f8045484F2e582c54"],
      ownTokens: ["0x11cf6bF6D87CB0EB9c294fd6CBFEC91EE3a1A7D0"],
    },
  },
  'treasury/forth-dao': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        '0xBcca60bB61934080951369a648Fb03DF4F96263C',
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
        '0xd46ba6d942050d489dbd938a2c909a5d5039a161',
      ],
      owners: ["0x223592a191ecfc7fdc38a9256c3bd96e771539a9", "0x77fba179c79de5b7653f68b5039af940ada60ce0"],
      ownTokens: ["0x77FbA179C79De5B7653F68b5039Af940AdA60ce0", "0xD46bA6D942050d489DBd938a2C909A5d5039A161", "0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c"],
      blacklistedTokens: ['0xf211b655431c10e72c1caeae37688ae9f7f7a549'],
    },
  },
  'treasury/frax': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.SAFE,
      ],
      owners: [
        "0x9AA7Db8E488eE3ffCC9CdFD4f2EaECC8ABeDCB48",
        '0x63278bF9AcdFC9fA65CFa2940b89A34ADfbCb4A1',
        '0x8D4392F55bC76A046E443eb3bab99887F4366BB0',
        '0xa95f86fE0409030136D6b82491822B3D70F890b3',
        '0x9AA7Db8E488eE3ffCC9CdFD4f2EaECC8ABeDCB48',
        '0x874a873e4891fB760EdFDae0D26cA2c00922C404',
      ],
      ownTokens: ["0xc2544A32872A91F4A553b404C6950e89De901fdb", ADDRESSES.ethereum.FXS, ADDRESSES.ethereum.FRAX],
    },
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: [
        "0xe61d9ed1e5dc261d1e90a99304fadcef2c76fd10",
      ],
    },
  },
  'treasury/friendswithbenefits': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        '0xBcca60bB61934080951369a648Fb03DF4F96263C',
        '0x9355372396e3F6daF13359B7b607a3374cc638e0',
      ],
      owners: ["0x33e626727B9Ecf64E09f600A1E0f5adDe266a0DF", "0x660F6D6c9BCD08b86B50e8e53B537F2B40f243Bd"],
      ownTokens: ["0x35bD01FC9d6D5D81CA9E055Db88Dc49aa2c699A8"],
    },
  },
  'treasury/friendtech33': {
    base: {
      owners: ["0x68d91Bb4b1760Bc131555D23a438585D937A8e6d"],
      ownTokens: ['0x3347453Ced85bd288D783d85cDEC9b01Ab90f9D8'],
      resolveLP: true,
    },
  },
  'treasury/furucombo': {
    ethereum: {
      owners: ["0x6304EB1B1eC2135a64a90bA901B12Cf769657579"],
      ownTokens: ["0xfFffFffF2ba8F66D4e51811C5190992176930278"],
    },
    polygon: {
      owners: ["0x3EBe4dfaF95cd320BF34633B3BDf773FbE732E63"],
      ownTokens: ["0x6DdB31002abC64e1479Fc439692F7eA061e78165"],
      blacklistedTokens: [
        "0x7A5011BF1dAd77a23EC35CE04dCc2AC7d29963c5",
      ],
    },
    arbitrum: {
      owners: ["0x3EBe4dfaF95cd320BF34633B3BDf773FbE732E63"],
      ownTokens: ["0x94c8f7f04dEA7740fd895a254816F897Df61991e"],
    },
    optimism: {
      owners: ["0x168608B226ef4E59Db5E61359509656a51BAe090"],
    },
    avax: {
      owners: ["0x168608B226ef4E59Db5E61359509656a51BAe090"],
    },
    metis: {
      owners: ["0x75Ce960F2FD5f06C83EE034992362e593dcf7722"],
    },
    fantom: {
      owners: ["0x75Ce960F2FD5f06C83EE034992362e593dcf7722"],
    },
    base: {
      owners: ["0x50Df7c73bA1B4bb74934E50298de73F265260Ea4"],
    },
    xdai: {
      owners: ["0x4207b828b673EDC01d7f0020E8e8A99D8b454136"],
    },
  },
  'treasury/futarchy-amm': {
    solana: {
      owners: [
        'BxgkvRwqzYFWuDbRjfTYfgTtb41NaFw1aQ3129F79eBT',
      ],
      ownTokens: [],
    },
  },
  'treasury/futureswap': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ["0xdb08917e0ae9075c6577b6a11d0bb78dfbc381e4"],
    },
  },
  'treasury/fwx': {
    avax: {
      owners: ['0xB0fa4C4D58E26BED39e2C08DcFD96f5743aA6062'],
      ownTokens: [],
    },
  },
  'treasury/gains': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.DAI,
        "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418",
      ],
      owners: ["0xf8e93a7d954f7d31d5fa54bc0eb0e384412a158d", "0x80fd0accC8Da81b0852d2Dca17b5DDab68f22253", "0xc07eed650ab255190ca9766162cfb47cfdf72f3a"],
      ownTokens: ["0x18c11FD286C5EC11c3b683Caa813B77f5163A122"],
      resolveUniV3: true,
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.USDT,
      ],
      owners: ["0x80fd0accC8Da81b0852d2Dca17b5DDab68f22253", "0xc07eed650ab255190ca9766162cfb47cfdf72f3a"],
      ownTokens: ["0xE5417Af564e4bFDA1c483642db72007871397896"],
      resolveUniV3: true,
    },
    base: {
      tokens: [
        nullAddress,
        ADDRESSES.base.USDC,
      ],
      owners: ["0xc07eed650ab255190ca9766162cfb47cfdf72f3a"],
      ownTokens: ["0xfb1aaba03c31ea98a3eec7591808acb1947ee7ac"],
      resolveUniV3: true,
    },
  },
  'treasury/galxe': {
    arbitrum: {
      owners: ["0x28fda5fb2ac9436bc4bb8bedafee25a550956de6"],
      ownTokens: [],
      tokens: [],
    },
  },
  'treasury/gambitzone': {
    arbitrum: {
      tokens: [ADDRESSES.arbitrum.USDC, ADDRESSES.null],
      owners: [
        "0xDA1f681eEC73bC4a7CB6C90696F0744D46C282d6",
        "0x5Fd54D6835D32AdFAd96339051Fc8CD2E441a65D",
        "0xdF582Ae88f1Abd0AdF6D48988A87ceD1594f4791",
      ],
    },
  },
  'treasury/gammaswap': {
    ethereum: {
      owners: ['0x73c510b2A44B51a01A13A3539c38EB330FB9713D'],
      blacklistedTokens: ['0x64d3CAe387405d91f7b0D91fb1D824A281719500'],
    },
    arbitrum: {
      owners: ['0x34B5870C0431158e11c68B770127FBd2cE953f7a', '0xa075f1B6f50a1a02Ba22c3B43D72917a326b16c0'],
      ownTokens: ['0xb08d8becab1bf76a9ce3d2d5fa946f65ec1d3e83'],
    },
    base: {
      owners: ['0xaeAAc90117fb85a7DC961522DdFe96ABB358445B'],
      ownTokens: ['0xc4d44c155f95FD4E94600d191a4a01bb571dF7DF'],
    },
  },
  'treasury/gardens': {
    celo: {
      owners: ['0x9a17De1f0caD0c592F656410997E4B685d339029', '0xd7a3D3A7dd35b8e81FC0b83C032D0ED3261417D9'],
      ownTokens: [],
      tokens: [
        nullAddress,
        ADDRESSES.celo.CELO,
        '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
        ADDRESSES.celo.cUSD,
        ADDRESSES.celo.USDGLO,
      ],
      fetchCoValentTokens: false,
    },
    base: {
      owners: ['0x1B8C7f06F537711A7CAf6770051A43B4F3E69A7e'],
      ownTokens: [],
      tokens: [
        nullAddress,
        ADDRESSES.base.USDC,
      ],
      fetchCoValentTokens: false,
    },
    polygon: {
      owners: [
        '0x1B8C7f06F537711A7CAf6770051A43B4F3E69A7e',
      ],
      ownTokens: [],
      tokens: [
        nullAddress,
        '0xc7B1807822160a8C5b6c9EaF5C584aAD0972deeC',
        ADDRESSES.polygon.DAI,
      ],
      fetchCoValentTokens: false,
    },
    xdai: {
      owners: ['0x1B8C7f06F537711A7CAf6770051A43B4F3E69A7e'],
      ownTokens: [],
      tokens: [
        nullAddress,
        '0xc7B1807822160a8C5b6c9EaF5C584aAD0972deeC',
        '0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9',
        ADDRESSES.xdai.GNO,
        ADDRESSES.xdai.WXDAI,
      ],
      fetchCoValentTokens: false,
    },
  },
  'treasury/gearbox': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.CRVUSD,
      ],
      owners: ["0x7b065Fcb0760dF0CEA8CFd144e08554F3CeA73D1", "0x3E965117A51186e41c2BB58b729A1e518A715e5F", "0x564bc596affd8eb9c5065bc37835d801f3830c9e"],
      ownTokens: ["0xBa3335588D9403515223F109EdC4eB7269a9Ab5D"],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
      ],
      owners: ["0x2c31eFFE426765E68A43163A96DD13DF70B53C14"],
      ownTokens: ["0x2F26337576127efabEEc1f62BE79dB1bcA9148A4"],
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.WETH,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.USDC_CIRCLE,
      ],
      owners: ["0x1ACc5BC353f23B901801f3Ba48e1E51a14263808"],
      ownTokens: ["0x39E6C2E1757ae4354087266E2C3EA9aC4257C1eb"],
    },
  },
  'treasury/genesis-dao': {
    ethereum: {
      owners: ['0x31b6a4dca90fabf29879143ca5bb2c10e8a11e4c'],
      ownTokens: ['0x99999999999997fceB5549c58aB66dF52385ca4d'],
    },
  },
  'treasury/geth': {
    optimism: {
      tokens: [
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH,
      ],
      owners: ["0x21539334f45Ac41Bd10789942b744a18a4775d6d"],
    },
  },
  'treasury/gmx': {
    ethereum: {
      tokens: [nullAddress],
      owners: gmxOwners,
    },
    arbitrum: {
      tokens: [nullAddress],
      owners:gmxOwners,
      ownTokens: [ADDRESSES.arbitrum.GMX], // GMX
    },
    avax: {
      tokens: [nullAddress],
      owners: gmxOwners,
      ownTokens: ['0x62edc0692BD897D2295872a9FFCac5425011c661'], // GMX
    },
  },
  'treasury/gitcoin': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
        '0xE54f9E6Ab80ebc28515aF8b8233c1aeE6506a15E',
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.UNI,
        "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3",
        "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
      ],
      owners: ["0x57a8865cfB1eCEf7253c27da6B4BC3dAEE5Be518", "0x44Aa9c5a034C1499Ec27906E2D427b704b567ffe", "0xde21f729137c5af1b01d73af1dc21effa2b8a0d6"],
      ownTokens: ["0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F"],
    },
  },
  'treasury/giveth': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.DAI,
        ADDRESSES.optimism.USDT,
        ADDRESSES.optimism.WETH,
      ],
      owners: ["0x4D9339dd97db55e3B9bCBE65dE39fF9c04d1C2cd"],
      ownTokens: [],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WETH,
        "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84",
        "0x1d462414fe14cf489c7A21CaC78509f4bF8CD7c0",
        "0xa117000000f279D81A1D3cc75430fAA017FA5A2e",
        "0x19062190B1925b5b6689D7073fDfC8c2976EF8Cb",
        "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
        "0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198",
        "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F",
        ADDRESSES.ethereum.YFI,
        ADDRESSES.ethereum.MATIC,
        "0xDd1Ad9A21Ce722C151A836373baBe42c868cE9a4",
      ],
      owners: ["0x4D9339dd97db55e3B9bCBE65dE39fF9c04d1C2cd"],
      ownTokens: ["0x900dB999074d9277c5DA2A43F252D74366230DA0"],
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.WETH,
        ADDRESSES.polygon.WMATIC,
        "0x18e73A5333984549484348A94f4D219f4faB7b81",
        "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
        "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
        "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
      ],
      owners: ["0x4D9339dd97db55e3B9bCBE65dE39fF9c04d1C2cd"],
      ownTokens: [],
    },
    xdai: {
      tokens: [
        nullAddress,
        "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
        ADDRESSES.xdai.USDC,
        "0x21a42669643f45Bc0e086b8Fc2ed70c23D67509d",
        "0x83FF60E2f93F8eDD0637Ef669C69D5Fb4f64cA8E",
        ADDRESSES.xdai.WETH,
        ADDRESSES.xdai.WXDAI,
        "0x177127622c4A00F3d409B75571e12cB3c8973d3c",
      ],
      owners: ["0x4D9339dd97db55e3B9bCBE65dE39fF9c04d1C2cd"],
      ownTokens: ["0x4f4F9b8D5B4d0Dc10506e5551B0513B61fD59e75"],
    },
  },
  'treasury/goat-protocol': {
    ethereum: {
      owners: ["0x27A0E8c357fCF2EfA69249461D16BDd2828090DC"],
      ownTokens: ["0x901e3059Bf118AbC74d917440F0C08FC78eC0Aa6"],
      resolveLP: true,
    },
    arbitrum: {
      owners: ["0x5BE13f90cD86a8bb0f0573B550f04b95927F5dc5"],
      ownTokens: ["0x8c6Bd546fB8B53fE371654a0E54D7a5bD484b319"],
      resolveLP: true,
    },
  },
  'treasury/goldilocks': {
    berachain: {
      tokens: [
        nullAddress,
        ADDRESSES.berachain.WBERA,
        ADDRESSES.berachain.HONEY,
        ADDRESSES.berachain.USDC,
        "0x69f1E971257419B1E9C405A553f252c64A29A30a",
        "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe",
        "0x18878Df23e2a36f81e820e4b47b4A40576D3159C",
        "0x08A38Caa631DE329FF2DAD1656CE789F31AF3142",
        "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        "0x7F0976b52F6c1ddcD4d6f639537C97DE22fa2b69",
        "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe",
        "0xFace73a169e2CA2934036C8Af9f464b5De9eF0ca",
        "0x078e5010752b01ccbc8868cf00cd73e8efe29fe5",
        "0x6Fd7f15a0d7babe0A1a752564a591e1Cb6117F80",
      ],
      owners: ["0x3B0efb9E4165C56d5b1E8849b38426E1B5615593", "0x6FD990680deB2e5DCcb2FFEfC3307Dd34138Ac7F", "0xf5960b86048893bD25766c16aB6Da1aC628D97EE"],
      ownTokens: ["0xb7E448E5677D212B8C8Da7D6312E8Afc49800466", "0xbf2E152f460090aCE91A456e3deE5ACf703f27aD"],
    },
  },
  'treasury/grabi': {
    arbitrum: {
      tokens: [],
      owners: ["0x7d9ff6cb1bc3491fed7bf279d8532cab594b29e8"],
      ownTokens: ['0x5fd71280b6385157b291b9962f22153fc9e79000'],
    },
  },
  'treasury/grape-dao': {
    solana: {
      owners: [
        '761tc1rUpTNBMK9rsWX6jajAdj8yQipeUL6BqENasuTJ',
        'B7bKkCv9wt2ps1ZSC5w3u2V98bKtH8JaersqAcBWb1kn',
        '6jEQpEnoSRPP8A2w6DWDQDpqrQTJvG4HinaugiBGtQKD',
        'HNT72fiRxX1QoqfWvKUd7a2vCeiJdPfcFdHfyqc7YwvL',
        'AWaMVkukciGYPEpJbnmSXPJzVxuuMFz1gWYBkznJ2qbq',
      ],
      ownTokens: [
        '9eYJBViDGBXcf61WQfUDdwxtKyVjjLxyKtEhKs35SPnU',
      ],
    },
  },

  // ----- from batch_a05.js -----
  'treasury/gt3': {
    polygon: { owners: ['0x50f24DA1d9417b95e462AAa2d0Ae2b433275ee2e'], },
  },
  'treasury/guacswap': {
    solana: {
      owners: [
        'FSKHkZutHAyjcYcqSanE9rLqvEyKrX91BcZmALSznYck',
      ],
      ownTokens: [
        'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR', // guac
      ]
    },
  },
  'treasury/guru-network': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0x777172D858dC1599914a1C4c6c9fC48c99a60990',//solid
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.FRAX,
      ],
      owners: ['0x167D87A906dA361A10061fe42bbe89451c2EE584'],
      ownTokens: [],
    },
  },
  'treasury/gyro': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.BUSD,//BUSD
        ADDRESSES.bsc.USDT,//BSC-USD
        '0x5ca063a7e2bebefeb2bdea42158f5b825f0f9ffb',
        '0xa5399084a5f06d308c4527517bbb781c4dce887c',
      ],
      owners: ['0x8b1522402fece066d83e0f6c97024248be3c8c01'],
      ownTokens: ['0x1b239abe619e74232c827fbe5e49a4c072bd869d'],
      resolveLP: true,
    },
  },
  'treasury/handlefi': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xac459b2b29401b5a4ea90de4320d0956cf86cdbd'],
    },
  },
  'treasury/hashflow': {
    arbitrum: {
      owners: ['0xDD125048F4A045582dA6c2768ca9D70F3259470C'],
    },
    ethereum: {
      owners: ['0xff830ce17D39BbD6a4fef9683308D793dF8E34fC'],
      ownTokens: ['0xb3999F658C0391d94A37f7FF328F3feC942BcADC']
    }
  },
  'treasury/hercules': {
    metis: {
      owners: ['0x5c24bA2eA12f94E9F3476eaBDf10373dC2913605'],
      ownTokens: [
        '0xbB1676046C36BCd2F6fD08d8f60672c7087d9aDF',
      ],
      tokens: []
    },
  },
  'treasury/hoodmint': {
    robinhood: {
      owners: ['0x7C008EfE8428b473852DCCb9FeBa918d559878C2'],
      tokens: [nullAddress]
    },
  },
  'treasury/hoodpump': {
    robinhood: {
      owners: ['0xdAD1d6a2AfF8f9285Fd9C552491538aEcb518888', '0x453D956057036bd9871D25B965795b883047481D'],
      tokens: [ADDRESSES.robinhood.WETH, nullAddress],
    },
  },
  'treasury/hop': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xeea8422a08258e73c139fc32a25e10410c14bd7a'],
      ownTokens: [],
    },
    ethereum: {
      tokens: [
      ],
      owners: ['0xeea8422a08258e73c139fc32a25e10410c14bd7a'],
      ownTokens: ['0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc'],
    },
  },
  'treasury/hyperblast': {
    blast: {
      tokens: [
        nullAddress,
        ADDRESSES.blast.USDB //usdb
      ],
      owners: ['0x2d741ac2647707297f38c48437b4f48e6c97c624'],
      ownTokens: ['0x9FE9991dAF6b9a5d79280F48cbb6827D46DE2EA4'],
    },
  },
  'treasury/idle-dao': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        "0x4da27a545c0c5B758a6BA100e3a049001de870f5", //stkAAVE
        ADDRESSES.ethereum.BNB,
        "0xc00e94Cb662C3520282E6f5717214004A7f26888",//comp
        ADDRESSES.ethereum.sUSD,
        "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",//RAI
        ADDRESSES.ethereum.SUSHI,
        ADDRESSES.ethereum.MATIC,
        ADDRESSES.ethereum.LIDO,
        "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",//alcx
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.LINK,
      ],
      owners: ['0xb0aA1f98523Ec15932dd5fAAC5d86e57115571C7', '0x107A369bc066c77FF061c7d2420618a6ce31B925', '0x69a62C24F16d4914a48919613e8eE330641Bcb94', '0xbecc659bfc6edca552fa1a67451cc6b38a0108e4', '0x076ff8e6402b02855ff82119b53e59bbdd67f0ee', '0xFb3bD022D5DAcF95eE28a6B07825D4Ff9C5b3814'],
      ownTokens: ['0x875773784af8135ea0ef43b5a374aad105c5d39e'],
    },
    polygon: {
      tokens: [
        nullAddress,
        "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",//dquick
        ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.WMATIC_2,//wmatic
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.USDC,
        "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",//QI
      ],
      owners: ['0x1d60E17723f8Ca1F76F09126242AcD37a278b514', '0x61A944Ca131Ab78B23c8449e0A2eF935981D5cF6'],
      ownTokens: ['0xc25351811983818c9fe6d8c580531819c8ade90f']
    }
  },
  'treasury/illuvium': {
    arbitrum: {
      tokens: [],
      owners: ['0xBA085e0a14801C8c7A919a90304E75CabB7E3917'],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.SUSHI,
        ADDRESSES.ethereum.SAFE,
      ],
      owners: ['0xBA085e0a14801C8c7A919a90304E75CabB7E3917'],
      ownTokens: ['0x767fe9edc9e0df98e07454847909b5e959d7ca0e'],
    }
  },
  'treasury/impermax': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xc28f68cd2df0fcc50f0058fb20abbc77bec8bdc6', '0x2157bfbb446744fc92bd95c3911eb58d0a9b01bd'],
    },
    base: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xc28f68cd2df0fcc50f0058fb20abbc77bec8bdc6', '0x2157bfbb446744fc92bd95c3911eb58d0a9b01bd'],
    },
    blast: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xc28f68cd2df0fcc50f0058fb20abbc77bec8bdc6', '0x2157bfbb446744fc92bd95c3911eb58d0a9b01bd'],
    },
  },
  'treasury/index-coop': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.SAFE,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',
        '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
        '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        ADDRESSES.ethereum.LUSD,
        ADDRESSES.ethereum.USDT,
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643'
      ],
      owners: ['0x9467cfADC9DE245010dF95Ec6a585A506A8ad5FC', '0x462a63d4405a6462b157341a78fd1babfd3f8065', '0xfafd604d1cc8b6b3b6cc859cf80fd902972371c1'],
      ownTokens: ['0x0954906da0Bf32d5479e25f46056d22f08464cab'],
    },
  },
  'treasury/india-covid-relief-fund': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//usdc
        ADDRESSES.ethereum.USDT,//usdt
        ADDRESSES.ethereum.MATIC,//matic
        ADDRESSES.ethereum.MKR,//mkr
        ADDRESSES.ethereum.GNO,//gno
        ADDRESSES.ethereum.DAI,//dai
      ],
      owners: ['0x68A99f89E475a078645f4BAC491360aFe255Dff1'],
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.BUSD,//busd
        ADDRESSES.bsc.USDT,//busd usdc
        ADDRESSES.bsc.WBNB,//wbnb
      ],
      owners: ['0x5C9E5571B17D91e6ACcD4F0c29bBe199Af1f7B09']
    },
    tron: {
      tokens: [
        nullAddress,
        ADDRESSES.tron.USDT,
      ],
      owners: ['TSZMcrQzMLdKrgiMPoe2uQMHLeEpkf2j8E']
    },
    bitcoin: {
      tokens: [
        nullAddress,
      ],
      owners: bitcoinAddressBook.indiaCovid
    }
    //https://cryptorelief.in/transparency
  },
  'treasury/instadapp': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244",
        ADDRESSES.optimism.DAI
      ],
      owners: ['0xf81ab897e3940e95d749ff2e1f8d38f9b7cbe3cf'],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.USDT
      ],
      owners: ['0x28849d2b63fa8d361e5fc15cb8abb13019884d09'],
      ownTokens: ['0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb'],
    },
  },
  'treasury/insure-dao': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xd076397ec36f1c92939bd8cda9f9f7734f308c4b',],
    },
  },
  'treasury/interport-finance': {
    ethereum: {
      tokens: [
        nullAddress
      ],
      owners: ['0xa67488eEAa9C15a4F6f5A3E98f45041e34310677', '0x4883A3696768c226EF917BCc32bDBA67F14e2b4c'],
      ownTokens: ['0x2b1D36f5B61AdDAf7DA7ebbd11B35FD8cfb0DE31'],
    },
  },
  'treasury/inverse': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDC,
        "0x865377367054516e17014CcdED1e7d814EDC9ce4", // DOLA
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.YFI,
        "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", // AURA
        "0xba100000625a3754423978a60c9317c58a424e3D", // BAL
        "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
        ADDRESSES.ethereum.cvxFXS,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.CVX,
        "0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3", // FODL
        ADDRESSES.ethereum.SAFE,
        "0x22915f309EC0182c85cD8331C23bD187fd761360", // DOLA USDC Stable Pool Aura Deposit Vault
        "0x7f50786A0b15723D741727882ee99a0BF34e3466", // Stake DAO sdCRV Gauge
        "0xf24d8651578a55b0c119b9910759a351a3458895", // sdBAL
        "0x445494F823f3483ee62d854eBc9f58d5B9972A25", // 50DOLA-50DBR
        "0xb204BF10bc3a5435017D3db247f56dA601dFe08A", // 50DOLA-50WETH
        "0x7e05540A61b531793742fde0514e6c136b5fbAfE", // xFODL
        "0x0a6B1d9F920019BAbc4De3F10c94ECB822106104",
        "0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352",
        "0xbD1F921786e12a80F2184E4d6A5cAcB25dc673c9", // dola-inv uni
      ],
      owners: ['0x926df14a23be491164dcf93f4c468a50ef659d5b', '0x9D5Df30F475CEA915b1ed4C0CCa59255C897b61B', '0x4b6c63e6a94ef26e2df60b89372db2d8e211f1b7', '0x943dbdc995add25a1728a482322f9b3c575b16fb', '0x8f97cca30dbe80e7a8b462f1dd1a51c32accdfc8'],
      ownTokens: [
        '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68',
        "0xAD038Eb671c44b853887A7E32528FaB35dC5D710", // DBR
        "0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352", // Uniswap INV/ETH LP
        "0xA5D7A7690B72a89B7b720E43fC9cBda5419d0C71", // 50INV-50DOLA Aura Deposit Vault
      ],
      resolveUniV3: true,
      resolveLP: true,
      blacklistedTokens: [
        '0x21e83dbfd8f11d885eba9f9ba126da11ae0671b7',
        '0x265befe2b1a0f4f646dea96ba09c1656b74bda91',
      ],
      convexRewardPools: [
        "0x9a2d1b49b7c8783E37780AcE4ffA3416Eea64357",// DBR tripool CVX
        "0x21E2d7f66DF6F4e8199210b9490a51831C9847C7",// inv tripool CVX
        "0xE8cBdBFD4A1D776AB1146B63ABD1718b2F92a823",// dola-fraxpyusd lp CVX
        "0x2ef1dA0368470B2603BAb392932E70205eEb9046",// dola-fxusd lp CVX
        "0x0404d05F3992347d2f0dC3a97bdd147D77C85c1c",// dola-fraxusdc lp CVX
      ],
      auraPools: [
        // "0xA36d3799eA28f4B75653EBF9D91DDA4519578086", // sDOLA-DOLA aura pool
      ],
      blacklistedLPs: [
        '0xcb79637aaffdc1e8db17761fa10367b46745ecb0'
      ]
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.USDC_CIRCLE,
        "0x8aE125E8653821E851F12A49F7765db9a9ce7384", // DOLA
        "0x9560e827af36c94d2ac33a39bce1fe78631088db", // VELO
      ],
      solidlyVeNfts: [
        { baseToken: "0x9560e827af36c94d2ac33a39bce1fe78631088db", veNft: "0xFAf8FD17D9840595845582fCB047DF13f006787d" },// veVelo
      ],
      owners: ['0xa283139017a2f5bade8d8e25412c600055d318f8'],
      ownTokens: [],
    },
    base: {
      tokens: [
        nullAddress,
        ADDRESSES.base.USDC,
        ADDRESSES.base.USDbC,
        "0x4621b7A9c75199271F773Ebd9A499dbd165c3191", // DOLA
        "0x940181a94A35A4569E4529A3CDfB74e38FD98631", // AERO
      ],
      solidlyVeNfts: [
        { baseToken: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", veNft: "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4" },// veVelo
      ],
      owners: ['0x586CF50c2874f3e3997660c0FD0996B090FB9764'],
      ownTokens: [],
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.WBNB,
        "0x2F29Bc0FFAF9bff337b31CBe6CB5Fb3bf12e5840", // DOLA
        "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", // THENA
      ],
      solidlyVeNfts: [
        { isAltAbi: true, baseToken: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", veNft: "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D" },// veTHENA
      ],
      owners: ['0xf7da4bc9b7a6bb3653221ae333a9d2a2c2d5bda7'],
      ownTokens: [],
    },
    avax: {
      tokens: [
        nullAddress,
        ADDRESSES.avax.USDC,
        '0x221743dc9E954bE4f86844649Bf19B43D6F8366d', // DOLA
        '0xeeee99b35Eb6aF5E7d76dd846DbE4bcc0c60cA1d', // SNEK
      ],
      solidlyVeNfts: [
        { isAltAbi: true, baseToken: "0xeeee99b35Eb6aF5E7d76dd846DbE4bcc0c60cA1d", veNft: "0xeeee3Bf0E550505C0C17a8432065F2f6b9D06350" },// veSNEK
      ],
      owners: ['0x1A927B237a57421C414EB511a33C4B82C2718677'],
      ownTokens: [],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.DAI,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.WETH,
        "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418", // RAM
      ],
      solidlyVeNfts: [
        { isAltAbi: true, baseToken: "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418", veNft: "0xAAA343032aA79eE9a6897Dab03bef967c3289a06" },// veRAM
        { isAltAbi: true, baseToken: "0x5DB7b150c5F38c5F5db11dCBDB885028fcC51D68", veNft: "0x450330Df68E1ed6e0683373D684064bDa9115fEe" },// veSTR
        { isAltAbi: true, baseToken: "0x463913D3a3D3D291667D53B8325c598Eb88D3B0e", veNft: "0x29d3622c78615A1E7459e4bE434d816b7de293e4" },// veSLIZ
        { hasTokensOfOwnerAbi: true, baseToken: "0x15b2fb8f08E4Ac1Ce019EADAe02eE92AeDF06851", veNft: "0x9A01857f33aa382b1d5bb96C3180347862432B0d" },// veCHRONOS
      ],
      owners: ['0x23dEDab98D7828AFBD2B7Ab8C71089f2C517774a', '0x233Ca46D4882609C53fcbD2FCFaAe92D2eA89538'],
      ownTokens: [],
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC,
        '0xbC2b48BC930Ddc4E5cFb2e87a45c379Aab3aac5C', // DOLA
      ],
      owners: ['0x5D18b089e838DFFbb417A87874435175F3A9B000'],
    },
  },
  'treasury/ipor': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.STETH
      ],
      owners: ["0x558c8eb91F6fd83FC5C995572c3515E2DAF7b7e0", "0x1332e5373D2eD051589e7852DBE4c08Ba4465259", "0xF6a9bd8F6DC537675D499Ac1CA14f2c55d8b5569", "0xB7bE82790d40258Fd028BEeF2f2007DC044F3459", "0x0b65625f905168EF24829fb625B177f83f1BFe6B", "0x75DC10597861B687ea1c6F955cDDA0c913E2299f"],
      ownTokens: ["0x1e4746dC744503b53b4A082cB3607B169a289090"],
      resolveLP: true,
    },
    base: {
      tokens: [
        nullAddress,
        ADDRESSES.base.WETH
      ],
      owners: ["0xF6a9bd8F6DC537675D499Ac1CA14f2c55d8b5569", "0xB7bE82790d40258Fd028BEeF2f2007DC044F3459"],
      ownTokens: ["0xbd4e5C2f8dE5065993d29A9794E2B7cEfc41437A"],
      resolveLP: true
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WETH
      ],
      owners: ["0x7D002e4F8B3ad8fdf782a10e3744c777eeB579Eb", "0x726AC76F27d24E607a282d72CEde705BB48071A6", "0xF6a9bd8F6DC537675D499Ac1CA14f2c55d8b5569", "0xff560c41eacd072AD025F43DF3516cB6580C96bF", "0xb56102180C96B988b78DB3725fe03d8326217c9c"],
      ownTokens: ["0x34229B3f16fBCDfA8d8d9d17C0852F9496f4C7BB"],
      resolveLP: true
    }
  },
  'treasury/iq': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.sfrxETH,
        ADDRESSES.ethereum.FRAX,
        "0x9D45081706102E7aadDD0973268457527722E274",
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.FXS,
        "0xEF9F994A74CB6EF21C38B13553caa2E3E15F69d0"
      ],
      owners: ['0x56398b89d53e8731bca8c1b06886cfb14bd6b654'],
      ownTokens: ['0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9'],
    },
  },
  'treasury/jackson': {
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.WBTC,
      ],
      owners: ["0x8Ec3cA3535c246D694a2AE3D3Df1F202cc3C0b5D"],
    },
  },
  'treasury/jade1': {
    bsc: {
      tokens: [
        "0xF1c599E9A5FBDEA408a7409C0176a2fE42C64444", // hachiko inu
        "0x2789033DFE80593f69d689f65892a75aFA491111", // white monkey
        "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // binance peg link
      ],
      ownTokens: ["0x330f4fe5ef44b4d0742fe8bed8ca5e29359870df"], // jade
      owners: ["0x62c71392c796b92dFe62aCba30293A60771450b0"], // treasury
    },
  },
  'treasury/jade-protocol': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.sfrxETH,
        ADDRESSES.ethereum.FXS, // FXS
      ],
      owners: ['0x6f0bc6217faa5a2f503c057ee6964b756a09ae2c', '0xcb0718b150552af8904e7cb1c62758dcb149b072'],
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.BUSD,
      ],
      owners: ['0x169169a50d9a8fbf99edacf9aa10297e2b3c92dd'],
    },
    avax: {
      tokens: [
        nullAddress,
        ADDRESSES.avax.USDC,
      ],
      owners: ['0xaeA6B4AAd5e315a40aFD77a1F794F61161499Fa5']
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
      ],
      owners: ['0x489f866c0698C8D6879f5C0F527bc8281046042D']
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        '0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017', //rdnt
        ADDRESSES.arbitrum.GMX,
      ],
      owners: ['0x02944e3fb72aa13095d7cebd8389fc74bec8e48e', '0xd012A9C8159b0E7325448eD30B1499FddDAc0F40']
    }
  },
  'treasury/jonesdao': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC, // USDC
        "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8", // GRAIL
        "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", // MIM
        "0x3CAaE25Ee616f2C8E13C74dA0813402eae3F496b", // xGRAIL
        "0x616279fF3dBf57A55e3d1F2E309e5D704E4e58Ae", // jGLP-USDC CMLT-LP
        "0x2bcd0aac7D98697D8760fB291625829113E354e7", // jUSDC-WETH CMLT-LP
        "0x7241bC8035b65865156DDb5EdEf3eB32874a3AF6", // jGLP
        "0xe66998533a1992ecE9eA99cDf47686F4fc8458E0", // jUSDC old
        "0xB0BDE111812EAC913b392D80D51966eC977bE3A2", // jUSDC new
        "0xd2D1162512F927a7e282Ef43a362659E4F2a728F", // sbfGMX
      ],
      owners: ['0xFa82f1bA00b0697227E2Ad6c668abb4C50CA0b1F'],
      ownTokens: ['0x10393c20975cF177a3513071bC110f7962CD67da'],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
      ],
      owners: ['0xFa82f1bA00b0697227E2Ad6c668abb4C50CA0b1F'],
      ownTokens: [],
    },
  },
  'treasury/jupiter': {
    solana: {
      owners: [
        'CPZmKkAhD2wv1Z21EUZvdH8ZeSD13geAnSfyVBwcW8XK', // DAO Treasury From https://docsend.com/view/bihwsdikxcpnv3kt
      ],
      ownTokens: [
        ADDRESSES.solana.JUP
      ]
    },
  },
  'treasury/just-yield': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WETH,//weth
      ],
      owners: ['0xeCa31b3cbD0C65CC3Ea2DE2338693B74445B0c2C'],
    },
  },
  'treasury/k2-lend': {
    stellar: {
      owners: ['CCQ4J5VLQHM2ORP4K7GBVAJJPK5SGG23DH4RD7QEHAZDHTN7JNESNXKZ'],
    },
  },
  'treasury/k9finance': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0xDA4Df6E2121eDaB7c33Ed7FE0f109350939eDA84'],
      ownTokens: ["0x91fbb2503ac69702061f1ac6885759fc853e6eae"]
    },
    shibarium: {
      tokens: [nullAddress, ADDRESSES.shibarium.BONE_5],
      owners: ['0x5C3d21D406226F17a06510F1CB9157BD9e751416'],
      ownTokens: ["0x91fbB2503AC69702061f1AC6885759Fc853e6EaE"]
    },
  },
  'treasury/keeperdao': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        '0xFe2e637202056d30016725477c5da089Ab0A043A',//sETH2
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.RETH,//rETH
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.WBTC,//WBTC
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',//ALCX
        '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',//renBTC
        ADDRESSES.ethereum.USDT
      ],
      owners: ['0x9a67F1940164d0318612b497E8e6038f902a00a4'],
      ownTokens: ['0xfA5047c9c78B8877af97BDcb85Db743fD7313d4a'],
    },
  },
  'treasury/kei': {
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.WETH,
        '0x7d87123d92e9df257e0789189e4c4ff67fa6c382',
      ],
      owners: ['0x3D027824a9Eb4cc5E8f24D97FD8495eA9DC7026F'],
      ownTokens: ['0xF75C7a59bCD9bd207C4Ab1BEB0b32EEd3B6392f3'],
      resolveLP: true,
    },
  },

  // ----- from batch_a06.js -----
  'treasury/kinetiq': {
    hyperliquid: {
      owners: ['0x64bD77698Ab7C3Fd0a1F54497b228ED7a02098E3'],
      ownTokens: ['0xfd739d4e423301ce9385c1fb8850539d657c296d'],
    },
  },
  'treasury/king-finance': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.USDT,
      ],
      owners: [
        '0x2eecdb4631c3d2f49d56b4cbfede4c7b23151337',
        '0x0af6fef0248d666f0bfd73e65485186526411337',
        '0x74f08aF7528Ffb751e3A435ddD779b5C4565e684',
        '0xa6449e07ee26d552bc7a2656038cd19b1b691337',
      ],
      ownTokens: ['0x74f08aF7528Ffb751e3A435ddD779b5C4565e684'],
    },
  },
  'treasury/kinza': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.WBNB,
      ],
      owners: ['0x65FDCD48c4807F67429Bdc731d6964f5553CdB36'],
    },
  },
  'treasury/klima-dao': {
    polygon: {
      tokens: [
        nullAddress,
        '0x2F800Db0fdb5223b3C3f354886d907A671414A7F', // BCT
        ADDRESSES.polygon.USDC, // USDC
        ADDRESSES.polygon.USDC_CIRCLE,
        ADDRESSES.polygon.USDT,
        '0xD838290e877E0188a4A44700463419ED96c16107', // NCT
        '0xAa7DbD1598251f856C12f63557A4C4397c253Cea', // MCO2
        '0x2B3eCb0991AF0498ECE9135bcD04013d7993110c', // UBO
        '0x6BCa3B77C1909Ce1a4Ba1A20d1103bDe8d222E48', // NBO
        '0x5786b267d35F9D011c4750e0B0bA584E1fDbeAD1', // USDC/KLIMA SLP
        '0x9803c7aE526049210a1725F7487AF26fE2c24614', // BCT/KLIMA SLP
        '0xb2D0D5C86d933b0aceFE9B95bEC160d514d152E1', // NCT/KLIMA SLP
        '0x64a3b8cA5A7e406A78e660AE10c7563D9153a739', // MCO2/KLIMA Quickswap LP
        '0x5400A05B8B45EaF9105315B4F2e31F806AB706dE', // UBO/KLIMA SLP
        '0x251cA6A70cbd93Ccd7039B6b708D4cb9683c266C', // NBO/KLIMA SLP
        "0x1E67124681b402064CD0ABE8ed1B5c79D2e02f64", // USDC.e-BCT Sushi LP
        "0x4D2263FF85e334C1f1d04C6262F6c2580335a93C", // KLIMA-CCO2 Sushi LP

        // Carbon
        "0x03E3369af9390493CB7CC599Cd5233D50e674Da4", // MOSS
        "0xad01DFfe604CDc172D8237566eE3a3ab6524d4C6", // C3
        "0x672688C6Ee3E750dfaA4874743Ef693A6f2538ED", // CRISP-C
        "0x82B37070e43C1BA0EA9e2283285b674eF7f1D4E2", // CCO2
      ],
      owners: ['0x7dd4f0b986f032a44f913bf92c9e8b7c17d77ad7', '0x65A5076C0BA74e5f3e069995dc3DAB9D197d995c'],
      ownTokens: ['0x4e78011ce80ee02d2c3e649fb657e45898257815'],
    },
    base: {
      tokens: [
        nullAddress,
        ADDRESSES.base.USDC, // USDC
        //ADDRESSES.base.USDT,
        ADDRESSES.base.WETH,
        '0x576Bca23DcB6d94fF8E537D88b0d3E1bEaD444a2', // BCT (base address)
        '0x20b048fa035d5763685d695e66adf62c5d9f5055', // CHAR
        '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
        '0x16E1846aaFD6ecf91De676e7B6fc23f09a83F258', // WOOD
      ],
      solidlyVeNfts: [
        { baseToken: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', veNft: '0xebf418fe2512e7e6bd9b87a8f0f294acdc67e6b4' },
      ],
      owners: ['0xa79cd47655156b299762dfe92a67980805ce5a31'],
      ownTokens: ['0xdcefd8c8fcc492630b943abcab3429f12ea9fea2'],
    },
  },
  'treasury/koyo': {
    boba: {
      tokens: [
        '0x618CC6549ddf12de637d46CDDadaFC0C2951131C', // KYO
        '0x3a93bd0fa10050d206370eea53276542a105c885', // BREW
        ADDRESSES.boba.BOBA,
        ADDRESSES.boba.FRAX,
        ADDRESSES.boba.USDC,
        ADDRESSES.boba.USDT,
        ADDRESSES.boba.DAI,
      ],
      owners: ['0x559dBda9Eb1E02c0235E245D9B175eb8DcC08398'],
      ownTokens: ['0x618CC6549ddf12de637d46CDDadaFC0C2951131C'],
    },
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.USDC,
      ],
      owners: ['0x47BbF992a25B7fe1D532F8128D514524462731eF'],
      ownTokens: [],
    },
  },
  'treasury/kpk': {
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.WEETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.SAFE,
        "0x4da27a545c0c5B758a6BA100e3a049001de870f5", // stkAAVE,
        "0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab", // COW
        "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72", // ENS
        ADDRESSES.ethereum.UNI,
        "0x0d438f3b5175bebc262bf23753c1e53d03432bde", // WNXM
        ADDRESSES.ethereum.LIDO,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.GNO,
        ADDRESSES.ethereum.CRVUSD,
        "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", // AURA
        ADDRESSES.ethereum.CVX,
        "0xd33526068d116ce69f19a9ee46f0bd304f21a51f", // RPL
        "0x39b8B6385416f4cA36a20319F70D28621895279D", // EURe
      ],
      owners: ['0x58e6c7ab55Aa9012eAccA16d1ED4c15795669E1C'],
    },
  },
  'treasury/kromatika': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244"
      ],
      owners: ['0x8e35cc21fbcade0a5483ce430e0d5456086a36d3'],
      ownTokens: ['0x55fF62567f09906A85183b866dF84bf599a4bf70'],
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP,
      ],
      owners: ['0x05d235d8Ba95bfc457f9a11F64cf869f0f3f60F9'],
      ownTokens: ['0xF98dCd95217E15E05d8638da4c91125E59590B07'],
    },
    ethereum: {
      owners: ['0xC5bF7A684a0dfCA02A1E603b1d27af0aF523A54F'],
      ownTokens: ['0x3af33bEF05C2dCb3C7288b77fe1C8d2AeBA4d789'],
    },
    polygon: {
      owners: ['0x59bFbaa9BEB41C1cf3f874529776449852c21f5d'],
      ownTokens: ['0x14Af1F2f02DCcB1e43402339099A05a5E363b83c'],
    },
  },
  'treasury/kyber': {
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT
      ],
      owners: ['0xe6a7338cba0a1070adfb22c07115299605454713', '0x91c9d4373b077ef8082f468c7c97f2c499e36f5b'],
      ownTokens: ['0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202'],
    },
    arbitrum: {
      tokens: [
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d" //MAI
      ],
      owners: ['0x91c9d4373b077ef8082f468c7c97f2c499e36f5b'],
      ownTokens: ['0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB'],
    },
    optimism: {
      tokens: [
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH,
        "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4"
      ],
      owners: ['0x91c9d4373b077ef8082f468c7c97f2c499e36f5b'],
      ownTokens: ['0xa00E3A3511aAC35cA78530c85007AFCd31753819'],
    },
    bsc: {
      tokens: [
        ADDRESSES.bsc.WBNB
      ],
      owners: ['0x91c9d4373b077ef8082f468c7c97f2c499e36f5b'],
      ownTokens: ['0xfe56d5892BDffC7BF58f2E84BE1b2C32D21C308b'],
    },
  },
  'treasury/l2beat': {
    optimism: {
      tokens: [
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH
      ],
      owners: ['0xea78912803be5e356eac2b8e127d4ba87230a48e'],
    },
  },
  'treasury/level': {
    bsc: {
      tokens: [
        "0xb5c42f84ab3f786bca9761240546aa9cec1f8821",
      ],
      owners: [
        '0x8BFf27E9Fa1C28934554e6B5239Fb52776573619',
        '0xb07953f23545796710957faec97f05b21146ac2d',
        '0x92a0a11a57c28d4c86a629530fd59b83b1276003',
        '0x712a2e08c67cd7153f04fdb3037d4696300921d0',
      ],
      ownTokens: ['0xb64e280e9d1b5dbec4accedb2257a87b400db149'],
    },
    arbitrum: {
      tokens: [
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.ARB,
        "0x502697AF336F7413Bb4706262e7C506Edab4f3B9",
        "0xb076f79f8D1477165E2ff8fa99930381FB7d94c1",
        "0x5573405636F4b895E511C9C54aAfbefa0E7Ee458",
      ],
      owners: [
        '0x635aac65f37a6bbe06a2dde77b0fd2f1748674d4',
        '0x4b47ef68180ec46a0b6be4d34fd9d8680bee2b2c',
      ],
      ownTokens: ['0xb64e280e9d1b5dbec4accedb2257a87b400db149'],
    },
  },
  'treasury/lido': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.MATIC,//MATIC
        ADDRESSES.ethereum.USDC,//USDC
        '0x2eE543b8866F46cC3dC93224C6742a8911a59750',//MVDG
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',//HSF
        '0x232FB065D9d24c34708eeDbF03724f2e95ABE768',//SHEESHA
        '0x0d02755a5700414B26FF040e1dE35D337DF56218' //BEND
      ],
      owners: ['0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c', '0xd65Fa54F8DF43064dfd8dDF223A446fc638800A9'],
      ownTokens: [ADDRESSES.ethereum.LIDO],
    },
    solana: {
      tokens: [
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"
      ],
      owners: ['GQ3QPrB1RHPRr4Reen772WrMZkHcFM4DL5q44x1BBTFm'],
      ownTokens: ['HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p'],
    },
  },
  'treasury/liondex': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244",
      ],
      owners: ['0x7fca3bf8adc4e143bd789aecda36c0ce34f1d75b'],
      ownTokens: ['0x8eBb85D53e6955e557b7c53acDE1D42fD68561Ec'],
      resolveUniV3: true,
    },
  },
  'treasury/liquity-treasury': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.LUSD,//LUSD
        ADDRESSES.ethereum.USDC,//usdc
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',//grt
        '0x41545f8b9472D758bB669ed8EaEEEcD7a9C4Ec29',//fort
      ],
      owners: ['0xF06016D822943C42e3Cb7FC3a6A3B1889C1045f8', '0xcCb2656afB1Cc4cB130e8C8C903ad674069c6FCD'],
      ownTokens: ['0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d'],
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP, //OP
        '0x73cb180bf0521828d8849bc8CF2B920918e23032', //USD+
        '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',//velo
      ],
      owners: ['0xd2D4e9024D8C90aB52032a9F1e0d92D4cE20191B', '0x2f593f151aF4bb9A71bcA6cAce1d3c56C2844117'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xc5adb3d91329e1600cbf573485b1d3207bcf6de2'],
    },
  },
  'treasury/looksrare': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.SAFE,
      ],
      owners: ['0xC8C57e4C73c71f72cA0a7e043E5D2D144F98ef13'],
      ownTokens: ['0xf4d2888d29D722226FafA5d9B24F9164c092421E'],
    },
  },
  'treasury/loot-dao': {
    ethereum: {
      tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.WETH],
      owners: ['0x8cFDF9E9f7EA8c0871025318407A6f1Fbc5d5a18'],
      ownTokens: ['0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7'] // loot
    },
    polygon: {
      tokens: [nullAddress, ADDRESSES.polygon.WETH_1], //weth
      owners: ['0x8cFDF9E9f7EA8c0871025318407A6f1Fbc5d5a18'],
    },
  },
  'treasury/loreum': {
    ethereum: {
      owners: ['0x5d45A213B2B6259F0b3c116a8907B56AB5E22095'],
    },
  },
  'treasury/lsdx-finance': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.USDC,//USDC
      ],
      owners: ['0xb966b7038A2b42A0419457dA4F4d2FBa23097aE1'],
      ownTokens: ['0xfAC77A24E52B463bA9857d6b758ba41aE20e31FF'],
    },
  },
  'treasury/ltv-protocol': {
    ethereum: {
      owners: ['0x202065dFb813295D0B095A39E36E3b3296210505'],
    },
  },
  'treasury/luchadores': {
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.WMATIC_2,
        '0x5D066D022EDE10eFa2717eD3D79f22F949F8C175',
      ],
      owners: ['0x0Cb11b92Fa5C30eAfe4aE84B7BB4dF3034C38b9d'],
      ownTokens: ['0x6749441Fdc8650b5b5a854ed255C82EF361f1596'],
      uniV3nftsAndOwners: [['0x8aac493fd8c78536ef193882aeffeaa3e0b8b5c5', '0x0Cb11b92Fa5C30eAfe4aE84B7BB4dF3034C38b9d']]
    },
    base: {
      tokens: [
        ADDRESSES.base.WETH,
        '0x0D4953d2BDe145D316296CC72cCE509D899a5529'
      ],
      owners: ['0xa715c8b17268f140D76494c12ec07B48218549C4'],
      ownTokens: ['0xF4435cC8b478d54313F04c956882BE3D9aCf9F6F'],
      blacklistedTokens: ['0x3a94201a0b6c3593ad3b3e17e3dfce33da183514'],
      resolveLP: true,
    },
  },
  'treasury/luna-fun': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.WBNB,
      ],
      owners: ['0x6b198Ff4e0e3E3FB07a8A0bC09e8F7BE9fc608F5'],
    },
  },
  'treasury/lyra': {
    arbitrum: {
      tokens: [
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WETH,
      ],
      owners: ['0x2ccf21e5912e9ecccb0ecdee9744e5c507cf88ae'],
      ownTokens: ['0x079504b86d38119F859c4194765029F692b7B7aa', '0x77b7787a09818502305C95d68A2571F090abb135'],
    },
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.USDC,
      ],
      owners: ['0xEE86E99b42981623236824D33b4235833Afd8044', '0x169a99B9958386a5D91E732Ed08B344946A92391', '0xEe900961552Df080712fBeFaEe7152d932b384BC'],
      ownTokens: ['0x01BA67AAC7f75f647D94220Cc98FB30FCc5105Bf', '0xB1D1eae60EEA9525032a6DCb4c1CE336a1dE71BE'],
    },
    optimism: {
      tokens: [
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.sUSD,
        ADDRESSES.optimism.WETH,
      ],
      owners: ['0xD4C00FE7657791C2A43025dE483F05E49A5f76A6'],
      ownTokens: [ADDRESSES.base.DAI, '0x33800De7E817A70A694F31476313A7c572BBa100'],
    },
  },
  'treasury/mahaxyz': {
    ethereum: {
      owners: ['0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC'],
      ownTokens: [
        "0x745407c86DF8DB893011912d3aB28e68B62E49B0", // MAHA
      ],
      blacklistedTokens: [
        "0xB4d930279552397bbA2ee473229f89Ec245bc365", // MAHA
        "0x6b7127a638eDC7Db04bEde220c7c49930fdB4160" // MAHAETH
      ],
    },
  },
  'treasury/maker': {
    ethereum: {
      owners: ['0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB'],
      ownTokens: ['0xc20059e0317de91738d13af027dfc4a50781b066', '0x56072c95faa701256059aa122697b133aded9279', ADDRESSES.ethereum.MKR, '0xB30FE1Cf884B48a22a50D22a9282004F2c5E9406']
    },
    arbitrum: {
      owners: ['0x10e6593cdda8c58a1d0f14c5164b376352a55f2f'],
      tokens: [nullAddress]
    },
  },
  'treasury/mango': {
    solana: {
      owners: [
        '5tgfd6XgwiXB9otEnzFpXK11m7Q7yZUaAJzWK4oT5UGF',
        '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3',
        '3H5PPK1bhHKmCAG5zwUyxpKDijES3H9uRAUCBrW8rGPX',
        '5sD9b7DR8E7nvNfqoBoH3t8s8NdwtdDVxjf4NB9uaxG9',
        'DdZWj3nWSzJMMv1LMTHm9gTJ37wHLNXTMzqjWCokvKEn',
        'VrT8f16NLADvYR73YiDMwxZREPbJgiZqLvN6HLQj4hR',
        'DZZWE1PR8qTkH3dLTrD7kcNEs6xx3GmSuFbzW29dyHv7',
        'BExGoGVK6k6mUL6oHmabbc2EtwNqhJUeNoJWijF6t3ZB',
        '9so7UTo6b6LXBSqdDfh18hjVj8Ng5BmLbYXLB7UrhaaJ',
        '9so7UTo6b6LXBSqdDfh18hjVj8Ng5BmLbYXLB7UrhaaJ',
        '58apybWwtWwgVfARs7uJ75Vs1csPimnCCFth7cKwTJAe',
        '7hqfhmXK6uXQKmNjUVEJo5acDMLcnyN9p9bZ5Dmnifde'
      ],
      ownTokens: [
        'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', // MNGO
        '3jsFX1tx2Z8ewmamiwSU851GzyzM2DJMq7KWW5DM8Py3', // CHAI?
      ]
    },
  },
  'treasury/mantle-meth': {
    ethereum: {
      owners: [
        '0x00354d59E829fB79e2Ff7D8a022553728520cB6A', '0x18d336d33a5be54cC62C9034e3a66e3220AA268a',
        '0xfB7e8892fBDa0205f6BbdbCd90dD9b0bDD321D16',
      ],
      ownTokens: ['0x9F0C013016E8656bC256f948CD4B79ab25c7b94D', ADDRESSES.mantle.cmETH, '0x3c3a81e81dc49A522A592e7622A7E711c06bf354'],
    },
    mantle: {
      owners: [
        '0x0CA28e2D07268325ce7f5eCe5ACde658a4769CD7',
        '0x931FCb5bC6CaFaFbA0Ce921f31AFD27C144F2fD5',
        '0x381e7741a183C8E0c6Ec1AFa183842E597144Ed0',
      ],
      ownTokens: ['0x9F0C013016E8656bC256f948CD4B79ab25c7b94D', nullAddress]
    },
  },
  'treasury/mantra-dao': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        '0xFe2e637202056d30016725477c5da089Ab0A043A',//sETH2
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.RETH,//rETH
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.WBTC,//WBTC
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',//ALCX
        '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D'//renBTC
      ],
      owners: ['0xc8899da25423ac52aa711b97ae04c8888fa1e1d7', '0xd84701828745c98405a3e1153fccea627963859a'],
      ownTokens: ['0x3593d125a4f7849a1b059e64f4517a86dd60c95d'],
    },
  },
  'treasury/maple': {
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT
      ],
      owners: [
        "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19",
        "0xd6d4Bcde6c816F17889f1Dd3000aF0261B03a196"
      ],
      ownTokens: ["0x33349b282065b0284d756f0577fb39c158f935e6"],
    },
  },
  'treasury/marinade': {
    solana: {
      owners: [
        'B56RWQGf9RFw7t8gxPzrRvk5VRmB5DoF94aLoJ25YtvG',
        'J5BEceL5z1EQ7JBqEFu4BfPN4PYCeQaW3GXrzXFfCzhs',
      ],
      ownTokens: [
        'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey', // MNDE
      ]
    },
  },
  'treasury/megamble': {
    megaeth: {
      owners: ['0x21CbC99a2E8c68F1C2955991E07c0C22ea895Da1'],
      tokens: [
        nullAddress,
      ],
    },
  },
  'treasury/memewe': {
    base: {
      owners: [
        '0xFfC60ed4c5ee48beb646dD81521842A4a4d19980',
      ],
      tokens: [
        nullAddress,
        ADDRESSES.base.USDC
      ],
      ownTokens: [],
    },
  },
  'treasury/meowl': {
    ethereum: {
      tokens: [
        nullAddress
      ],
      owners: [
        // "0x842618c3f6E3E12edc5F02CC17561293e10CEb7d",
        "0x50fF6353C06Bd582971C1685573a0cD1555421C1"
      ],
      ownTokens: ["0x1F1F26C966F483997728bEd0F9814938b2B5E294", '0x556bB0B27E855e6f2cEBb47174495B9BBEB97fF1'],
    },
  },
  'treasury/merit-circle': {
    ethereum: {
      owners: [
        '0x7e9e4c0876B2102F33A1d82117Cc73B7FddD0032', // Treasury Main (MC)
        '0xA99F29A2fBdCaFbf057b3D8eFC47cfCEe670Bb43', // Treasury Main (BEAM)
        '0x73F7261cF493105202F8dcbB11C126a65703dA55', // Treasury 2
        '0xC4218226A5406Aa721EAEBc2D9dA9564AEdd7777', // Treasury 3
        '0x75A3820eE3F245Ecd4b77EB9b28fe5F8bfF77f15', // Treasury 5
        '0xc040340bDD2F40374e9751Db0342D0AC668ef7C8',
        '0x3cB580c041Cce953adfc2148e5BE6c1c893CCa9E', // Merit Circle: Deployer
        '0xAeACFaAE1e084a952f1E6036F13bFe873f428f78', // Treasury Operational
        '0x07e0D811f266b7F65fD022bA4bDab562Ce067420', // Venture Investment
        '0x172FFFc69ED471B7fF2465aE97504985F7071593' // BEAM: Deployer
      ],
      ownTokens: ['0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6', '0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce'],
    },
    bsc: {
      owners: [
        '0xf92Bc9ee240B82A888c398e6965A7edcBF9399CF', '0xC4218226A5406Aa721EAEBc2D9dA9564AEdd7777'
      ],
      ownTokens: ['0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6', '0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce'],
    },
  },

  // ----- from batch_a07.js -----
  'treasury/metacartel': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WETH,//weth
        ADDRESSES.ethereum.USDC,//usdc
        '0x6243d8CEA23066d098a15582d81a598b4e8391F4',//flx
        ADDRESSES.ethereum.DAI,//dai
        '0xfb5453340C03db5aDe474b27E68B6a9c6b2823Eb',//robot
        '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',//rai
      ],
      owners: ['0x4570b4fAF71E23942B8B9F934b47ccEdF7540162'],
    },
  },
  'treasury/metaplex-dao': {
    solana: {
      owners: [
        'BHkk3RTd4Ue6JnqXpa9QHTXbn575ycR8hxVmYx4E254k',
      ],
      ownTokens: [
        'EDNhHk1ZqVRKnPtVYJhRtzS7ra1z1V5Gnqs5iQee8ocd', // MPLX - Metaplex
      ],
    },
  },
  'treasury/meteora': {
    solana: {
      owners: [
        "DdKZZL4tiojQEdYDUFfBDJdMJ1ERwgk3TWRLKeS6pVKp",
        "Kewh32zffqXCaGufAQhag3BdamAS3FEsAyk9Yq3N2JK",
        "27Y4uEctsazLeiSoEe6Gr2YMxCdBhFfCHXP3afzkefhu",
        "FtY447zJHrcoPSGEYPbkrc3YeKYVRGgv8BkDyiP6Qm9x",
        "BJQbRiRWhJCyTYZcAuAL3ngDCx3AyFQGKDq8zhiZAKUw",
        "4EWqcx3aNZmMetCnxwLYwyNjan6XLGp3Ca2W316vrSjv",
        "CtL94wyS3rY5ZEnVWkXuKiP9K5HcH7XBdZ3ARAJqTy8C",
        "G8DM2iVAEAoeyAPNqwUVY6dga5Md78RsRzeVDEhn6onP",
        "7DWTwXVqcPEf6WkA8WNcqVCFYtvQE9RZMtHT1VvJCEcW",
        "CEvFzgEBKP3DY6Ue4kmMT2y25Le8nPpPtmAaY62pzjz2",
        "5zbWw84BDBtSjpngx1TFWBUHygzUHbPdP7aDPWomZrGP",
        "DAYifdw5kL5SP7SwR3YkFRDGqnX1auw85SrHA2oESrZp",
        "2Eg5WkWdnVYcoMYAH5UVmSQSWeE9pH2qDpXfRquxeF2C",
        "Gqoxsdoh8aebHwQXXDahAGvV9deS4TyfkVkY34oJxuAr",
        "6aYhxiNGmG8AyU25rh2R7iFu4pBrqnQHpNUGhmsEXRcm"
      ],// treasury addresses from ir.meteora.ag
      ownTokens: [
        'METvsvVRapdj9cFLzq4Tr43xK4tAjQfwX76z3n6mWQL'
      ],
      tokens: [
        nullAddress,
        ADDRESSES.solana.USDC,
        ADDRESSES.solana.SOL,
        ADDRESSES.solana.USDT,
        "59obFNBzyTBGowrkif5uK7ojS58vsuWz3ZCvg6tfZAGw",
        ADDRESSES.solana.JupSOL,
        "JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD",
        "1zJX5gRnjLgmTpq5sVwkq69mNDQkCemqoasyjaPW6jm",
        "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
        "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
        ADDRESSES.solana.JUP,
        "G5bStqnKXv11fmPvMaagUbZi86BGnpf9zZtyPQtAdaos",
        "HUMA1821qVDKta3u2ovmfDQeW2fSQouSKE8fkF44wvGw"
      ]
    },
  },
  'treasury/metronome': {
    ethereum: {
      tokens: [
        nullAddress,
        '0x64351fC9810aDAd17A690E4e1717Df5e7e085160',//msETH
        ADDRESSES.ethereum.USDC,//usdc
        ADDRESSES.ethereum.DAI,//dai
        ADDRESSES.ethereum.WETH,//weth
        '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421',//vsp
      ],
      owners: ['0xc897b98272aa23714464ea2a0bd5180f1b8c0025', '0xd1DE3F9CD4AE2F23DA941a67cA4C739f8dD9Af33'],
      ownTokens: ['0x2Ebd53d035150f328bd754D6DC66B99B0eDB89aa'],
    },
  },
  'treasury/mimo-protocol': {
    arbitrum: {
      tokens: [
        nullAddress,
        "0x76A9A0062ec6712b99B4f63bD2b4270185759dd5"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: ["0xfD28f108e95f4D41daAE9dbfFf707D677985998E"]
    },
    avax: {
      tokens: [
        nullAddress,
        "0x9eE1963f05553eF838604Dd39403be21ceF26AA4",
        "0x9d92c21205383651610f90722131655a5b8ed3e0"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: []
    },
    base: {
      tokens: [
        nullAddress,
        "0xefd0248d2c05075815e0c38f0bd9c1645706df3f",// stakeDAO sdSPECTRA
        "0x3bcf4e84c32d90bb309eab58d97b70372c84bc2c",// BPT USDp-USDC
        "0x76A9A0062ec6712b99B4f63bD2b4270185759dd5",
        "0x472eD57b376fE400259FB28e5C46eB53f0E3e7E7"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: ["0xfD28f108e95f4D41daAE9dbfFf707D677985998E"]
    },
    berachain: {
      tokens: [
        nullAddress,
        "0x9eE1963f05553eF838604Dd39403be21ceF26AA4"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: []
    },
    bsc: {
      tokens: [
        nullAddress,
        "0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: []
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.USDC,
        "0xba100000625a3754423978a60c9317c58a424e3D",//BAL
        ADDRESSES.ethereum.cvxCRV,
        "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D",//LQTY
        "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68",//INV
        "0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5",//PSP
        "0x68037790A0229e9Ce6EaA8A99ea92964106C4703",
        "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",//3CRV
        "0x4104b135DBC9609Fc1A9490E61369036497660c8",//APY
        "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF",//AURA
        "0x1846c6cbe0d433e152fa358e5ff27968e18bce7c",// BPT 80PRL-20WETH
        "0x9B3a8f7CEC208e247d97dEE13313690977e24459",
        "0x0d45b129dc868963025Db79A9074EA9c9e32Cae4"
      ],
      owners: ["0x25Fc7ffa8f9da3582a36633d04804F0004706F9b", "0x3De64eed7A43C40E33dc837dec1119DcA0a677b4"],
      ownTokens: ["0x6c0aeceeDc55c9d55d8B99216a670D85330941c3", "0x90b831fa3bebf58e9744a14d638e25b4ee06f9bc"]
    },
    fantom: {
      tokens: [
        nullAddress,
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
      ],
      owners: ["0x174162ddecE9d0b7B68fd945e38c3372C4C818ba", "0xA67FC89D5312812D3413A83418fc75ff78148a7E"],
      ownTokens: ["0x1d1764f04de29da6b90ffbef372d1a45596c4855",],
    },
    hyperliquid: {
      tokens: [
        nullAddress,
        "0xBE65F0F410A72BeC163dC65d46c83699e957D588",
        "0x9B3a8f7CEC208e247d97dEE13313690977e24459"
      ],
      owners: ["0x5C1232b4F5fdb34d487C934ADF5d4e5c01fE34be"],
      ownTokens: []
    },
    ink: {
      tokens: [
        nullAddress,
        "0x9eE1963f05553eF838604Dd39403be21ceF26AA4"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: []
    },
    optimism: {
      tokens: [
        nullAddress,
        "0x90337e484B1Cb02132fc150d3Afa262147348545"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: ["0xfD28f108e95f4D41daAE9dbfFf707D677985998E"]
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC,
        "0x1250304F66404cd153fA39388DDCDAec7E0f1707"
      ],
      owners: ["0x2046c0416A558C40cb112E5ebB0Ca764c3C5c32a", "0x6fb6a0a35b33e230d0149d49858e1a313a2ad4a7"],
      ownTokens: ["0x7790dd69aa10eD3f1271E41CD7222D2a7d2D5948", "0xadac33f543267c4d59a8c299cf804c303bc3e4ac"]
    },
    scroll: {
      tokens: [
        nullAddress,
        "0x9eE1963f05553eF838604Dd39403be21ceF26AA4"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: []
    },
    sei: {
      tokens: [
        nullAddress,
        "0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c"
      ],
      owners: ["0x1AD681fa147f35AB7B35c7a289B1938Bc0171e8b"],
      ownTokens: []
    },
    sonic: {
      tokens: [
        nullAddress,
        ADDRESSES.sonic.USDC_e,// usde
        "0x80eede496655fb9047dd39d9f418d5483ed600df",// frxUSD
        "0x0732606cb924d617e2130582704e2d8e2db520a1",// BPT-Gami_scUSD-USDp
        "0x5e0de78aa8f62cba470039ff545423f726c606c4",// USDpfrxUSD
        "0x08417cdb7F52a5021bB4eb6E0deAf3f295c3f182",
        "0xe8a3DA6f5ed1cf04c58ac7f6A7383641e877517b"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: ["0xfD28f108e95f4D41daAE9dbfFf707D677985998E"]
    },
    unichain: {
      tokens: [
        nullAddress,
        "0x9eE1963f05553eF838604Dd39403be21ceF26AA4"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: []
    },
    xdai: {
      tokens: [
        nullAddress,
        "0x9eE1963f05553eF838604Dd39403be21ceF26AA4"
      ],
      owners: ["0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"],
      ownTokens: []
    }
  },
  'treasury/moret': {
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC,//USDC
        ADDRESSES.polygon.WETH_1//weth
      ],
      owners: ['0x015B5FD572De0a7C1478075e1710a0505184520d'],
      ownTokens: ['0x43F2acbaE09272021AFC107180Aa0ee313B00D8F'],
    },
  },
  'treasury/morpho': {
    ethereum: {
      owners: ['0xcBa28b38103307Ec8dA98377ffF9816C164f9AFa'],
      ownTokens: ['0x58D97B57BB95320F9a05dC918Aef65434969c2B2'],
    },
    base: {
      owners: ['0xcba28b38103307ec8da98377fff9816c164f9afa'],
      ownTokens: ['0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842'],
    },
  },
  'treasury/mossethereum': {
    ethereum: {
      tokens: [
        ADDRESSES.ethereum.STETH
      ],
      owners: ['0x80b371b774DCC34083A218b050A27724f4282D07']
    },
  },
  'treasury/mstable': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',//COMP
        '0x4da27a545c0c5B758a6BA100e3a049001de870f5',//stkAAVE
        '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',//icETH
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ENS
        ADDRESSES.ethereum.UNI,//UNI
        '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',//AURA
        ADDRESSES.ethereum.STETH,//stETH
      ],
      owners: ['0x3dd46846eed8D147841AE162C8425c08BD8E1b41', '0xfcf455d6eb48b3289a712c0b3bc3c7ee0b0ee4c6', '0xf6ff1f7fceb2ce6d26687eaab5988b445d0b94a2', '0x67905d3e4fec0c85dce68195f66dc8eb32f59179'],
      ownTokens: ['0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2', '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5'],
    },
  },
  'treasury/mux': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0x029a4a97e892e7270d9b3b90bfef95599bc6bfd6'],
      ownTokens: [],
    },
  },
  'treasury/mycelium': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WETH, //  WETH
        '0x432502a764abec914f940916652ce55885323cda',
      ],
      owners: ['0x9f59e27fd6c8d96dfb89da58c0c98bac07e7a21a'],
      ownTokens: ['0xc74fe4c715510ec2f8c61d70d397b32043f55abe'],
    },
  },
  'treasury/nemesis': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.BUSD,//BUSD
      ],
      owners: ['0xdFFb6FB92E3F54C0DAa59e5af3f47fD58824562a'],
      ownTokens: ['0x8ac9dc3358a2db19fdd57f433ff45d1fc357afb3'],
    },
  },
  'treasury/neptune-mutual': {
    arbitrum: {
      owners: ['0x808ca06eec8d8645386be4293a7f4428d4994f5b'],
      ownTokens: ['0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4'],
      resolveUniV3: true,
    },
  },
  'treasury/neutra-finance': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x422B5A91b5Cdef61D3400671CCdd5bE22C7CE655",
        ADDRESSES.optimism.DAI,
      ],
      owners: ['0xfba3b455211a3a09689788Ac3A14B4F8Baf012B4'],
      ownTokens: ['0xdA51015b73cE11F77A115Bb1b8a7049e02dDEcf0', '0xdeBB612442159b34c24B7BAF20b1CC3218a06925', '0x44F0685482A7180785e309947176C34D0A3d9187'],
    },
  },
  'treasury/nftx': {
    ethereum: {
      owners: ['0x40D73Df4F99bae688CE3C23a01022224FE16C7b2', '0xaA29881aAc939A025A3ab58024D7dd46200fB93D'],
      ownTokens: ['0x87d73E916D7057945c9BcD8cdd94e42A6F47f776'],
    },
  },
  'treasury/notiboy-treasury': {
    algorand: {
      tokens: [
        nullAddress,
        '31566704', //usdc
        '1', // algo

      ],
      owners: ['NOTILXUG675YH2JBO3NP5BXADEWRWHPOM5VBIWE6Z3AQU3QKGKMEPNZJRE'],
    },
  },
  'treasury/notional': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
      ],
      owners: ['0x086b4ecd75c494dd36641195e89c25373e06d7cb'],
      ownTokens: ['0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5'],
    },
  },
  'treasury/nouns': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.RETH,
        ADDRESSES.ethereum.WSTETH //wstETH
      ],
      owners: ['0x0BC3807Ec262cB779b38D65b38158acC3bfedE10', '0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71'],
    },
  },
  'treasury/o2-dao': {
    avax: {
      tokens: [
        '0x321E7092a180BB43555132ec53AaA65a5bF84251',
        '0x7bc2561d69b56fae9760df394a9fa9202c5f1f11',
        '0x0da67235dd5787d67955420c84ca1cecd4e5bb3b',
      ],
      owners: ['0x10c12b7322ac2c5a26bd9929abc6e6b7997570ba'],
      resolveLP: true,
      ownTokens: ['0xaa2439dbad718c9329a5893a51a708c015f76346']
    },
  },
  'treasury/o3-swap': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xb23d6fc44e40e56cb3b0d2c28ba3d7a170a07a49'],
    },
  },
  'treasury/oasisswapdex': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC, //USDC
      ],
      owners: ['0xe0a9B8DeF6d85eb7D828f706635402334D564b0f', '0x8B059bF6cE7c279a5BfEc006F439Db1E5c4A924c'],
    },
  },
  'treasury/omnipair': {
    solana: {
      owners: ["8s6Jdoh7tgUqmU3D2EmpNJHSvuN5U4NybpLAdsiMitwB"],
      ownTokens: ["omfgRBnxHsNJh6YeGbGAmWenNkenzsXyBXm3WDhmeta"]
    },
  },
  'treasury/onixswap': {
    solana: {
      owners: [
        'BheyYMXLPogbJcw2bpKHa7qKFqREQ6rFtn4KqwrjqJ7R',
      ],
    },
  },
  'treasury/open-oceans': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0x61e807038ae880d964a15a57c8cc74a634bccc26'],
    },
  },
  'treasury/openxswap': {
    optimism: {
      tokens: [
        nullAddress,
        '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',//velo
        '0x46f21fDa29F1339e0aB543763FF683D399e393eC'

      ],
      owners: ['0x6b479f4bcf0321c370d266b592fd44eb0fc47ca8'],
      ownTokens: ['0xc3864f98f2a61A7cAeb95b039D031b4E2f55e0e9', '0x2513486f18eeE1498D7b6281f668B955181Dd0D9'],
    },
  },
  'treasury/op-foundation': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC
      ],
      owners: ['0x2501c477d0a35545a387aa4a3eee4292a9a8b3f0', '0xfedfaf1a10335448b7fa0268f56d2b44dbd357de', '0x2a82ae142b2e62cb7d10b55e323acb1cab663a26', '0x19793c7824be70ec58bb673ca42d2779d12581be'],
      ownTokens: [ADDRESSES.optimism.OP],
    },
    ethereum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0x2501c477d0a35545a387aa4a3eee4292a9a8b3f0'],
      ownTokens: [],
    },
  },
  'treasury/ovr': {
    ethereum: {
      owners: ['0x8c19cF0135852BA688643F57d56Be72bB898c411'],
      tokens: [ADDRESSES.ethereum.DAI],
      ownTokens: ['0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697']
    },
  },
  'treasury/paladin-finance': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.USDC,
        '0xba100000625a3754423978a60c9317c58a424e3D',//BAL
        ADDRESSES.ethereum.cvxCRV,
        '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D',//LQTY
        '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68',//INV
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',//ALCX
        '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F',//SDT
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',//3CRV
        '0x4104b135DBC9609Fc1A9490E61369036497660c8',//APY
        ADDRESSES.ethereum.LIDO,
        '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',//AURA
        '0xCdF7028ceAB81fA0C6971208e83fa7872994beE5',//T
        '0x30D20208d987713f46DFD34EF128Bb16C404D10f',//SD
        '0x875773784Af8135eA0ef43b5a374AaD105c5D39e',//IDLE
        '0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4',//GRAI
        '0xBa3335588D9403515223F109EdC4eB7269a9Ab5D',//GEAR

      ],
      owners: ['0xb95A4779CceDc53010EF0df8Bf8Ed6aEB0E8c2B2', '0x1Ae6DCBc88d6f81A7BCFcCC7198397D776F3592E', '0x0482a2d6e2f895125b7237de70c675cd55fe17ca'],
      ownTokens: ['0xab846fb6c81370327e784ae7cbb6d6a6af6ff4bf'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        '0x1509706a6c66CA549ff0cB464de88231DDBe213B',//AURA
        '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8',//BAL
        '0xf0cb2dc0db5e6c66B9a70Ac27B06b878da017028',//OHM
        ADDRESSES.arbitrum.ARB,//ARB
      ],
      owners: ['0x8E4aD455225Dae1A78AB375FCb9eD9d94A4BE859']
    }
  },

  // ----- from batch_a08.js -----
  'treasury/paradex': {
    ethereum: {
      owners: ['0xF1f82188E7D3B54b8872986869D4207F8A78A4F1'],
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDC,
        '0xb32E10022FFBeDfE10bc818a1C7e67D9d87e0fa7',
      ],
      ownTokens: ['0xb32E10022FFBeDfE10bc818a1C7e67D9d87e0fa7'],
    },
  },
  'treasury/paraswap': {
    ethereum: {
      tokens: [nullAddress],
      owners: [
        '0x5A61D9214adEFD7669428a03A4e8734A00E9F464',
        '0x6DF5e7b236a4F14e08C27E09202B4d1865905e9b',
        '0x6a3CCa09b1C2B83834124c8646a68b9Bad2a07b9',
        '0x348aa814a72970e76d5756a2cdA16e7E8F245aAB',
        '0xb074094d2e858b25d129989644248f9f6946e081',
        '0x51d2f2c65d043118eb4329fcbc738943f494609f',
      ],
      ownTokens: ['0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5', '0xcb0e14e96f2cefa8550ad8e4aea344f211e5061d'],
    },
    optimism: {
      tokens: [ADDRESSES.optimism.OP],
      owners: ['0xb8313eaf73aed8fea1d9930df199b3c1bdb67b47'],
    },
    arbitrum: {
      tokens: [ADDRESSES.arbitrum.ARB],
      owners: ['0xfe98240ddAEDF78E278C28F1EdD690ee1a774e66'],
    },
  },
  'treasury/parrot-protocol': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.WBTC,
      ],
      owners: ['0x0B70A2653B6E7BF44A3c80683E9bD9B90489F92A'],
    },
  },
  'treasury/peeps': {
    robinhood: {
      tokens: [nullAddress, ADDRESSES.robinhood.WETH],
      owners: ['0x364716c52a6e1EBF60B4e3dc6610dB1A1c852E7b'],
      ownTokens: ['0xf202dE51BB42A0073948b0971707D14C54Ef5F44'],
    },
  },
  'treasury/pegasusfinance': {
    optimism: {
      tokens: [nullAddress, ADDRESSES.tombchain.FTM],
      owners: ['0x680b96DDC962349f59F54FfBDe2696652669ED60'],
      ownTokens: [],
    },
  },
  'treasury/perion': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        '0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268',
        '0x549020a9Cb845220D66d3E9c6D9F9eF61C981102',
        '0x34Be5b8C30eE4fDe069DC878989686aBE9884470',
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.STETH,
      ],
      owners: ['0x12d73bee50f0b9e06b35fdef93e563c965796482'],
      ownTokens: ['0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268'],
    },
  },
  'treasury/perpetual-protocol': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.FXS,
        '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',
        '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F',
        '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
        ADDRESSES.ethereum.USDC,
        '0xE0e05c43c097B0982Db6c9d626c4eb9e95C3b9ce',
        ADDRESSES.ethereum.DAI,
        '0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a',
      ],
      owners: ['0xD374225abB84DCA94e121F0B8A06B93E39aD7a99'],
      ownTokens: ['0xbC396689893D065F41bc2C6EcbeE5e0085233447'],
    },
  },
  'treasury/piedao': {
    ethereum: {
      tokens: [
        nullAddress,
        '0x31429d1856aD1377A8A0079410B297e1a9e214c2',
        '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26',
        ADDRESSES.ethereum.DAI,
        '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B',
        '0x090185f2135308BaD17527004364eBcC2D37e5F6',
        ADDRESSES.ethereum.SNX,
        '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
        '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68',
        '0x6243d8CEA23066d098a15582d81a598b4e8391F4',
        '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
        '0xa693B19d2931d498c5B318dF961919BB4aee87a5',
        '0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3',
        '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2',
        ADDRESSES.ethereum.GNO,
        '0x01BA67AAC7f75f647D94220Cc98FB30FCc5105Bf',
        '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
        '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
        '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.STETH,
      ],
      owners: ['0x3bCF3Db69897125Aa61496Fc8a8B55A5e3f245d5', '0x267070804c46a47aa92a76d59d70c05d30de46e3'],
      ownTokens: ['0xad32A8e6220741182940c5aBF610bDE99E737b2D', '0xE8846B27988FF52c371D5BD27Bf8DBA4097C93D2'],
    },
  },
  'treasury/piggybank': {
    solana: {
      owners: ['C63SijJLVtiMmzosPmZ23mft4GxXXXTxjmuuu98owx8K'],
      tokens: [ADDRESSES.null, ADDRESSES.solana.USDC],
    },
  },
  'treasury/pizza-city': {
    base: {
      owners: ['0xc6b4694b906EA134595D3400364d7Acc319684ec'],
      ownTokens: ['0x13b628fF6Db92070C0FBad79523240E0f5DeFb07'],
    },
  },
  'treasury/platypus': {
    avax: {
      tokens: [
        nullAddress,
        ADDRESSES.avax.DAI,
        ADDRESSES.avax.SAVAX,
        ADDRESSES.avax.USDC,
        ADDRESSES.avax.USDT_e,
        ADDRESSES.polygon.BUSD,
        ADDRESSES.avax.BTC_b,
        ADDRESSES.avax.USDt,
        '0xF7D9281e8e363584973F946201b82ba72C965D27',
        ADDRESSES.avax.JOE,
        '0x026187BdbC6b751003517bcb30Ac7817D5B766f8',
        ADDRESSES.avax.WAVAX,
        '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
        '0xd9D90f882CDdD6063959A9d837B05Cb748718A05',
        '0x77777777777d4554c39223C354A05825b2E8Faa3',
      ],
      owners: ['0x068e297e8FF74115C9E1C4b5B83B700FdA5aFdEB'],
      ownTokens: ['0x22d4002028f537599bE9f666d1c4Fa138522f9c8'],
    },
  },
  'treasury/pleasrdao': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0x300a902513815028e97FC79E92082Ce6a98d3b74',
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',
        '0xBf9e72eEb5adB8B558334c8672950B7a379D4266',
        '0xBAac2B4491727D78D2b78815144570b9f2Fe8899',
        ADDRESSES.ethereum.USDT,
        '0xc96F20099d96b37D7Ede66fF9E4DE59b9B1065b1',
        '0x4CD0c43B0D53bc318cc5342b77EB6f124E47f526',
        '0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5',
        ADDRESSES.ethereum.DAI,
      ],
      owners: ['0xF5c27c6fE782cbB5c85989ea3e75754748153459', '0xf894fea045eccb2927e2e0cb15c12debee9f2be8'],
      resolveLP: true,
      resolveUniV3: true,
    },
  },
  'treasury/ploutos-money': {
    base: {
      tokens: [nullAddress],
      owners: ['0xB5EB7E9dDe0c299053fbB070dc3aA3f6D67B6Dc8'],
    },
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0xF951ad249532dbb8Dd18be4a158aAbEe3d43523E'],
    },
    polygon: {
      tokens: [nullAddress],
      owners: ['0xBf8F589313239Da1d7946a77D3478eC8A81F8005'],
    },
    katana: {
      tokens: [nullAddress],
      owners: ['0xEC910d10a1A03482d182768583c68aAC3A6B9f29'],
    },
    plasma: {
      tokens: [nullAddress],
      owners: ['0x1A2AD731798FF05eE5E7E814b742c77e6A3BCa33'],
    },
  },
  'treasury/plutusdao': {
    arbitrum: {
      tokens: [nullAddress, '0x10393c20975cF177a3513071bC110f7962CD67da'],
      owners: ['0xBbE98D590d7eB99F4a236587f2441826396053d3'],
      ownTokens: [
        '0x51318B7D00db7ACc4026C88c3952B66278B6A67F',
        '0xD2826Cc00196d8aEe942A4a97D7987C66c17E7BB',
        '0x6CC0D643C7b8709F468f58F363d73Af6e4971515',
        '0x8c1ea32448e09a59f36595abec6207c9ebd590a2',
      ],
    },
  },
  'treasury/p-network': {
    ethereum: {
      tokens: [nullAddress],
      owners: ['0xdd92eb1478d3189707ab7f4a5ace3a615cdd0476'],
      ownTokens: ['0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed', '0xf4eA6B892853413bD9d9f1a5D3a620A0ba39c5b2'],
    },
  },
  'treasury/pop-fi': {
    solana: {
      owners: ['D3T38wVYstKhkSLXdYACGor5fGWBiuqWu9VjDp2XoPDB'],
    },
  },
  'treasury/premia': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.optimism.DAI,
        '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60',
        ADDRESSES.arbitrum.LINK,
        '0x82e3a8f066a6989666b031d916c43672085b1582',
      ],
      owners: ['0xa079c6b032133b95cf8b3d273d27eeb6b110a469', '0x1bEa6d05F78aC077022A154E693F38c6b5113Ae5'],
      ownTokens: ['0x51fc0f6660482ea73330e414efd7808811a57fa2'],
      resolveUniV3: true,
    },
  },
  'treasury/primefi-xyz': {
    ethereum: { owners: ['0xF2e2A49631927108086268c68C559c63c3C8f73d'] },
    base: { owners: ['0xF2e2A49631927108086268c68C559c63c3C8f73d'], ownTokens: ['0x7BBCf1B600565AE023a1806ef637Af4739dE3255'] },
    hyperliquid: { owners: ['0xF2e2A49631927108086268c68C559c63c3C8f73d'], ownTokens: ['0x7BBCf1B600565AE023a1806ef637Af4739dE3255'] },
    xdc: { owners: ['0xF2e2A49631927108086268c68C559c63c3C8f73d'], tokens: [ADDRESSES.null, ADDRESSES.xdc.WXDC], ownTokens: ['0x81B244d0be055EF3BEF1b09B7826Cc2b108B2cBD'] },
  },
  'treasury/primex-finance': {
    polygon: {
      owners: ['0x3c0d3f52e9aa1c9645a05452f45c064a0f9569bf'],
      ownTokens: ['0xdc6d1bd104e1efa4a1bf0bbcf6e0bd093614e31a'],
    },
    arbitrum: {
      owners: ['0x63464916388dab4f2e80551250335490c4518d37'],
      ownTokens: ['0xa533f744b179f2431f5395978e391107dc76e103'],
    },
    ethereum: {
      owners: ['0x893047ea492659418501e3b5868aBe75468e2EB6'],
      ownTokens: ['0xA533f744B179F2431f5395978e391107DC76e103'],
    },
  },
  'treasury/proptech': {
    proptech: {
      owners: ['0x243AC97f37040A7f64a11B84c818cE222A8d3ab7'],
      ownTokens: [tokenMappingNullAddress],
    },
  },
  'treasury/prosper': {
    bsc: {
      tokens: [],
      owners: ['0xb3BbCBd70436c9CAdDf52E2F06732f81DaC1F127'],
      ownTokens: ['0x915424Ac489433130d92B04096F3b96c82e92a9D'],
    },
    bitcoin: {
      owners: bitcoinAddressBook.prosper,
    },
  },
  'treasury/psyoptions': {
    solana: {
      owners: [
        'ENSuopuKKCDgdmT6dXHqJSjeDjUoLXUNikr33e21bNtp',
        'CyDnoEMVuf21v23bxoS2wXxPdCvRR2yFLfymegMH1WY4',
        'E4tuwwYvmB9XWKTmhxeRmywhMmttyDLtMok6jQVAbDLG',
      ],
      ownTokens: ['PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq'],
    },
  },
  'treasury/puff': {
    mantle: {
      tokens: [nullAddress, ADDRESSES.mantle.mETH],
      owners: ['0x940e79c49d73ce46884f57087e0c78b608da57c6'],
      ownTokens: ['0x26a6b0dcdcfb981362afa56d581e4a7dba3be140'],
      uniV3nftsAndOwners: [['0xE9baC8f0100C3229AbddE01D692c6e5791d3b544', '0x940e79c49d73ce46884f57087e0c78b608da57c6']],
    },
  },
  'treasury/push': {
    ethereum: {
      owners: ['0x19Ff5f2C05aC6a303aF6d5002C99686e823EBE72'],
      ownTokens: ['0xf418588522d5dd018b425E472991E52EBBeEEEEE'],
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        '0xAf31Fd9C3B0350424BF96e551d2D1264d8466205',
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.SAFE,
      ],
    },
  },
  'treasury/pyth': {
    solana: {
      owners: [
        'Gx4MBPb1vqZLJajZmsKLg8fGw9ErhoKsR8LeKcCKFyak',
        'GAdn7TZhszf5KTfwNRx3A2nP6KCRFEWucZubgdEqbJA2',
        'CUVeiL7SMWHfNNUKN9nF3DqrQrTwZaBNRN7uUNRcuEgn',
      ],
    },
  },
  'treasury/qidao': {
    arbitrum: {
      tokens: [nullAddress],
      owners: ['0xf32e759d5f1c63ed62042497d3a50f044ee0982b'],
    },
  },
  'treasury/raac': {
    ethereum: {
      tokens: [
        '0xd051c326C9Aef673428E6F01eb65d2C52De95D30',
        '0xC0c17dD08263C16f6b64E772fB9B723Bf1344DdF',
        '0x75939CEb9FBa27A545fE27d1CBd228c29123687c',
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.CRVUSD,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.CVX,
      ],
      owners: ['0x5aD30fcA5A031c850b817f6F4dE1EE2D713EF850'],
      ownTokens: ['0x75939CEb9FBa27A545fE27d1CBd228c29123687c', '0xC0c17dD08263C16f6b64E772fB9B723Bf1344DdF'],
      fetchCoValentTokens: false,
    },
  },
  'treasury/radiant': {
    arbitrum: {
      owners: ['0x750129c21c7846cfe0ce2c966d84c0bca5658497'],
      ownTokens: ['0x3082cc23568ea640225c2467653db90e9250aaa0'],
      tokens: [nullAddress],
    },
  },
  'treasury/raft': {
    ethereum: {
      tokens: [nullAddress, '0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21'],
      owners: ['0x1046BE559A736dca32C55026165902916e406343'],
      ownTokens: ['0x4C5Cb5D87709387f8821709f7a6664f00DcF0C93'],
    },
  },
  'treasury/railgun': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WETH,
        '0x295B42684F90c77DA7ea46336001010F2791Ec8c',
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.FXS,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.CVX,
        '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
        ADDRESSES.ethereum.cvxCRV,
        ADDRESSES.ethereum.FXS,
        '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
        ADDRESSES.ethereum.LUSD,
        '0x090185f2135308BaD17527004364eBcC2D37e5F6',
        ADDRESSES.ethereum.BUSD,
        '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0',
        ADDRESSES.ethereum.SNX,
        '0x509A38b7a1cC0dcd83Aa9d06214663D9eC7c7F4a',
        ADDRESSES.ethereum.INU,
        ADDRESSES.ethereum.LINK,
        '0x21381e026Ad6d8266244f2A583b35F9E4413FA2a',
        ADDRESSES.ethereum.TOKE,
        '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E',
        ADDRESSES.ethereum.MKR,
        '0xc5fb36dd2fb59d3b98deff88425a3f425ee469ed',
        ADDRESSES.ethereum.FRAX,
        '0x2223bF1D7c19EF7C06DAB88938EC7B85952cCd89',
        '0x0f2d719407fdbeff09d87557abb7232601fd9f29',
        '0x7aE1D57b58fA6411F32948314BadD83583eE0e8C',
        '0xf65B5C5104c4faFD4b709d9D60a185eAE063276c',
        '0x3597bfd533a99c9aa083587b074434e61eb0a258',
        '0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25',
        ADDRESSES.ethereum.UNI,
        ADDRESSES.ethereum.MATIC,
        '0x9aE380F0272E2162340a5bB646c354271c0F5cFC',
        '0x07bac35846e5ed502aa91adf6a9e7aa210f2dcbe',
        '0xfb7b4564402e5500db5bb6d63ae671302777c75a',
        '0x33349b282065b0284d756f0577fb39c158f935e6',
        '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
        '0xBC19712FEB3a26080eBf6f2F7849b417FdD792CA',
        '0x34F7Da1243A4Aaa69DE3639a2f124Fa56f4DD5cd',
      ],
      owners: ['0xE8A8B458BcD1Ececc6b6b58F80929b29cCecFF40'],
      ownTokens: ['0xe76c6c83af64e4c60245d8c7de953df673a7a33d'],
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.DAI,
        ADDRESSES.bsc.USDT,
        '0x39cC67690D0F2d4aCD68d3d9B612a80D780b84c0',
        '0xbF7c81FFF98BbE61B40Ed186e4AfD6DDd01337fe',
        ADDRESSES.bsc.USDC,
        '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        '0xAdBAF88B39D37Dc68775eD1541F1bf83A5A45feB',
        '0xBfACD29427fF376FF3BC22dfFB29866277cA5Fb4',
        '0x9A2f5556e9A637e8fBcE886d8e3cf8b316a1D8a2',
        '0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51',
      ],
      owners: ['0xdca05161eE5b5FA6DF170191c88857E70FFB4094'],
      ownTokens: [],
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.DAI,
        '0x1a3acf6D19267E2d3e7f898f42803e90C9219062',
        ADDRESSES.polygon.WBTC,
        '0xE5417Af564e4bFDA1c483642db72007871397896',
        '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b',
        '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
        '0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1',
        ADDRESSES.polygon.WMATIC_2,
        '0x752d59604d72b6DC44196f4A39A3f07779417407',
        '0x8f006D1e1D9dC6C98996F50a4c810F17a47fBF19',
        ADDRESSES.fantom.renBTC,
        '0x9c891326Fd8b1a713974f73bb604677E1E63396D',
        ADDRESSES.polygon.FRAX,
        '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
        '0x580A84C73811E1839F75d86d75d88cCa0c241fF4',
        '0x980111ae1B84E50222C8843e3A7a038F36Fecd2b',
        ADDRESSES.polygon.QUICK,
        '0x6C0AB120dBd11BA701AFF6748568311668F63FE0',
        '0xE0339c80fFDE91F3e20494Df88d4206D86024cdF',
      ],
      owners: ['0xdca05161eE5b5FA6DF170191c88857E70FFB4094'],
      ownTokens: ['0x92A9C92C215092720C731c96D4Ff508c831a714f'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.USDC,
      ],
      owners: ['0x3B374464a714525498e445ba050B91571937bFc8'],
      ownTokens: [],
    },
  },

  // ----- from batch_a09.js -----
  'treasury/rain': {
    arbitrum: {
      tokens: [
        nullAddress,
        '0x25118290e6a5f4139381d072181157035864099d', // rain token
      ],
      owners: [
        '0x7B72bE69F99c0C9D9832Ed6c88e4397E44673Af8',
        '0x0dfa27721205B73B363F55F367Ae8F0186ef6945',
        '0x54FD139E709EFf1E115C5163B9ad449bEC2A09D0',
        '0x569d407185d56B7cdC430d3F93e6DF9526cEEbC5',
        '0xdAA24e672077a089A072fC15AD78ef644ADD06C4',
        '0x05195b8Bd66D8306c3Dc01df6401E5826FEf76A5',
        '0xac2856951ab04FBD79b0FD7Ea426989CbfBF7752',
        '0xaB675ec35AAE0B93D38364f52739a14A0fAcd64e',
        '0xD804C416664F9E638D6A07417fCA6119b0CD0f88',
        '0xE12131C2334449F1e605B34bF7876480A06D3cB2',
        '0xA49f84688F6b9600A9fCf0C8D3A6a1F1593E1AD3',
        '0xFf027fF0Fcd426DcB8EA648430f1588f9C976bAe',
      ],
      ownTokens: ['0x25118290e6a5f4139381d072181157035864099d'],
    },
  },
  'treasury/rarible': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        ADDRESSES.ethereum.DAI, //DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3', //aDAI
        ADDRESSES.ethereum.WETH, //WETH
        ADDRESSES.ethereum.USDT, //USDT
      ],
      owners: ['0xFDfF6b56CcE39482032b27140252FF4F16432785', '0x1cf0dF2A5A20Cd61d68d4489eEBbf85b8d39e18a'],
      ownTokens: ['0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF'],
    },
  },
  'treasury/realms': {
    ethereum: {
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.WETH,
      ],
      owners: ['0xa8e6efaf015d424c626cf3c23546fcb3bd2c9f1a'],
      ownTokens: ['0x686f2404e77ab0d9070a46cdfb0b7fecdd2318b0'], // LORDS GOVERNANCE TOKEN
    },
  },
  'treasury/redacted': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        '0x2ba592F78dB6436527729929AAf6c908497cB200', // CREAM
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.SAFE,
        '0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434',
        ADDRESSES.ethereum.DAI,
        '0xaCe78D9BaB82b6B4783120Dba82aa10B040A14D9',
        '0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC',
        ADDRESSES.ethereum.CRV,
      ],
      ownTokens: ['0xc55126051B22eBb829D00368f4B12Bde432de5Da', '0x6DF0E641FC9847c0c6Fde39bE6253045440c14d3'],
      owners: [
        '0x086c98855df3c78c6b481b6e1d47bef42e9ac36b',
        '0xa52fd396891e7a74b641a2cb1a6999fcf56b077e',
        '0x42e39157ec770197013e619c0eea8e1139f332db',
        '0xa722ebccd25adb06e5d0190b240d1f4039839822',
      ],
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP,
        '0xaf9fe3b5ccdae78188b1f8b9a49da7ae9510f151', // DHT
        ADDRESSES.optimism.USDC,
        '0x3f56e0c36d275367b8c502090edf38289b3dea0d', // QI
        '0x97513e975a7fa9072c72c92d8000b0db90b163c5', //BEETS
        '0x39fde572a18448f8139b7788099f0a0740f51205', //OATH
        '0x00a35fd824c717879bf370e70ac6868b95870dfb', //IB
        '0x3c8b650257cfb5f272f799f5e2b4e65093a11a05', //VELO
      ],
      owners: ['0x2e33a660742e813ad948fb9f7d682fe461e5fbf3'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDC,
        '0x10393c20975cf177a3513071bc110f7962cd67da', // JONES
      ],
      owners: ['0x64769c53ff91b83fe9830776a4b85a1f4e1edaad'],
    },
  },
  'treasury/relay': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xf803dce584b7ecb57f90af0b85e67dac7e0da6d9'],
    },
  },
  'treasury/reppo': {
    base: {
      tokens: [
        ADDRESSES.null,
        ADDRESSES.base.cbBTC,
      ],
      owners: ['0x5996b5c566680c0257a9b683807813dea98cf39e'],
      ownTokens: ['0xFf8104251E7761163faC3211eF5583FB3F8583d6'],
    },
  },
  'treasury/request-network': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202', // KNC
        ADDRESSES.ethereum.SAFE,
        '0x4da27a545c0c5b758a6ba100e3a049001de870f5', // stkAAVE
      ],
      owners: ['0x0632dcc37b1FAbf2CaD20538A5390D23C830962e'],
      ownTokens: ['0x8f8221afbb33998d8584a2b05749ba73c37a938a'], // RFQ GOVERNANCE TOKEN
    },
  },
  'treasury/resupply': {
    ethereum: {
      owners: ['0x4444444455bF42de586A88426E5412971eA48324'],
      ownTokens: [
        '0x57aB1E0003F623289CD798B1824Be09a793e4Bec', //reUSD
        '0x419905009e4656fdC02418C7Df35B1E61Ed5F726', //RSUP
      ],
      blacklistedTokens: ['0xEe351f12EAE8C2B8B9d1B9BFd3c5dd565234578d'],
    },
  },
  'treasury/revoke': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.DAI,
        ADDRESSES.optimism.WETH,
        ADDRESSES.optimism.USDT,
        ADDRESSES.optimism.USDC,
        '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4', //snx
      ],
      owners: ['0xe126b3E5d052f1F575828f61fEBA4f4f2603652a'],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', //ens
        '0xDd1Ad9A21Ce722C151A836373baBe42c868cE9a4', //ubi
        '0x7aE1D57b58fA6411F32948314BadD83583eE0e8C', //paper
        '0xb24cd494faE4C180A89975F1328Eab2a7D5d8f11', //code
        '0x6243d8CEA23066d098a15582d81a598b4e8391F4', //flx
        '0xc4De189Abf94c57f396bD4c52ab13b954FebEfD8', //b20
        '0xad32A8e6220741182940c5aBF610bDE99E737b2D', //dough
        '0x90DE74265a416e1393A450752175AED98fe11517', //udt
        '0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69', //iotx
        '0x5dD57Da40e6866C9FcC34F4b6DDC89F1BA740DfE', //bright
        '0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d', //fox
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF', //alcx
        '0x4F14cDBd815B79E9624121f564f24685c6B1211b', //anfd
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498', //zrx
        '0x7b35Ce522CB72e4077BaeB96Cb923A5529764a00', //imx
      ],
      owners: ['0xe126b3E5d052f1F575828f61fEBA4f4f2603652a'],
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.BUSD, //busd
        '0xF68C9Df95a18B2A5a5fa1124d79EEEffBaD0B6Fa', //any
      ],
      owners: ['0xe126b3E5d052f1F575828f61fEBA4f4f2603652a'],
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDT, //usdt
        ADDRESSES.polygon.DAI, //dai
        ADDRESSES.polygon.USDC, //usdc
        '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4', //ammatic
      ],
      owners: ['0xe126b3E5d052f1F575828f61fEBA4f4f2603652a'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.ARB, //arb
        '0x539bdE0d7Dbd336b79148AA742883198BBF60342', //magic
        ADDRESSES.arbitrum.USDC, //usdc
        '0x1F52145666C862eD3E2f1Da213d479E61b2892af', //fuc
      ],
      owners: ['0xe126b3E5d052f1F575828f61fEBA4f4f2603652a'],
    },
    arbitrum_nova: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.DAI, //dai
      ],
      owners: ['0xe126b3E5d052f1F575828f61fEBA4f4f2603652a'],
    },
    xdai: {
      tokens: [
        nullAddress,
        '0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9', //hny
      ],
      owners: ['0xe126b3E5d052f1F575828f61fEBA4f4f2603652a'],
    },
  },
  'treasury/rezerve': {
    sonic: {
      tokens: [
        nullAddress,
        '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
        ADDRESSES.sonic.USDC_e,
        ADDRESSES.sonic.scUSD,
      ],
      owners: ['0x0E43DF9F40Cc6eEd3eC70ea41D6F34329fE75986'],
      ownTokens: ['0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5'],
      resolveLP: true,
    },
    ethereum: {
      tokens: [
        nullAddress,
        '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
        ADDRESSES.sonic.USDC_e,
        ADDRESSES.sonic.scUSD,
      ],
      owners: ['0x0E43DF9F40Cc6eEd3eC70ea41D6F34329fE75986'],
      ownTokens: ['0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5'],
      resolveLP: true,
    },
  },
  'treasury/ribbon': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.LIDO,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.RETH,
        ADDRESSES.ethereum.STETH,
        '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
        '0x4d224452801ACEd8B2F0aebE155379bb5D594381', // APE
        '0x090185f2135308BaD17527004364eBcC2D37e5F6', // SPELL
        ADDRESSES.ethereum.UNI,
        ADDRESSES.ethereum.SAFE,
        '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE', // yvUSDC
        '0x25751853Eab4D0eB3652B5eB6ecB102A2789644B', // rETH-THETA
      ],
      owners: ['0xDAEada3d210D2f45874724BeEa03C7d4BBD41674', '0x42c1357aaa3243ea30c713cdfed115d09f10a71d', '0x6adeb4fddb63f08e03d6f5b9f653be8b65341b35'],
      ownTokens: [
        '0x6123B0049F904d730dB3C36a31167D9d4121fA6B',
        '0xd590931466cdD6d488A25da1E89dD0539723800c', // 50RBN-50USDC
        ADDRESSES.ethereum.AEVO,
      ],
    },
  },
  'treasury/rifts': {
    solana: {
      owners: [
        '5NrHu6zpWqYT6LH74WmTNFHGcxZEmRMVK4hR7sHjS9Fc',
      ],
      ownTokens: [
        'HjBMk5rABYdAvukYRvrScBnP9KnN9nLdKSbN2QPppump', // RIFT
      ],
    },
  },
  'treasury/rootstock-collective': {
    rsk: {
      tokens: [
        nullAddress,
      ],
      owners: [
        '0x48229e5D82a186Aa89a99212D2D59f5674aa5b6C',
        '0xf016fA6B237BB56E3AEE7022C6947a6A103E3C47',
        '0x267a6073637408b6A1d34d685ff5720A0CbCbD9d',
        '0xfE3d9B7D68aE13455475F28089968336414FD358',
      ],
      ownTokens: ['0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5'], // RIF
    },
  },
  'treasury/rotki': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
        '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4',
        '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC',
        ADDRESSES.ethereum.sUSD,
        ADDRESSES.ethereum.MKR,
      ],
      owners: ['0x9531C059098e3d194fF87FebB587aB07B30B1306'],
      ownTokens: [],
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.USDT,
        ADDRESSES.optimism.OP,
      ],
      owners: ['0x9531C059098e3d194fF87FebB587aB07B30B1306'],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.DAI,
        ADDRESSES.arbitrum.WETH,
      ],
      owners: ['0x9531C059098e3d194fF87FebB587aB07B30B1306'],
    },
  },
  'treasury/router': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xdb8f4c4c68e5e5eb501fee1adaa87ee767bcade7'],
    },
  },
  'treasury/rubicon': {
    ethereum: {
      tokens: [nullAddress],
      owners: [
        '0x752748deaf25cf58b60d4c4209d7f200aee4ef14', // protocol fee EOA (same address on all 4 chains)
        '0x8c1ACB63a021BD8c990744C07bc53A3Ec3C03af4', // treasury Safe (2-of-3, same address + owners on all 4 chains)
      ],
      ownTokens: ['0x7483e83b481c69a93cb025395194e0dc4F32d9C4'], // RUBI (canonical L1 token)
    },
    optimism: {
      tokens: [nullAddress],
      owners: [
        '0x752748deaf25cf58b60d4c4209d7f200aee4ef14',
        '0x8c1ACB63a021BD8c990744C07bc53A3Ec3C03af4',
      ],
    },
    arbitrum: {
      tokens: [nullAddress],
      owners: [
        '0x752748deaf25cf58b60d4c4209d7f200aee4ef14',
        '0x8c1ACB63a021BD8c990744C07bc53A3Ec3C03af4',
      ],
    },
    base: {
      tokens: [
        nullAddress,
        '0xd8eDF10E243e2A176789D2AD1CB47151e76e8865', // Aquila WETH/RUBI LP (accrued by fee collector)
        '0xa883C11a3742f74F0b29750764146e8675306e24', // Aquila USDC/RUBI LP (accrued by fee collector)
      ],
      resolveLP: true, // Aquila (uniV2 fork) factory.feeTo() mints LP tokens to the fee collector
      owners: [
        '0x752748deaf25cf58b60d4c4209d7f200aee4ef14',
        '0x8c1ACB63a021BD8c990744C07bc53A3Ec3C03af4',
        '0x1db5b42e760072bd981ae67435f73884aa659cba', // Aquila Base fee collector (accumulator, never forwards)
      ],
      ownTokens: ['0xb3836098d1e94EC651D74D053d4a0813316B2a2f'], // RUBI on Base (protocol listing token)
      uniV3nftsAndOwners: [
        ['0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', '0x8c1ACB63a021BD8c990744C07bc53A3Ec3C03af4'], // canonical UniV3 NFPM
        ['0xF75a94E360502618c838219f8954Ce8b7666b42F', '0x8c1ACB63a021BD8c990744C07bc53A3Ec3C03af4'], // Rubicon CLMM NFPM
      ],
    },
  },
  'treasury/saddle': {
    arbitrum: {
      tokens: [
        '0x5575552988a3a80504bbaeb1311674fcfd40ad4b',
        '0x2cab3abfc1670d1a452df502e216a66883cdf079',
        ADDRESSES.arbitrum.FRAX,
        ADDRESSES.arbitrum.USDC,
      ],
      owners: ['0x8e6e84ddab9d13a17806d34b097102605454d147'],
      ownTokens: [],
    },
  },
  'treasury/safe': {
    optimism: {
      tokens: [nullAddress, ADDRESSES.optimism.OP],
      owners: ['0x3EDf6868d7c42863E44072DaEcC16eCA2804Dea1'],
    },
    ethereum: {
      tokens: [nullAddress],
      owners: [
        '0x1d4f25bc16b68c50b78e1040bc430a8097fd6f45',
        '0x0b00b3227a5f3df3484f03990a87e02ebad2f888',
        '0xd28b432f06cb64692379758B88B5fCDFC4F56922',
      ],
      ownTokens: [ADDRESSES.ethereum.SAFE],
    },
  },
  'treasury/sakai-vault': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.USDT,
      ],
      owners: ['0x6b269c07e8f94f0fa1769cbd362879afea0206db'],
      ownTokens: ['0x43B35e89d15B91162Dea1C51133C4c93bdd1C4aF'],
    },
  },
  'treasury/saltyio': {
    ethereum: {
      owners: ['0x35fdBd5b52D131629EA5403FF1bc7ff6A1869D60'],
      ownTokens: ['0x0110B0c3391584Ba24Dbf8017Bf462e9f78A6d9F'],
    },
  },
  'treasury/sandclock': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.LUSD,
      ],
      owners: ['0x035F210e5d14054E8AE5A6CFA76d643aA200D56E'],
      ownTokens: ['0xba8a621b4a54e61c442f5ec623687e2a942225ef'],
    },
  },
  'treasury/savvy': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDC_CIRCLE,
      ],
      owners: ['0x4f54cab19b61138e3c622a0bd671c687481ec030'],
      ownTokens: ['0x43aB8f7d2A8Dd4102cCEA6b438F6d747b1B9F034'],
    },
  },
  'treasury/sentry-trading': {
    robinhood: {
      tokens: [nullAddress],
      owners: ['0x8852BC7Ca269c276264b8Ad7869956C26304a740'],
    },
  },
  'treasury/sharplink-gaming': {
    ethereum: {
      tokens: [
        nullAddress,
        '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549', // LsETH
      ],
      owners: ['0x0b26C05866e6353E46f4A7e2d10Cb42d4B583E57', '0x353657ACd92f4C83a9DbA7Cdab84289EffFA4FeB', '0xd6BcA7F5F7f1Be0494DcD2Da16381176DA425131'],
    },
    linea: {
      tokens: [
        '0x1Bf74C010E6320bab11e2e5A532b5AC15e0b8aA6', // weETH,
      ],
      owners: ['0x5e3b62E38808Fc9582C23bC05E8a19A091D979c9', '0x0323500C3F2e29F7B7f42f83d7646A5B3D0591b1'],
    },
  },
  'treasury/shiny': {
    base: {
      tokens: [
        ADDRESSES.base.USDC,
      ],
      owners: ['0x8210c4a20dfA79F555560F77dc72BD7A846a3eF1'],
    },
    abstract: {
      tokens: [
        ADDRESSES.abstract.USDC,
      ],
      owners: ['0x8210c4a20dfA79F555560F77dc72BD7A846a3eF1'],
    },
  },
  'treasury/silent-protocol': {
    ethereum: { owners: ['0x305a2694dD75ecb7D6ACbf0Efcd55278c992eEB9'] },
  },
  'treasury/singularity-finance': {
    ethereum: {
      owners: [
        '0xaeb2a9be7b2429572f6b4baaf3c33d2b0653a45d',
        '0x772a84869a55d483d507ae238fba4587fc41e674',
        '0x63b514e5ef28cfe16f096de47e6c79ca073ef5fa',
        '0xeb18e9464516ae2e68202a9cca255a23157bf186',
        '0xdfdca55a5a07e154f18368893692ddd7c0243d4c',
      ],
      ownTokens: ['0x7636D8722Fdf7cd34232a915E48e96aA3eB386BF'],
    },
  },
  'treasury/snapshot': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC, // USDC
        ADDRESSES.optimism.OP,
      ],
      owners: ['0x3E87e5BCE4dEb09FeE5045EF15E18f873212E6A7'],
      ownTokens: [],
    },
  },
  'treasury/spark': {
    ethereum: {
      owners: ['0x3300f198988e4c9c63f75df86de36421f06af8c4'],
      ownTokens: ['0xc20059e0317DE91738d13af027DfC4a50781b066'],
    },
  },
  'treasury/spartacus': {
    fantom: {
      tokens: [
        nullAddress,
        '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', //DAI
        ADDRESSES.fantom.WFTM, //WFTM
      ],
      owners: ['0x8CFA87aD11e69E071c40D58d2d1a01F862aE01a8'],
      ownTokens: ['0x5602df4a94eb6c680190accfa2a475621e0ddbdc'],
    },
  },
  'treasury/sperax': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0x8898a38eb8e3104f7c98622b55260e014b3a0217'],
      ownTokens: [],
    },
  },

  // ----- from batch_a10.js -----
  'treasury/sphere-finance': {
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.WMATIC_1,
        "0x236eeC6359fb44CCe8f97E99387aa7F8cd5cdE1f",
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.WMATIC,
        ADDRESSES.polygon.USDC
      ],
      owners: ["0x20d61737f972eecb0af5f0a85ab358cd083dd56a", "0x1a2ce410a034424b784d4b228f167a061b94cff4", "0x826b8d2d523e7af40888754e3de64348c00b99f4", "0x74b514bc1b9480e1daca0f83a1e42b86291eadef", "0x79e51953f023df68fc46170d1ee47fd5a49d3b6e"],
      ownTokens: ["0x17e9C5b37283ac5fBE527011CeC257b832f03eb3", "0x8D546026012bF75073d8A586f24A5d5ff75b9716"],
    },
    bsc: {
      tokens: [
        nullAddress,
        "0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65",
        "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
        ADDRESSES.bsc.BUSD,
        "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11"
      ],
      owners: ["0x124e8498a25eb6407c616188632d40d80f8e50b0"],
      ownTokens: [],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        "0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65",
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.GMX,
        ADDRESSES.arbitrum.WBTC,
        "0x15b2fb8f08E4Ac1Ce019EADAe02eE92AeDF06851",
      ],
      owners: ["0xA6efac6a6715CcCE780f8D9E7ea174C4d85dbE02"],
      ownTokens: [],
      resolveUniV3: true,
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.USDC,
        "0x73cb180bf0521828d8849bc8CF2B920918e23032"
      ],
      owners: ["0x93b0a33911de79b897eb0439f223935af5a60c24"],
      ownTokens: [],
    },
  },
  'treasury/spherium': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ["0x2c41fb81cfc64cd1373058f2a13289819641d223"],
    },
  },
  'treasury/spiral-dao': {
    ethereum: {
      owners: ['0xc47ec74a753acb09e4679979afc428cde0209639'],
      ownTokens: ['0x85b6acaba696b9e4247175274f8263f99b4b9180'],
      tokens: [],
    },
  },
  'treasury/spookyswap': {
    fantom: {
      tokens: [
        nullAddress,
        "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", // DAI
        "0x74b23882a30290451A17c44f4F05243b6b58C76d", // ETH
        "0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e", // BEETS
        ADDRESSES.fantom.WFTM, // WFTM
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
      ],
      owners: ["0x1A11f5DF739bEca4974aCE4d8E5CE5ef5D854889"],
      ownTokens: ["0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE"],
    },
  },
  'treasury/spool-protocol': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDC
      ],
      owners: ["0xf6bc2e3b1f939c435d9769d078a6e5048aabd463"],
      ownTokens: ["0x40803cEA2b2A32BdA1bE61d3604af6a814E70976", "0xF3b675df63FB4889180d290A338fc15C0766fd64"],
    },
  },
  'treasury/ssv-dao': {
    ethereum: {
      owners: ["0xb35096b074fdb9bBac63E3AdaE0Bbde512B2E6b6"],
      ownTokens: [
        "0x9d65ff81a3c488d585bbfb0bfe3c7707c7917f54", // SSV
      ],
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.ETHFI,
        ADDRESSES.ethereum.SAFE,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.DAI,
      ],
    },
  },
  'treasury/stargate': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", // 3CRV DAI/USDC/USDT
        "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
        ADDRESSES.ethereum.cvxCRV,
        ADDRESSES.ethereum.SAFE,
        "0xFCc5c47bE19d06BF83eB04298b026F81069ff65b", // yCRV
        "0x616e8BfA43F920657B3497DBf40D6b1A02D4608d", // auraBAl
        "0xA13a9247ea42D743238089903570127DdA72fE44", // bb-a-USD
        ADDRESSES.ethereum.cvxFXS,
        "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC", // crvFRAX
        "0xfA0F307783AC21C39E939ACFF795e27b650F6e68", // S*FRAX
        "0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d", // S*DAI
        "0x692953e758c3669290cb1677180c64183cEe374e", // S*USDD
        "0xE8F55368C82D38bbbbDb5533e7F56AfC2E978CC2", // S*LUSD
        "0x9cef9a0b1bE0D289ac9f4a98ff317c33EAA84eb8", // S*MAI
        "0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7", // sdFRAX3CRV-f
        "0x7f50786A0b15723D741727882ee99a0BF34e3466", // sdCRV-gauge
        "0x101816545F6bd2b1076434B54383a1E633390A2E", // S*SGETH
        "0x590d4f8A68583639f215f675F3a259Ed84790580", // S*sUSD
        "0x38EA452219524Bb87e18dE1C24D3bB59510BD783", // S*USDT
        "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56", // S*USDC
      ],
      ownTokens: [
        "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6", // STG
        "0x341bb10D8f5947f3066502DC8125d9b8949FD3D6", // yvCurve-STG-USDC
        "0x9de1c3D446237ab9BaFF74127eb4F303802a2683", // STG/FRAXBP-f
        "0x95d16646311fDe101Eb9F897fE06AC881B7Db802", // STGUSDC-f-gauge
        "0xaa8D332531B5B953938AA412730e7536178b4783", // aura50STG-50bb-a-USD-vault
        "0x6cCA86CC27EB8c7C2d10B0672FE392CFC88e62ff", // STG-USDC Cake-LP
        "0xA89B9c336764c9Ae5f64Bc19688601341974bc22", // sdSTGUSDC-f-gauge
      ],
      owners: ["0x65bb797c2B9830d891D87288F029ed8dACc19705"],
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.USDT,
        "0x98a5737749490856b401DB5Dc27F522fC314A4e1", // S*BUSD
        "0x4e145a589e4c03cBe3d28520e4BF3089834289Df", // S*USDD
        "0x7BfD7f2498C4796f10b6C611D9db393D3052510C", // S*MAI
        "0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda", // S*USDT
      ],
      ownTokens: [
        "0xBCEA09e9e882eC2Bb6dCE07c4e6669968846CaBD", // STG-BUSD Cake-LP
        "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b", // STG
      ],
      owners: ["0x6e690075eedBC52244Dd4822D9F7887d4f27442F"],
    },
    avax: {
      tokens: [
        nullAddress,
        "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea", // S*FRAX
        ADDRESSES.avax.USDC,
        "0x8736f92646B2542B3e5F3c63590cA7Fe313e283B", // S*MAI
        "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", // S*USDt
        "0xEAe5c2F6B25933deB62f754f239111413A0A25ef", // S*USDt
        "0x1205f31718499dBf1fCa446663B532Ef87481fe1", // S*USDC
      ],
      ownTokens: [
        ADDRESSES.fuse.WETH_3, // STG
        "0x330f77BdA60D8daB14d2bb4F6248251443722009", // STG-USDC JLP
      ],
      owners: ["0x2B065946d41ADf43BBc3BaF8118ae94Ed19D7A40"],
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC,
        "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea", // S*DAI
        "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", // S*USDT
        "0x8736f92646B2542B3e5F3c63590cA7Fe313e283B", // S*miMATIC
        "0x9E2d266D6c90F6C0D80a88159b15958f7135B8Af", // SSX
        "0x1205f31718499dBf1fCa446663B532Ef87481fe1", // S*USDC
      ],
      ownTokens: [
        ADDRESSES.fuse.WETH_3, // STG
        "0xA34Ec05DA1E4287FA351c74469189345990a3F0C", // STG-USDC SLP
      ],
      owners: ["0x47290DE56E71DC6f46C26e50776fe86cc8b21656"],
    },
    arbitrum: {
      owners: ["0x9CD50907aeb5D16F29Bddf7e1aBb10018Ee8717d"],
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C", // S*FRAX
        "0xF39B7Be294cB36dE8c510e267B82bb588705d977", // S*MAI
        "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e", // S*SGETH
        "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641", // S*USDT
        "0x892785f33CdeE22A30AEF750F285E18c18040c3e", // S*USDC
      ],
      ownTokens: [
        "0x6694340fc020c5E6B96567843da2df01b2CE1eb6", // STG
        "0x3a4c6D2404b5eb14915041e01F63200a82f4a343", // 50STG-50USDC
      ],
    },
    optimism: {
      owners: ["0x392AC17A9028515a3bFA6CCe51F8b70306C6bd43"],
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.USDC,
        "0x165137624F1f692e69659f944BF69DE02874ee27", // S*DAI
        "0x368605D9C6243A80903b9e326f1Cddde088B8924", // S*FRAX
        "0x3533F5e279bDBf550272a199a223dA798D9eff78", // S*LUSD
        "0x5421FA1A48f9FF81e4580557E86C7C0D24C18036", // S*MAI
        "0xd22363e3762cA7339569F3d33EADe20127D5F98C", // S*SGETH
        "0x2F8bC9081c7FCFeC25b9f41a50d97EaA592058ae", // S*sUSD
        "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298", // S*USDC
      ],
      ownTokens: [
        "0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97", // STG
        "0xec376c3856a4232bB6Ed9752d29402DDCD09A9A3", // STG/USDC RAKIS-5
        "0xE7D2E422098D8b3AF11695A734d347563ae160Cb", // bb-STG-USD-gauge
      ],
      resolveUniV3: true,
    },
    fantom: {
      owners: ["0x2351BBCb7cF7Ee9D18AF2Be0d106BFc5D47A9E85"],
      tokens: [
        nullAddress,
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        "0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97", // S*USDC
      ],
      ownTokens: [
        ADDRESSES.fuse.WETH_3, // STG
        "0x0a80C53AfC6DE9dfB2017781436BfE5090F4aCB4", // STG-USDC spLP
      ],
    },
    metis: {
      owners: ["0x90c3DFD4Ea593336DBB9F925f73413e6EE84c90E"],
      tokens: [
        ADDRESSES.metis.Metis,
      ],
      ownTokens: [],
    },
  },
  'treasury/stargate-finance': {
    bsc: {
      owner: '0xA2B48Ad28c09cc64CcCf9eD73e1EfceD052877d5',
      tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.BUSD, '0xd397a40884ce00e662b419673e0b15cae628877f', '0x41516dca7efe69518ec414de35e5aa067788de3d',],
      resolveLP: true,
    }
  },
  'treasury/status': {
    ethereum: {
      owners: [
        '0xA646E29877d52B9e2De457ECa09C724fF16D0a2B',
        '0xBBF0cC1C63F509d48a4674e270D26d80cCAF6022'
      ],
      tokens: [
        nullAddress,
      ],
      ownTokens: ["0x744d70fdbe2ba4cf95131626614a1763df805b9e"], // SNT
    },
  },
  'treasury/stealcam': {
    arbitrum: {
      owners: ['0x2f60c9cee6450a8090e17a79e3dd2615a1c419eb',],
      tokens: [
        nullAddress,
      ],
    },
  },
  'treasury/stockworks': {
    robinhood: {
      owners: ['0x57024Aae99f709Bd399252767DDC6487Aa3881De'],
      tokens: [nullAddress, '0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa'],
    }
  },
  'treasury/stonkbrokers': {
    robinhood: {
      owners: ['0x16027b596e210c63f750E0bdD156f00bb2749868'],
      tokens: [nullAddress],
      ownTokens: ['0xe934e36A439C94017B64a3FecE66AF12099aBF50']
    }
  },
  'treasury/stout': {
    sonic: {
      owners: ['0x12684d18BDBA8e31936f40aBcE1175366874114f',],
      tokens: [
        nullAddress,
        ADDRESSES.sonic.USDC_e
      ],
    },
  },
  'treasury/sudoswap': {
    ethereum: {
      owners: ["0xb16c1342E617A5B6E4b631EB114483FDB289c0A4", "0xA020d57aB0448Ef74115c112D18a9C231CC86000", "0x6853f8865BA8e9FBd9C8CCE3155ce5023fB7EEB0"],
      ownTokens: ["0x3446Dd70B2D52A6Bf4a5a192D9b0A161295aB7F9"],
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.FRAX,
        "0xb23d80f5FefcDDaa212212F028021B41DEd428CF", //PRIME
      ],
    },
  },
  'treasury/sushiswap': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
      ],
      owners: [
        "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3",
        "0xf73B31c07e3f8Ea8f7c59Ac58ED1F878708c8A76"
      ],
      ownTokens: [
        ADDRESSES.ethereum.SUSHI,
        "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
      ],
    },
  },
  'treasury/synapse': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.optimism.DAI,
        ADDRESSES.arbitrum.nUSD,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.USDC,
      ],
      owners: ["0x1d9bfc24d9e7eeda4119ceca11eaf4c24e622e62", "0x940279D22EB27415F2b0A0Ee6287749b5B19F43D"],
      ownTokens: ["0x080F6AEd32Fc474DD5717105Dba5ea57268F46eb"]
    },
    avax: {
      tokens: [
        nullAddress,
        ADDRESSES.avax.WAVAX,
        ADDRESSES.avax.DAI,
        ADDRESSES.avax.USDC_e,
        ADDRESSES.avax.USDT_e,
      ],
      owners: ["0xd7aDA77aa0f82E6B3CF5bF9208b0E5E1826CD79C"],
      ownTokens: ["0x1f1E7c893855525b303f99bDF5c3c05Be09ca251"]
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.BUSD,
        "0x049d68029688eabf473097a2fc38ef61633a3c7a",
        ADDRESSES.bsc.BTCB,
        "0x54261774905f3e6E9718f2ABb10ed6555cae308a",//anybtc
        "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096",//nrv
        ADDRESSES.bsc.USDT,
        "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",//ustc
      ],
      owners: ["0xA316d83e67EEfD136f4C077de1cD4163A681F8A8"]
    },
    fantom: {
      tokens: [
        nullAddress,
        "0x74b23882a30290451A17c44f4F05243b6b58C76d",//eth
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        ADDRESSES.fantom.WFTM,
      ],
      owners: ["0x224002428cF0BA45590e0022DF4b06653058F22F"],
      ownTokens: ["0xE55e19Fb4F2D85af758950957714292DAC1e25B2"]
    },
    harmony: {
      tokens: [
        nullAddress
      ],
      owners: ["0x0172e7190Bbc0C2Aa98E4d1281d41D0c07178605"]
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f",//gohm
        ADDRESSES.ethereum.FRAX,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
        "0x98585dFc8d9e7D48F0b1aE47ce33332CF4237D96",//newo
        "0x71Ab77b7dbB4fa7e017BC15090b2163221420282",//high
        ADDRESSES.ethereum.WBTC,
        "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F",//sdt
        "0xBAac2B4491727D78D2b78815144570b9f2Fe8899",//dog
        "0x02B5453D92B730F29a86A0D5ef6e930c4Cf8860B",//usdb
        "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",//ageur
        "0x0642026E7f0B6cCaC5925b4E7Fa61384250e1701",//h2o
        "0xb753428af26E81097e7fD17f40c88aaA3E04902c",//sfi
        ADDRESSES.ethereum.LINK,
      ],
      owners: ["0x67F60b0891EBD842Ebe55E4CCcA1098d7Aac1A55"],
      ownTokens: ["0x0f2D719407FdBeFF09D87557AbB7232601FD9F29", "0x4A86C01d67965f8cB3d0AAA2c655705E64097C31"]
    },
    metis: {
      tokens: [
        nullAddress,
        "0xFB21B70922B9f6e3C6274BcD6CB1aa8A0fe20B80",//gohm
        ADDRESSES.metis.m_USDC,
      ],
      owners: ["0xEAEC50eBe1c2A981ED8be02C36b0863Fae322975"],
      ownTokens: [ADDRESSES.metis.SYN]
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP,
        "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",//neth
      ],
      owners: ["0x2431CBdc0792F5485c4cb0a9bEf06C4f21541D52"]
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.WMATIC_2,
        ADDRESSES.polygon.DAI,
        "0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195",//gohm
      ],
      owners: ["0xBdD38B2eaae34C9FCe187909e81e75CBec0dAA7A"],
      ownTokens: ["0xf8F9efC0db77d8881500bb06FF5D6ABc3070E695"]
    }
  },
  'treasury/syncus': {
    ethereum: {
      tokens: [
        nullAddress,
        '0x197d7010147df7b99e9025c724f13723b29313f8',// SYNC/ETH LP
      ],
      resolveLP: true,
      owners: ['0xC00EC94e7746C6b695869580d6D2DB50cda86094'],
      ownTokens: ['0xa41d2f8Ee4F47D3B860A149765A7dF8c3287b7F0']
    },
  },
  'treasury/synthetix': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.CVX,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.sUSD,
        ADDRESSES.ethereum.LIDO,
        '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',//RAD
        '0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238'
      ],
      owners: ["0x99f4176ee457afedffcb1839c7ab7a030a5e4a92", "0xeb3107117fead7de89cd14d463d340a2e6917769"],
      ownTokens: [ADDRESSES.ethereum.SNX],
      blacklistedTokens: ['0xC25a3A3b969415c80451098fa907EC722572917F']
    },
  },
  'treasury/taolie': {
    solana: {
      owners: [
        'HWZXMXB51M5ZSW423CNrdc6VKJo9KpcRjUzCprJMWhST',
      ],
      ownTokens: [
        '7dLJnm2NzHPMwB7mJL7azhyMLqs4ZzKYkkhr3ob72Gwo', // TAOLIE
      ]
    },
  },
  'treasury/tardly-treasury': {
    algorand: {
      tokens: [
        nullAddress,
        '2614577662', //atard
        '1', // algo
      ],
      owners: ["CGYA55OJYP6ZOBMIAEXEMVTZI67QCYQ7PJIMWQYETIYEWT4XCPZQRDTUQE"],
    },
  },
  'treasury/templar-dao': {
    bsc: {
      tokens: [
        nullAddress,
        "0x194d1D62d8d798Fcc81A6435e6d13adF8bcC2966",
        ADDRESSES.bsc.DAI,
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.WBNB,
        "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
        "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
      ],
      owners: ["0xEA724deA000b5e5206d28f4BC2dAD5f2FA1fe788", "0xd01e8D805BB310F06411e70Fd50eB58cAe2B4C27"],
      ownTokens: ['0x19e6BfC1A6e4B042Fb20531244D47E252445df01'],
      resolveUniV3: true,
    },
    ethereum: {
      owner: "0x4Bd973e98585b003c31f4C8b9d6eAC5d3293B1e5",
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WBTC,
      ],
      resolveUniV3: true,
    },
  },
  'treasury/tempus-finance': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.STETH,
      ],
      owners: ["0xab40a7e3cef4afb323ce23b6565012ac7c76bfef", "0x514f35a92A13bc7093f299AF5D8ebb1387E42D6B"],
      ownTokens: ["0xA36FDBBAE3c9d55a1d67EE5821d53B50B63A1aB9"],
      resolveLP: true,
      resolveUniV3: true,
    },
  },
  'treasury/thales': {
    ethereum: {
      tokens: [
        nullAddress,
        "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC
      ],
      owners: ["0xdac09f37e132d91b962f30e6ec40d2d08b82b0fa", "0x1777c6d588fd931751762836811529c0073d6376"],
      ownTokens: ["0x8947da500eb47f82df21143d0c01a29862a8c3c5", '0x03e173ad8d1581a4802d3b532ace27a62c5b81dc'],
    },
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.OP,
        "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6"
      ],
      owners: ["0x489863b61c625a15c74fb4c21486bacb4a3937ab", "0x1777c6d588fd931751762836811529c0073d6376"],
      ownTokens: ["0x217d47011b23bb961eb6d93ca9945b7501a5bb11"],
      permitFailure: true,
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244"
      ],
      owners: ["0x2902E381c9Caacd17d25a2e008db0a9a4687FDBF", "0x1777c6d588fd931751762836811529c0073d6376"],
      ownTokens: ["0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30"],
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC
      ],
      owners: ["0x4aad282dac74d79e41fd12833b1fad7a18c778ed"],
    },
  },
  'treasury/the-standard': {
    arbitrum: {
      tokens: [
        nullAddress,
        "0x643b34980E635719C15a2D4ce69571a258F940E9",
        ADDRESSES.arbitrum.USDC_CIRCLE
      ],
      owners: ["0x99d5D7C8F40Deba9d0075E8Fff2fB13Da787996a"],
      ownTokens: ["0xf5A27E55C748bCDdBfeA5477CB9Ae924f0f7fd2e"],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT
      ],
      owners: ["0xf0A13763a2102A6EA036078C602F154A2a5eEc7A"],
      ownTokens: ["0xa0b93B9e90aB887E53F9FB8728c009746e989B53"],
    },
  },
  'treasury/tokemak': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.STETH,
        "0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050", // TCR
        "0x4104b135DBC9609Fc1A9490E61369036497660c8", // APW
        "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
        "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237", // Uniswap FXS/FRAX LP
        ADDRESSES.ethereum.LIDO,
        ADDRESSES.ethereum.SAFE,
        "0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434", // stkCvxCrv
        "0x04906695D6D12CF5459975d7C3C03356E4Ccd460", // sOHM
      ],
      ownTokens: [
        ADDRESSES.ethereum.TOKE,
      ],
      owners: ["0x8b4334d4812C530574Bd4F2763FcD22dE94A969B"],
    },
  },
  'treasury/toupee-tech': {
    base: {
      owners: ["0x0cf24278c99d60388dd8a3a663937f1b9f934d09"],
      ownTokens: ["0x58Dd173F30EcfFdfEbCd242C71241fB2f179e9B9"],
    },
  },
  'treasury/tprotocol': {
    ethereum: {
      tokens: [
        nullAddress,
        '0x530824DA86689C9C17CdC2871Ff29B058345b44a', //stbt
        ADDRESSES.ethereum.USDC, //usdc
      ],
      owners: ["0xa01D9bc8343016C7DDD39852e49890a8361B2884"],
      ownTokens: [],
    },
  },
  'treasury/traderjoe': {
    avax: {
      tokens: [nullAddress, ADDRESSES.avax.USDC],
      owners: ["0xD858eBAa943b4C2fb06BA0Ba8920A132fd2410eE", "0x799d4C5E577cF80221A076064a2054430D2af5cD", "0x8F38558188FAe593E8E6347F124351CF4fDd032D"],
      ownTokens: [ADDRESSES.avax.JOE],
    },
  },
  'treasury/tranche-finance': {
    ethereum: {
      tokens: [nullAddress],
      owners: ["0x4632E2E1Ea012fD5d84804c3B36eC12560eCC0aA"],
      ownTokens: ["0x0AeE8703D34DD9aE107386d3eFF22AE75Dd616D1"],
    },
  },

  // ----- from batch_a11.js -----
  'treasury/tranchess': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        "0x04248AAbca09E9a1a3D5129a7ba05b7F17DE7684",
        "0xC764B55852F8849Ae69923e45ce077A576bF9a8d",
      ],
      owners: ["0x1bf019a44a708fbeba7adc79bdad3d0769ff3a7b"],
      ownTokens: ["0xD6123271F980D966B00cA4FCa6C2c021f05e2E73", "0x93ef1Ea305D11A9b2a3EbB9bB4FCc34695292E7d"],
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.ETH,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.BTCB,
      ],
      owners: ["0x1bf019a44a708fbeba7adc79bdad3d0769ff3a7b"],
      ownTokens: ["0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6"],
    },
  },
  'treasury/treasure-dao': {
    arbitrum: {
      owners: [
        "0x0eb5b03c0303f2f47cd81d7be4275af8ed347576",
        "0x1054e9d9091dc55a1738f9c8fc0c79e59e222804",
        "0x482729215aaf99b3199e41125865821ed5a4978a",
        "0x64bfb08217b30b70f287a1b7f0670bdd49f8a13f",
        "0x81fa605235e4c32d8b440eebe43d82e9e083166b",
        "0xdb6ab450178babcf0e467c1f3b436050d907e233",
        "0xe8409cd2abae06871d166e808d75addb0537033a",
      ],
      ownTokens: [
        "0x539bde0d7dbd336b79148aa742883198bbf60342", // MAGIC
        "0x872bAD41CFc8BA731f811fEa8B2d0b9fd6369585", // GFLY
      ],
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,  // USDC
        ADDRESSES.arbitrum.WETH,  // WETH
        "0xb7e50106a5bd3cf21af210a755f9c8740890a8c9",  // SLP
      ],
    },
    ethereum: {
      tokens: [nullAddress, ADDRESSES.ethereum.USDC],
      owners: ["0xec834bd1f492a8bd5aa71023550c44d4fb14632a"],
      ownTokens: ["0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a"],
    },
  },
  'treasury/truemarkets': {
    base: {
      owners: ['0x7DDBE7F2FE4825A1807BfF8E5D5cD81874Df3E28'],
      ownTokens: ['0x21cfcfc3d8f98fc728f48341d10ad8283f6eb7ab'],
    },
    ethereum: {
      owners: ['0x7DDBE7F2FE4825A1807BfF8E5D5cD81874Df3E28'],
    },
  },
  'treasury/trust-wallet': {
    ethereum: {
      owners: ['0xb57BE4AB4304C5aADc9E5Ea2b0B34f1F04413232'],
    },
  },
  'treasury/typus-finance': {
    sui: {
      owners: ['0xb9a09efd534d29cc9f990db26b2dab00289f32de0cdcefa68c6808de208bc9cb'],
      ownTokens: ['0xf82dc05634970553615eef6112a1ac4fb7bf10272bf6cbe0f80ef44a6c489385::typus::TYPUS'],
    },
  },
  'treasury/uniswap': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
      ],
      fetchCoValentTokens: false,
      owners: [
        "0x1a9c8182c09f50c8318d769245bea52c32be35bc",
        "0x4b4e140D1f131fdaD6fb59C13AF796fD194e4135",
        "0x3D30B1aB88D487B0F3061F40De76845Bec3F1e94",
      ],
      ownTokens: [ADDRESSES.ethereum.UNI],
    },
  },
  'treasury/unitas': {
    solana: {
      owners: [
        'AR2ZCCyB5nXb7TesCz2pcCWbQsH8TAwixetDRrm3Z9wr',
        '8Qo4oKTM5jiZEAKzhBLKwTKjCJrDHsUUux5K5DaQDxLR',
        '5ZbLoA6DSnXoDeU7jsdmmkua4X1ugHUFYzbByzrbJDST',
        'EjwCRUh3HhBaR7vaTrFzuNpDAnTX9h3ddZuiQgKqCadz',
        'HZQdNWYBv23A3cfCAWDm4BQJ7XVARtDGJKhezmwvzfxo',
        '2QfKMyrkFNACCmPw1EHCAxcH7MHvsChuR9MduWk6TfD6',
        'USDUY49DCh6wAHvx5jZn1xHSyDc8fvMa7YBnFi1aYEy',
        'DLzMXMSZLW8QEx563QBZNca8Gg6NrHGJZdJJ3Y4rcKEe',
        '3fKaQf2uLSped6HUEPQkQtTpPo1xnhZRsmfW7htFBBuQ',
        '6REMwMUhkh9PLNGxRUsue49otacp76pAWAU3C7itQ4AP',
      ],
      tokens: [
        '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4', //JLP
        ADDRESSES.solana.USDC, //USDC
        'So11111111111111111111111111111111111111111',   //SOL
      ],
    },
    bsc: {
      owners: ["0xB464C9890604926bd5Fa7b66Bf15d26BCD0eD3A9"],
      tokens: [ADDRESSES.bsc.USDT],
    },
  },
  'treasury/unore': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
      ],
      owners: [
        '0x46488d2D36D8983de980Ff3b9f046DCd0a9DC2ae',
        '0x4aede441085398BD74FeB9eeFCfe08E709e69ABF',
        '0xacd5009f13a5b4f874d61b2a1e20241ea7a7b953',
      ],
      ownTokens: ["0x474021845c4643113458ea4414bdb7fb74a01a77"],
    },
  },
  'treasury/uwulend': {
    ethereum: {
      tokens: [
        nullAddress,
        "0x29127fE04ffa4c32AcAC0fFe17280ABD74eAC313", // SIFU
        ADDRESSES.ethereum.USDT, // USDT
        ADDRESSES.ethereum.DAI, // DAI
        "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3", // MIM
        ADDRESSES.ethereum.WBTC, // WBTC
        "0xb95BD0793bCC5524AF358ffaae3e38c3903C7626", // uDAI
        "0x24959F75d7BDA1884f1Ec9861f644821Ce233c7D", // uUSDT
        "0x8C240C385305aeb2d5CeB60425AABcb3488fa93d", // uFRAX
        "0x67fadbD9Bf8899d7C578db22D7af5e2E500E13e5", // uWETH
        "0xaDFa5Fa0c51d11B54C8a0B6a15F47987BD500086", // uLUSD
        "0x6Ace5c946a3Abd8241f31f182c479e67A4d8Fc8d", // uWBTC
        "0xC4BF704f51aa4ce1AA946FfE15646f9B271ba0fa", // uWMEMO
        "0xdb1A8f07f6964EFcFfF1Aa8025b8ce192Ba59Eba", // uCRV
        "0xC480a11A524E4DB27c6d4E814b4D9B3646bC12Fc", // uMIM
        "0x02738ef3f8d8D3161DBBEDbda25574154c560dAe", // uSIFU
        "0x8028Ea7da2ea9BCb9288C1F6f603169B8AEa90A6", // uSIFUM
        "0x243387a7036bfcB09f9bF4EcEd1E60765D31aA70", // uSSPELL
      ],
      owners: ["0xc671a6b1415de6549b05775ee4156074731190c6"],
      ownTokens: ["0x55C08ca52497e2f1534B59E2917BF524D4765257"],
    },
  },
  'treasury/vaporfi': {
    avax: {
      tokens: [
        nullAddress,
      ],
      owners: ["0x20b0013dcBB9697a8C3D0Be2cfb004d6bD023B87"],
      ownTokens: ["0x83a283641C6B4DF383BCDDf807193284C84c5342", "0x4cd20F3e2894Ed1A0F4668d953a98E689c647bfE"],
    },
  },
  'treasury/variational': {
    arbitrum: {
      owners: ['0x5e91b40467fb8902c46a7b6cb90482363188d645'],
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC_CIRCLE,
      ],
    },
  },
  'treasury/velodrome': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.OP, // OP
        ADDRESSES.optimism.USDC, // USDC
        ADDRESSES.tombchain.FTM, // WETH
        "0x73cb180bf0521828d8849bc8CF2B920918e23032", // USD+
        ADDRESSES.optimism.sUSD, // sUSD
        ADDRESSES.optimism.sETH, // sETH
        "0xB153FB3d196A8eB25522705560ac152eeEc57901", // MIM
        ADDRESSES.optimism.USDT, // USDT
        "0xd52f94DF742a6F4B4C8b033369fE13A41782Bf44", // L2DAO
        "0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED", // agEUR
        "0xc3864f98f2a61A7cAeb95b039D031b4E2f55e0e9", // OpenX
        "0x61BAADcF22d2565B0F471b291C475db5555e0b76", // AELIN
        "0x79AF5dd14e855823FA3E9ECAcdF001D99647d043", // jEUR
        "0xc40F949F8a4e094D1b49a23ea9241D289B7b2819", // LUSD
        ADDRESSES.moonbeam.MAI, // MAI
        "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d", // QI
        "0x9Bcef72be871e61ED4fBbc7630889beE758eb81D", // rETH
        "0xE3AB61371ECc88534C522922a026f2296116C109", // SPELL
        "0xcB59a0A753fDB7491d5F3D794316F1adE197B21E", // TUSD
        ADDRESSES.optimism.WSTETH, // wstETH
      ],
      ownTokens: [
        "0x3c8B650257cFb5f272f799F5e2b4e65093a11a05", // VELO
        "0xe8537b6FF1039CB9eD0B71713f697DDbaDBb717d", // vAMM-VELO/USDC
      ],
      owners: ["0xb074ec6c37659525EEf2Fb44478077901F878012", "0xe7D7ce84D45e43F06cD5CaA1d9c42374b8776fb0"],
      ownTokenOwners: ["0xb074ec6c37659525EEf2Fb44478077901F878012", "0xe7D7ce84D45e43F06cD5CaA1d9c42374b8776fb0"],
    },
  },
  'treasury/venus': {
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.USDT, //bsc-usdc
        ADDRESSES.bsc.USDC, //usdc
        ADDRESSES.bsc.BTCB, //BTCB
        ADDRESSES.bsc.DAI, //DAI
        ADDRESSES.bsc.BETH, //BETH
        ADDRESSES.bsc.WBNB,
        "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
        ADDRESSES.bsc.ETH, //eth
        "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8", // venusUSDC
        "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8", // venusETH
        "0xfD5840Cd36d94D7229439859C0112a4185BC0255", // venusUSDT
        "0xB248a295732e0225acd3337607cc01068e3b9c10", // venusXRP
        "0x95c78222B3D6e262426483D42CfA53685A67Ab9D", // venusBUSD
        "0xA07c5b74C9B40447a954e1466938b865b6BBea36", // venusBNB
        "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", //cake
        "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", //thena
        "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94", //ltc
        "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E", //floki
        "0x20eE7B720f4E4c4FFcB00C4065cdae55271aECCa", //nft
        "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", //uni
        "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A", //sxp
        "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", //dot
        "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", //xrp
        "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", //ada
        "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", //link
        "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", //doge
        ADDRESSES.bsc.TUSD, //tusd
        "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", //fil
        "0xCC42724C6683B7E57334c4E856f4c9965ED682bD", //matic
        ADDRESSES.bsc.BUSD, //busd
        "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827", //ankrbnb
        "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", //trx
        "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B", //btt
        "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", //bch
        "0xd17479997F34dd9156Deef8F95A52D81D265be9c", //usdd
        "0x302cD8973bE5CA2334B4ff7e7b01BA41455559b3", //ethw
        "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275", //bnbx
        "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1", //bsw
        "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16", //stkbnb
        "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99", //win
        "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5", //lisusd
        "0x12BB890508c125661E03b09EC06E404bc9289040", //raca
        "0x4B0F1812e5Df2A09796481Ff14017e6005508003", //twt
        "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F", //alpaca
        "0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89", //ageur
      ],
      owners: ["0xF322942f644A996A617BD29c16bd7d231d9F35E9"],
      ownTokens: ["0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63", "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7"],
    },
    era: {
      tokens: [
        ADDRESSES.era.WBTC,
        ADDRESSES.era.ZK,
        ADDRESSES.era.USDC,
        ADDRESSES.era.WETH,
      ],
      owners: ['0xB2e9174e23382f7744CebF7e0Be54cA001D95599'],
    },
  },
  'treasury/vesta': {
    arbitrum: {
      owners: ["0xc9032419aa502fafa107775dca8b7d07575d9db5"],
      ownTokens: [
        '0xa684cd057951541187f288294a1e1c2646aa2d24', //
      ],
      tokens: [
        nullAddress,
        '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
        '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1',
      ],
    },
  },
  'treasury/void': {
    fantom: {
      owners: ["0xf0a793024Ac47e421EB8c4673212dfCcE42f4a97", "0x78cCb45a43731cf989C740e9cb31f3d192Bd0f8b"],
      ownTokens: [
        "0x80F2B8CdbC470c4DB4452Cc7e4a62F5277Db7061", // VOID
      ],
      tokens: [
        nullAddress,
        "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", // DAI
        "0xfC66Ac63D414d3CF3dcdDa9e60742F6E789205e3", // SpookySwap VOID-DAI LP
      ],
    },
  },
  'treasury/volta': {
    arbitrum: {
      owners: ["0xB9665f6E5e3413B3a75Cc209556830E446fF9969"],
      ownTokens: [
        "0x417a1aFD44250314BffB11ff68E989775e990ab6", // VOLTA
        "0xb1781BF9C582A71269c6098E4155Ea8b15B35305", // VOLT
      ],
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDT, // USDT
        ADDRESSES.optimism.DAI, // DAI
        ADDRESSES.arbitrum.USDC, // USDC
        "0xd85E038593d7A098614721EaE955EC2022B9B91B", // gDAI
        "0xd92Be5A1c565Db5256cDD537B875ED46111Bd8b0", // VOLT2USD3CRV-f
        ADDRESSES.arbitrum.WETH, // WETH
        "0x39ff5098081FBE1ab241c31Fe0a9974FE9891d04", // voltGNS
      ],
    },
  },
  'treasury/wagmi': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4",
      ],
      owners: ["0xd2135CfB216b74109775236E36d4b433F1DF507B"],
      ownTokens: [],
    },
  },
  'treasury/we-piggy': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ["0x0d189fd8d46e43b2f13390de95d4f8e185eb3914"],
    },
  },
  'treasury/woofi': {
    avax: {
      tokens: [
        nullAddress,
        ADDRESSES.avax.USDC_e,
      ],
      owners: ["0xb54382c680b0ad037c9f441a8727ca6006fe2dd0"],
    },
    ethereum: {
      tokens: [
        nullAddress,
        "0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd",
        ADDRESSES.ethereum.USDC,
      ],
      owners: ["0xfa2d1f15557170f6c4a4c5249e77f534184cdb79"],
      ownTokens: ["0x4691937a7508860F876c9c0a2a617E7d9E945D4B", "0x2FC8bC3eE171eD5610ba3093909421E90b47Fc07"],
      resolveLP: true,
      resolveUniV3: true,
    },
    bsc: {
      tokens: [
        nullAddress,
        ADDRESSES.bsc.USDC,
      ],
      owners: ["0xfd899c7c5ed84537e2acfc998ce26c3797654ae8"],
      ownTokens: ["0x4691937a7508860F876c9c0a2a617E7d9E945D4B"],
    },
  },
  'treasury/y2k': {
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC, //  USDC
        ADDRESSES.arbitrum.WETH, //  WETH
        ADDRESSES.arbitrum.USDT, //  USDT
        ADDRESSES.optimism.DAI, //  DAI
        '0x569061e2d807881f4a33e1cbe1063bc614cb75a4',
        '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c',
        '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c',
      ],
      owners: ['0x5c84cf4d91dc0acde638363ec804792bb2108258'],
      ownTokens: ['0x65c936f008bc34fe819bce9fa5afd9dc2d49977f'],
    },
  },
  'treasury/yam-finance': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
      ],
      owners: ["0x744d16d200175d20e6d8e5f405aefb4eb7a962d1", "0x97990b693835da58a281636296d2bf02787dea17"],
      ownTokens: ["0x0AaCfbeC6a24756c20D41914F2caba817C0d8521"],
    },
  },
  'treasury/yearn': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',//3crv
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.CRV,
        '0xba100000625a3754423978a60c9317c58a424e3D',//BAL
        '0x31429d1856aD1377A8A0079410B297e1a9e214c2',//ANGLE
        ADDRESSES.ethereum.sUSD,
        ADDRESSES.ethereum.WBTC,
      ],
      owners: ["0x93a62da5a14c80f265dabc077fcee437b1a0efde", "0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52"],
      ownTokens: [ADDRESSES.ethereum.YFI],
    },
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ["0xb6bc033d34733329971b938fef32fad7e98e56ad"],
    },
  },
  'treasury/yield-guild-game': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.MATIC,//MATIC
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.USDT,
        '0x61E90A50137E1F645c9eF4a0d3A4f01477738406',//loka
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',//HSF
        '0x232FB065D9d24c34708eeDbF03724f2e95ABE768',//SHEESHA
        '0x0d02755a5700414B26FF040e1dE35D337DF56218', //BEND
      ],
      owners: [
        "0xe30ed74c6633a1b0d34a71c50889f9f0fdb7d68a",
        "0xf0103243f4d22b5696588646b21313d85916a16a",
        "0x16b281438c5984a46d94acc6c4b31e252a03dfcf",
        "0xcafeacdadd29f55ce935492e20f1f982df3fb51d",
        "0xb981290d9d804075986482f0302c03a3cd2aff32",
        "0x21653e2f0472afaf64ec85f585f0db4ab83a83f0",
        "0x8e8d8015a7ffa49c83ee7a8773b0f69380cc6552",
      ],
      ownTokens: ["0x25f8087EAD173b73D6e8B84329989A8eEA16CF73"],
    },
    solana: {
      tokens: [
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
      ],
      owners: ["GvAm8xG5BSWXy286jWXWzYpN2xzPADQEoK9U8dQCDtzt", "3fGSv3VdKvf7KSMt1o9Lb3dZ4YK9ScUTWktcrC4JJBTq"],
    },
    optimism: {
      tokens: [
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH,
      ],
      owners: ["0xf0103243f4d22b5696588646b21313d85916a16a"],
    },
    polygon: {
      tokens: [
        ADDRESSES.polygon.WETH_1,
        "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4",
        ADDRESSES.polygon.WMATIC_2,
        "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
      ],
      owners: ["0x16b281438c5984a46d94acc6c4b31e252a03dfcf", "0x23eb4e02c29e69452718cd5caf2255488bc7ce3a"],
    },
  },
  'treasury/yieldz': {
    ethereum: { owners: ["0x79Af6AbA700CCe35f5Ad5573a679674593fC6f0C"] },
    arbitrum: { owners: ["0x79Af6AbA700CCe35f5Ad5573a679674593fC6f0C"] },
    base: { owners: ["0x79Af6AbA700CCe35f5Ad5573a679674593fC6f0C"] },
    hyperliquid: { owners: ["0x79Af6AbA700CCe35f5Ad5573a679674593fC6f0C"] },
  },
  'treasury/zachxtb-theman': {
    optimism: {
      tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC, // USDC
        ADDRESSES.optimism.OP,
      ],
      owners: ["0x9D727911B54C455B0071A7B682FcF4Bc444B5596"],
    },
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.TUSD,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
        "0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3",
        ADDRESSES.ethereum.WBTC,
        "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", //AURA
        "0xB6eD7644C69416d67B522e20bC294A9a9B405B31", //0XBTC
      ],
      owners: ["0x9D727911B54C455B0071A7B682FcF4Bc444B5596"],
    },
    arbitrum: {
      tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC, // USDC
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WETH,
      ],
      owners: ["0x9D727911B54C455B0071A7B682FcF4Bc444B5596"],
    },
  },
  'treasury/zero-swap': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ["0x70f4f7a85100348fc33f1d8005703c8953bc67fd"],
    },
  },
  'treasury/zigzag': {
    ethereum: {
      tokens: [
        nullAddress,
      ],
      owners: ['0xF203f949C1c4cA53B960C1ba33cB6455Bb9b0079'],
      ownTokens: ['0xc91a71a1ffa3d8b22ba615ba1b9c01b2bbbf55ad'],
    },
  },
  'treasury/zunami': {
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.FRAX,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.CVX,
        ADDRESSES.ethereum.vlCVX,
        "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
        ADDRESSES.ethereum.FXS, // FXS
      ],
      owners: ["0xb056b9a45f09b006ec7a69770a65339586231a34"],
      ownTokens: ["0x6b5204b0be36771253cc38e88012e02b752f0f36"],
    },
  },
  'treasury/zyber-swap': {
    arbitrum: {
      tokens: [
        nullAddress,
      ],
      owners: ["0x5be4fb908a43d61b1c8086fe62e39ae8ec483926"],
    },
  },
}

const protocols = {}
for (const [key, config] of Object.entries(configs)) {
  protocols[key] = treasuryExports(config)
}
Object.defineProperty(protocols, "_rawConfigs", { value: configs, enumerable: false })

module.exports = protocols
