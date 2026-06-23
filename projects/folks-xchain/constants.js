const ADDRESSES = require('../helper/coreAssets.json')
const HubPoolAbi = {
  getDepositData: "function getDepositData() view returns (uint16 optimalUtilisationRatio, uint256 totalAmount, uint256 interestRate, uint256 interestIndex)",
  getVariableBorrowData: "function getVariableBorrowData() view returns (uint32 vr0, uint32 vr1, uint32 vr2, uint256 totalAmount, uint256 interestRate, uint256 interestIndex)",
  getStableBorrowData: "function getStableBorrowData() view returns (uint32 sr0, uint32 sr1, uint32 sr2, uint32 sr3, uint16 optimalStableToTotalDebtRatio, uint16 rebalanceUpUtilisationRatio, uint16 rebalanceUpDepositInterestRate, uint16 rebalanceDownDelta, uint256 totalAmount, uint256 interestRate, uint256 averageInterestRate)"
}
const HubPools = {
  'avax': [
    { // USDC      
      poolAddress: "0x88f15e36308ED060d8543DA8E2a5dA0810Efded2",
      tokenAddress: ADDRESSES.avax.USDC,
    },
    { // AVAX      
      poolAddress: "0x0259617bE41aDA4D97deD60dAf848Caa6db3F228",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0xe69e068539Ee627bAb1Ce878843a6C76484CBd2c',
    },
    { // sAVAX      
      poolAddress: "0x7033105d1a527d342bE618ab1F222BB310C8d70b",
      tokenAddress: ADDRESSES.avax.SAVAX,
      chainPoolAddress: '0x23a96D92C80E8b926dA40E574d615d9e806A87F6',
    },
    { // wETH_ava      
      poolAddress: "0x795CcF6f7601edb41E4b3123c778C56F0F19389A",
      tokenAddress: ADDRESSES.avax.WETH_e,
      chainPoolAddress: '0x0e563B9fe6D9EF642bDbA20D53ac5137EB0d78DC',
    },
    { // BTCb_ava      
      poolAddress: "0x1C51AA1516e1156d98075F2F64e259906051ABa9",
      tokenAddress: ADDRESSES.avax.BTC_b,
      chainPoolAddress: '0xef7a6EBEDe2ad558DB8c36Df65365b209E5d57dC',
    },
    { // SolvBTC      
      poolAddress: "0x307bCEC89624660Ed06C97033EDb7eF49Ab0EB2D",
      tokenAddress: '0xbc78D84Ba0c46dFe32cf2895a19939c86b81a777',
    },
    { // JOE      
      poolAddress: "0x5e5a2007a8D613C4C98F425097166095C875e6eE",
      tokenAddress: ADDRESSES.avax.JOE,
      chainPoolAddress: '0x3b1C2eC8B7cdE241E0890C9742C14dD7867aA812',
    },
    { // ggAVAX      
      poolAddress: "0xAdA5Be2A259096fd11D00c2b5c1181843eD008DC",
      tokenAddress: '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3',
      chainPoolAddress: '0xe53189D00D1b4F231A2a208a7967E0dCaE8Db073',
    },
    {
      // SHIB
      poolAddress: '0x9f59642C6733397dF5c2696D3Ac9ceb431b1b573',
      tokenAddress: '0x2f643d728926C20269f0A04931dd7b4b6B650204',
    },
    { // aUSD
      poolAddress: '0xc7DdB440666c144c2F27a3a5156D636Bacfc769C',
      tokenAddress: ADDRESSES.mantle.AUSD,
      chainPoolAddress: '0x666aea026bC606220ec6eb83a83D81881fA48e0f',
    },
    { // savUSD
      poolAddress: '0xE6B7713854620076B5716E2743262D315bf8609D',
      tokenAddress: '0x06d47F3fb376649c3A9Dafe069B3D6E35572219E',
      chainPoolAddress: '0xe396E1246B7341Eb6EDA05DCfef9EaB9E661f80C',
    },
    { // USDt_ava
      poolAddress: '0xA1E1024c49c77297bA6367F624cFbEFC80E697c6',
      tokenAddress: ADDRESSES.avax.USDt,
      chainPoolAddress: '0x66dD1c6bEAdFFcA88365BAdE7928323672323d11',
    },
    { // YBTCB
      poolAddress: '0x13A21bC65844CD530098Ab15431c57078ea90737',
      tokenAddress: '0x2cd3CdB3bd68Eea0d3BE81DA707bC0c8743D7335',
    },
    { // USDe_ava
      poolAddress: '0x5431e7f480C4985e9C3FaAcd3Bd1fc7143eAdEFa',
      tokenAddress: ADDRESSES.arbitrum.USDe,
      chainPoolAddress: '0x07C911b5a1657126B14C25e697E3d00f3a134A23',
    },
    { // sUSDe_ava
      poolAddress: '0x94307E63eF02Cf9B39894553f14b21378Ef20adB',
      tokenAddress: ADDRESSES.arbitrum.sUSDe,
      chainPoolAddress: '0x1C7EC7198F297119D4e9f359d91127c8B2f9A9D2',
    },
    { // EURC_ava
      poolAddress: '0x3F87F3B301f031ba59C479EDF067621DcC72DDca',
      tokenAddress: ADDRESSES.avax.EURC,
      chainPoolAddress: '0xe47285cc79A8de62DFaED52Abe919B87973294C8',
    },
    { // tETH
      poolAddress: '0x5FE123B659FC5242f46884C37550F05Ef08C816a',
      tokenAddress: '0xd09ACb80C1E8f2291862c4978A008791c9167003',
    },
    { // tAVAX
      poolAddress: '0x3F63A6401e6354a486e6a38127409fD16e222B59',
      tokenAddress: '0x14A84F1a61cCd7D1BE596A6cc11FE33A36Bc1646',
      chainPoolAddress: '0x0aeE2B84bd3E280CFcc9325917bFA0Bb20F3cdC6',
    },
    { // wstLINK
      poolAddress: '0x42Bb92684e72707030F59C48FBe5A222A0d8b387',
      tokenAddress: '0x601486C8Fdc3aD22745b01c920037d6c036A38B9',
    },
  ],
  'ethereum': [
    // excluding USDC cause bridged
    // excluding SolvBTC cause bridged
    // excluding SHIB cause bridged
    // excluding YBTCB cause bridged
    // excluding tETH cause bridged
    // excluding wstLINK cause bridged
    { // ETH_eth      
      poolAddress: "0xB6DF8914C084242A19A4C7fb15368be244Da3c75",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0xe3B0e4Db870aA58A24f87d895c62D3dc5CD05883',
    },
    { // wBTC_eth      
      poolAddress: "0x9936812835476504D6Cf495F4F0C718Ec19B3Aff",
      tokenAddress: ADDRESSES.ethereum.WBTC,
      chainPoolAddress: "0xb39c03297E87032fF69f4D42A6698e4c4A934449",
    },
    {
      // ATH_eth
      poolAddress: '0x391201cEC4F80e69C87Dee364d599c1FCAE3c363',
      tokenAddress: '0xbe0Ed4138121EcFC5c0E56B40517da27E6c5226B',
      chainPoolAddress: '0x91461B9117B3644609EeB0889ecc89Cab4644bb2',
    },
    {
      // pyUSD_eth
      poolAddress: '0x279b3E185F64e99141d4CE363657A5F3B5B32Fb9',
      tokenAddress: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
      chainPoolAddress: '0xff785fb7BfBbe03eD09089f73151AE563B211723',
    },
    {
      // rlUSD_eth
      poolAddress: '0x7178bF2a8A50153549e0d95A4C6Cb816448840F0',
      tokenAddress: '0x8292bb45bf1ee4d140127049757c2e0ff06317ed',
      chainPoolAddress: '0x7967B0fe720E676f41640855a203B409cEcc8f92',
    },
    {
      // wstETH_eth
      poolAddress: '0xe7897052FAC4bfF9EB3ABc073CBC1e17Fce5709C',
      tokenAddress: ADDRESSES.ethereum.WSTETH,
      chainPoolAddress: '0xB3ABD8cc35619b907F3f2E974Fe3d43956AA7cda',
    },
    {
      // weETH_eth
      poolAddress: '0x4E6dD5E35638008cdB1E9004F3E952bCDd920E6D',
      tokenAddress: ADDRESSES.ethereum.WEETH,
      chainPoolAddress: '0x63BCB60165E7EC30F03883Fcb800AEf304EE7eEa',
    },
    {
      // USDt_eth
      poolAddress: '0xf51a72b92cB9C16376Da04f48eF071c966B9C50B',
      tokenAddress: ADDRESSES.ethereum.USDT,
      chainPoolAddress: '0x12d4FeDD9cE1b4d7dB90b07366284ac1675a5a90',
    },
    {
      // SYRUP_eth
      poolAddress: '0xD4F87eb6cc8795e727F7DbC1e2C6c3452ad0010c',
      tokenAddress: '0x643C4E15d7d62Ad0aBeC4a9BD4b001aA3Ef52d66',
      chainPoolAddress: '0x3aEa5E1f27935Ed59424F35Ea801420d804219E4',
    },
  ],
  'base': [
    // excluding USDC cause bridged
    // excluding SolvBTC cause bridged
    // excluding SHIB cause bridged
    { // ETH_base
      poolAddress: "0x51958ed7B96F57142CE63BB223bbd9ce23DA7125",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0xe3B0e4Db870aA58A24f87d895c62D3dc5CD05883',
    },
    { // cbBTC_base      
      poolAddress: "0x9eD81F0b5b0E9b6dE00F374fFc7f270902576EF7",
      tokenAddress: ADDRESSES.base.cbBTC,
      chainPoolAddress: '0x50d5Bb3Cf57D2fB003b602A6fD10F90baa8567EA',
    },
    {
      // AERO_base
      poolAddress: '0xb5327c35E083248E3a0f79122FaB3b6018e5584a',
      tokenAddress: '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
      chainPoolAddress: '0x7Ace2Bc1C79954B56C65C7B326035C4468ac12BB',
    },
    {
      // cbETH_base
      poolAddress: '0x0b09E1Ffd28040654021A85A49284597F3d0e41C',
      tokenAddress: ADDRESSES.base.cbETH,
      chainPoolAddress: '0x31A324D233AB3E73A6e1039D64907bBb2742606C',
    },
    {
      // wstETH_base
      poolAddress: '0xC96820695217c7dd8F696f8892de76F7a48432CB',
      tokenAddress: ADDRESSES.base.wstETH,
      chainPoolAddress: '0x7c7961E590B7e005540B72238b739ae513B605fB',
    },
    {
      // weETH_base
      poolAddress: '0xf727EC8D6e565328f2cf0Ff8aC4e7c9e7f8d24B2',
      tokenAddress: ADDRESSES.base.weETH,
      chainPoolAddress: '0x8D9aad601f384C596B9e2b9124a73b278DB4C51C',
    },
    {
      // VIRTUAL_base
      poolAddress: '0x331a1938f94af7bB41d57691119Aee416495202a',
      tokenAddress: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
      chainPoolAddress: '0x9009c929873f0e68dbc253b16aC4c3E4426E6E35',
    },
    {
      // KAITO_base
      poolAddress: '0x04C8B9d8AF87a6D670B646125B2D99740D8eBa5E',
      tokenAddress: '0x98d0baa52b2D063E780DE12F615f963Fe8537553',
      chainPoolAddress: '0x123f831a762A165107EE2e07416f4AA713dA9bFD',
    },
  ],
  'bsc': [
    // excluding SolvBTC cause bridged
    // excluding YBTCB cause bridged
    // excluding SHIB cause bridged
    { // BNB
      poolAddress: "0x89970d3662614a5A4C9857Fcc9D9C3FA03824fe3",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0x5f2F4771B7dc7e2F7E9c1308B154E1e8957ecAB0',
    },
    { // ETHB_bsc      
      poolAddress: "0x18031B374a571F9e060de41De58Abb5957cD5258",
      tokenAddress: ADDRESSES.bsc.ETH,
      chainPoolAddress: '0x4Db12F554623E4B0b3F5bAcF1c8490D4493380A5',
    },
    { // BTCB_bsc      
      poolAddress: "0xC2FD40D9Ec4Ae7e71068652209EB75258809e131",
      tokenAddress: ADDRESSES.bsc.BTCB,
      chainPoolAddress: '0x12Db9758c4D9902334C523b94e436258EB54156f',
    },
  ],
  'arbitrum': [
    // excluding USDC cause bridged
    // excluding SolvBTC cause bridged
    // excluding SHIB cause bridged
    // excluding wstLINK cause bridged
    { // ETH_arb
      poolAddress: "0x44E0d0809AF8Ee37BFb1A4e75D5EF5B96F6346A3",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0x37d761883a01e9F0B0d7fe59EEC8c21D94393CDD',
    },
    { // ARB      
      poolAddress: "0x1177A3c2CccDb9c50D52Fc2D30a13b2c3C40BCF4",
      tokenAddress: ADDRESSES.arbitrum.ARB,
      chainPoolAddress: '0x1b2a8d56967d00700DD5C94E27B1a116a1deF8Df',
    },
    { // wBTC_arb
      poolAddress: '0x3445055F633fEF5A64F852aaCD6dA76143aCA109',
      tokenAddress: ADDRESSES.arbitrum.WBTC,
      chainPoolAddress: '0x2d1c07209696456b7901949fdf81037016d541A5',
    },
    { // tBTC_arb
      poolAddress: '0xdd9eFBf83572f5387381aD3A04b1318221d545A2',
      tokenAddress: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
      chainPoolAddress: '0xDF2da9288C4D0aDF6c52CCbb5062b8C73fb19111',
    },
    { // wstETH_arb
      poolAddress: '0x9f0c0aDEc9fd4ef946aCe1e2b4F32e49aE45C8F3',
      tokenAddress: ADDRESSES.arbitrum.WSTETH,
      chainPoolAddress: '0x74416b0121DAadFeb2A9C2306827CCf80a6EE097',
    },
    { // weETH_arb
      poolAddress: '0x78B4e5cda33C898b546dB7925162879E7bd2A9d1',
      tokenAddress: ADDRESSES.arbitrum.weETH,
      chainPoolAddress: '0x624363570A6b6Fee5531CcA341b794B286Af091c',
    },
    { // rsETH_arb
      poolAddress: '0x60f2682Ab38e3C9a51b07fbd69f42Ad2Cfe731db',
      tokenAddress: ADDRESSES.berachain.rsETH,
      chainPoolAddress: '0xC0a3536E0b6799014A14664bA4370BBd5D0c7590',
    },
    {
      // USDT0_arb
      poolAddress: '0x1b5a1dCe059E6069Ed33C3656826Ad04bE536465',
      tokenAddress: ADDRESSES.arbitrum.USDT,
      chainPoolAddress: '0xe69e068539Ee627bAb1Ce878843a6C76484CBd2c',
    }
  ],
  'polygon': [
    // excluding USDC cause bridged
    // excluding wstLINK cause bridged
    { // POL      
      poolAddress: "0x481cF0c02BF17a33753CE32f1931ED9990fFB40E",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0x4Db12F554623E4B0b3F5bAcF1c8490D4493380A5',
    },
    { // wBTC_pol      
      poolAddress: "0x7054254933279d93D97309745AfbFF9310cdb570",
      tokenAddress: ADDRESSES.polygon.WBTC,
      chainPoolAddress: '0x1A40208E9506E08a6f62DbCCf8de7387743179E9',
    },
    { // wETH_pol      
      poolAddress: "0x88Ae56886233C706409c74c3D4EA9A9Ac1D65ab2",
      tokenAddress: ADDRESSES.polygon.WETH_1,
      chainPoolAddress: '0x2e6e4603536078bd7661338F06FB93cf6F9b7A98',
    },
    { // wstETH_pol
      poolAddress: '0xD77b920A9c05B3e768FEaE0bcB5839cd224328fE',
      tokenAddress: ADDRESSES.polygon.WSTETH,
      chainPoolAddress: '0xa526f90c0CAab6A0E6085830e75b084cd3c84000',
    },
    { // LINK_pol
      poolAddress: '0x84C420D5e077cF0ed8a20c44d803C380172eD5D5',
      tokenAddress: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      chainPoolAddress: '0x63ad90A703e95e39be7CB9e460C2b05870c982B8',
    },
    { // MaticX
      poolAddress: '0x59023eFDB22B9d8b2C7aeD842aC1fd2f6110e5B5',
      tokenAddress: ADDRESSES.polygon.MATICX,
      chainPoolAddress: '0xCB66564d0cF3D28B26a1b6D4eCb830D6E216a75a',
    },
    {
      // aUSD_pol
      poolAddress: '0x34f1BA5808EB5Bf60c9B1C343d86e410466F4860',
      tokenAddress: ADDRESSES.mantle.AUSD,
      spokeAddress: '0xaB07AfCf16fecdCC3D83dB7513c7839aEd626322',
    },
    {
      // USDt_pol
      poolAddress: '0x11f82b5Ea7408Ff257F6031E6A3e29203557A1DD',
      tokenAddress: ADDRESSES.polygon.USDT,
      chainPoolAddress: '0xf2ee689fd3f7A7358bEDA46f83E7968Ad894abF0',
    }
  ],
  'sei': [
    { // SEI
      poolAddress: "0x63EFdA4bf91Ba13D678C58AF47304e6180dD46DF",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0x5f2F4771B7dc7e2F7E9c1308B154E1e8957ecAB0',
    },
    { // iSEI
      poolAddress: "0x2B7995fd223dCf3A660Cc5a514349E3fa7B16168",
      tokenAddress: "0x5Cf6826140C1C56Ff49C808A1A75407Cd1DF9423",
      chainPoolAddress: '0x4Db12F554623E4B0b3F5bAcF1c8490D4493380A5',
    },
    { // USDT0_sei 
      poolAddress: "0x213299AC40Ce76117C2c4B13945D9d935686BB85",
      tokenAddress: "0x9151434b16b9763660705744891fA906F660EcC5",
      chainPoolAddress: '0x12Db9758c4D9902334C523b94e436258EB54156f',
    },
    { // wETH_sei
      poolAddress: "0x9A102080970043B96773c15E6520d182565C68Ff",
      tokenAddress: "0x160345fc359604fc6e70e3c5facbde5f7a9342d8",
      chainPoolAddress: '0x802063A23E78D0f5D158feaAc605028Ee490b03b',
    },
    { // wBTC_sei
      poolAddress: "0x7Cd4afD7F4DB51A0bF06Bf4630752A5B28e0B6C1",
      tokenAddress: ADDRESSES.bsc.WBTC,
      chainPoolAddress: '0x7218Bd1050D41A9ECfc517abdd294FB8116aEe81',
    },
  ],
  'monad': [
    { // MON
      poolAddress: "0x10a4481F79aAC209aC6c2959B785F2e303912Dc5",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0x531490B7674ef239C9FEC39d2Cf3Cc10645d14d4',
    },
    { // wBTC_mon
      poolAddress: "0xdc887aCFe154BF0048Ae15Cda3693Ab2C237431A",
      tokenAddress: ADDRESSES.bsc.WBTC,
      chainPoolAddress: '0xF4c542518320F09943C35Db6773b2f9FeB2F847e',
    },
    { // wETH_mon 
      poolAddress: "0xD7Ff49751DAF42Bf7AFC4fF5C958d4bea48358D3",
      tokenAddress: ADDRESSES.monad.WETH,
      chainPoolAddress: '0xe3B0e4Db870aA58A24f87d895c62D3dc5CD05883',
    },
    { // sMON
      poolAddress: "0x5562d84f9891288fc72aaB1d857797c7275Fcedb",
      tokenAddress: "0xA3227C5969757783154C60bF0bC1944180ed81B9",
      chainPoolAddress: '0xb39c03297E87032fF69f4D42A6698e4c4A934449',
    },
    { // aUSD_mon
      poolAddress: "0x4fb4c3A33cBe855C5d87078c1BbBe5f371417faC",
      tokenAddress: ADDRESSES.mantle.AUSD,
      chainPoolAddress: '0xC30107a8e782E98Fe890f0375afa4185aeEa3356',
    },
    { // USDT0_mon
      poolAddress: "0xd9D50D4F73f61A306b47e5BdC825E98cd11139dc",
      tokenAddress: ADDRESSES.monad.USDT,
      chainPoolAddress: '0xB1e2939b501B73F4cFEf6a9FB0aa89a75F1774EE',
    },
    { // gMON
      poolAddress: "0x0b4e69C4890a88acA90E7e71dB76619C3AaCD79D",
      tokenAddress: "0x8498312A6B3CbD158bf0c93AbdCF29E6e4F55081",
      chainPoolAddress: '0x9105CEEbaf43EF6B80dF1b66BEfFd5F98A036c36',
    },
    { // shMON
      poolAddress: "0x398715A6011391B2B7fD1fF66BB26c126E5d4aAC",
      tokenAddress: "0x1B68626dCa36c7fE922fD2d55E4f631d962dE19c",
      chainPoolAddress: '0x1A40208E9506E08a6f62DbCCf8de7387743179E9',
    },
  ]
}

module.exports = {
  HubPoolAbi,
  HubPools,
};
