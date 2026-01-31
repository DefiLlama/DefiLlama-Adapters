const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require('../helper/staking');
const { sumTokensExport } = require('../helper/sumTokens');

// Mainnet
const ETHIX_TOKEN_MAINNET = '0xFd09911130e6930Bf87F2B0554c44F400bD80D3e';
const STAKED_ETHIX_MAINNET = '0x5b2bbbe7DFD83aA1f1CD0c498690E6EcC939CC2D';
const LP_ETHIX_WETH_UNIV2 = '0xb14b9464b52F502b0edF51bA3A529bC63706B458';
const MINIMICE_BOND_MAINNET = '0x21320683556BB718c8909080489F598120C554D9'; // Users deposit DAI here to lend to farmers
const COLLATERAL_RESERVE_MAINNET = '0xb97Ef216006d72128576D662CFFEd2B4406E3518'; // Protocol owned
const TREASURY_MAINNET = '0xb27132625173F813085E438eE19c011867063073'; // Protocol owned (Rewards reserve)
const ORIGINATORS_MAINNET = [
    '0x3B61CD481Be3BA62a9a544c49d6C09FCb804d0e3', // UM_COFFEE Brazil
    '0x7435C0232A69270D19F8E4010571175c3f1dd955', // DICAFE Honduras
    '0x2f19BD0a8B9E10fd921fF18Eb8689c491e2de481', // NORTFRUIT Peru
    '0xE0324499eDe832BD11fa37efEfA46077D7d9784e' // CAFE_SUSTENTABLE Mexico
];

// Celo
const ETHIX_TOKEN_CELO = ADDRESSES.celo.ETHIX;
const CEUR_TOKEN_CELO = '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73';
const STAKED_ETHIX_CELO = '0xCb16E29d0B667BaD7266E5d0Cd59b711b6273C6B';
const LP_ETHIX_CUSD_UNIV3 = '0x3420720E561F3082f1e514a4545f0F2e0c955a5d';
const LIQUIDITY_RESERVE_CELO = '0x8510294a4d1e27CCe09259C448233207a83C5B62'; // Contains users' deposits from Minimice bonds to be borrowed by the farmers
const COLLATERAL_RESERVE_CELO = '0xA14B1D7E28C4F9518eb7757ddeE35a18423e1567'; // Protocol owned
const TREASURY_CELO = '0xa9a824bD0470d0d00938105986ebfbFa71b28530'; // Protocol owned (Rewards reserve)
const ORIGINATORS_CELO = [
    '0xCc0d68B5E9C0E92E8d7426fB585052442EA9EEF7', // CAFE_FUNDADORES Mexico
    '0xE7C12A879358A0592c8c6dac5336640Ac663B130', // CERES Mexico
    '0x8181d3B933228C3E70496d11F057610E78582c7C', // CoRi Mexico
    '0x8D6BfF874c25796059cf0a989c12a6d076e9502A', // COSTAL_CAMPESINO_2 Colombia
    '0x0306f70D3E69E30F49d28cB0eD33fD9d439043A8', // FABEDI Colombia
    '0xBf0978445CE601f83c3AEA580792E04F4EAb1c60', // PRODUCTOS_AGROALIMENTARIOS Mexico
    '0x18843ec5c23a290E1C866fAd9acaFB6160Ab9693', // RESERVA_1920 Mexico
    '0x7D413D46aDAE770DFF0E478F566B5539853D2FA1', // SIERRA_AZUL Mexico
    '0x903134cEd009e39A8a3A1475c800fB5a5Ad032Ea', // UM_COFFEE Brazil
    '0xe33c7d39f6721ef0fc8fFc59c8e2f313e774073a', // ANEPAAN Mexico
    '0x6Ed2471b09a0A3b35c7e5C977E8A4E00EA5000F7', // CAFE_SUSTENTABLE Mexico
    '0x51246AE0ba74696a66f0DC9e5f214d1C48eF1F55', // COSTAL_CAMPESINO Colombia
    '0x2FFA2c9678C75a7e1324C3fB67Ac28676306389A', // SAN_MARCOS Honduras
    '0x11E23E85b032C1854e9994c59cF6Bf546E6e80e5' // SIERRA_AZUL_2 Mexico
];

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: `
  1. TVL: Consists of stablecoins (DAI, cUSD, cEUR, USDC) deposited in the bonding contracts (Mainnet) and reserves (Celo) to lend to farmers.
  2. Pool2: Total liquidity in the ETHIX Uniswap V2/V3 pairs.
  3. Staking: ETHIX tokens locked by users in the main staking contracts and Originator nodes.
  4. Treasury: Protocol-owned ETHIX locked in Collateral Reserves (insurance fund for defaults) and Rewards Treasury.
  Active networks: Ethereum and Celo.
  Project info: https://ethichub.com
  `,
  start: '2020-12-22',
  ethereum: {
    tvl: sumTokensExport({
      owner: MINIMICE_BOND_MAINNET,
      tokens: [ADDRESSES.ethereum.DAI]
    }),
    pool2: sumTokensExport({
      owner: LP_ETHIX_WETH_UNIV2,
      tokens: [ETHIX_TOKEN_MAINNET, ADDRESSES.ethereum.WETH]
    }),
    staking: stakings([STAKED_ETHIX_MAINNET, ...ORIGINATORS_MAINNET], ETHIX_TOKEN_MAINNET),
    // Treasury key is not supported for testing. Please uncomment for production if supported.
    /*
    treasury: sumTokensExport({
      owners: [COLLATERAL_RESERVE_MAINNET, TREASURY_MAINNET],
      tokens: [ETHIX_TOKEN_MAINNET]
    })
    */
  },
  celo: {
    tvl: sumTokensExport({
      owner: LIQUIDITY_RESERVE_CELO,
      tokens: [ADDRESSES.celo.cUSD, CEUR_TOKEN_CELO, ADDRESSES.celo.USDC]
    }),
    pool2: sumTokensExport({
      owner: LP_ETHIX_CUSD_UNIV3,
      tokens: [ETHIX_TOKEN_CELO, ADDRESSES.celo.cUSD]
    }),
    staking: stakings([STAKED_ETHIX_CELO, ...ORIGINATORS_CELO], ETHIX_TOKEN_CELO),
    // Treasury key is not supported for testing. Please uncomment for production if supported.
    /*
    treasury: sumTokensExport({
      owners: [COLLATERAL_RESERVE_CELO, TREASURY_CELO],
      tokens: [ETHIX_TOKEN_CELO]
    })
    */  
  },
  hallmarks:[
    ["2020-12-22", "Ethix launch"],
    ["2022-06-20", "Ethix on Celo network"],
  ]
}; 
