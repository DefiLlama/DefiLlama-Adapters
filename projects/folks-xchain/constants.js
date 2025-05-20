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
    { // aUSD
      poolAddress: '0xc7DdB440666c144c2F27a3a5156D636Bacfc769C',
      tokenAddress: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a',
      chainPoolAddress: '0x666aea026bC606220ec6eb83a83D81881fA48e0f',
    },
    { // savUSD
      poolAddress: '0xE6B7713854620076B5716E2743262D315bf8609D',
      tokenAddress: '0x06d47F3fb376649c3A9Dafe069B3D6E35572219E',
      chainPoolAddress: '0xe396E1246B7341Eb6EDA05DCfef9EaB9E661f80C',
    },
  ],
  'ethereum': [
    // excluding USDC cause bridged
    // excluding SolvBTC cause bridged
    { // ETH_eth      
      poolAddress: "0xB6DF8914C084242A19A4C7fb15368be244Da3c75",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0xe3B0e4Db870aA58A24f87d895c62D3dc5CD05883',
    },
    { // wBTC_eth      
      poolAddress: "0x9936812835476504D6Cf495F4F0C718Ec19B3Aff",
      chainPoolAddress: "0xb39c03297E87032fF69f4D42A6698e4c4A934449",
      tokenAddress: ADDRESSES.ethereum.WBTC,
    },
  ],
  'base': [
    // excluding USDC cause bridged
    // excluding SolvBTC cause bridged
    { // ETH_base
      poolAddress: "0x51958ed7B96F57142CE63BB223bbd9ce23DA7125",
      tokenAddress: ADDRESSES.null,
      chainPoolAddress: '0xe3B0e4Db870aA58A24f87d895c62D3dc5CD05883',
    },
    { // cbBTC_base      
      poolAddress: "0x9eD81F0b5b0E9b6dE00F374fFc7f270902576EF7",
      tokenAddress: ADDRESSES.ethereum.cbBTC,
      chainPoolAddress: '0x50d5Bb3Cf57D2fB003b602A6fD10F90baa8567EA',
    },
  ],
  'bsc': [
    // excluding SolvBTC cause bridged
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
      tokenAddress: '0x4186BFC76E2E237523CBC30FD220FE055156b41F',
      chainPoolAddress: '0xC0a3536E0b6799014A14664bA4370BBd5D0c7590',
    },
  ],
  'polygon': [
    // excluding USDC cause bridged
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
  ],
}

module.exports = {
  HubPoolAbi,
  HubPools,
};
