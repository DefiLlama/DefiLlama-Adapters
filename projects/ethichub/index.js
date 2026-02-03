const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require('../helper/staking');
const { sumTokensExport } = require('../helper/sumTokens');

// Mainnet
const ETHIX_TOKEN_MAINNET = '0xFd09911130e6930Bf87F2B0554c44F400bD80D3e';
const STAKED_ETHIX_MAINNET = '0x5b2bbbe7DFD83aA1f1CD0c498690E6EcC939CC2D';
const LP_ETHIX_WETH_UNIV2 = '0xb14b9464b52F502b0edF51bA3A529bC63706B458';
const MINIMICE_BOND_MAINNET = '0x21320683556BB718c8909080489F598120C554D9'; // Users deposit DAI here to lend to farmers
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

// Gnosis 
const LP_ETHIX_WXDAI_SUSHI = '0xe5bc36119ffe40541eb61949e13607bce23577eb';
const LP_ETHIX_WETH_UNIV2_GNOSIS = '0x2b8d7a0ed5e642f6441862d353c60c8f8ff2acd1';
const ETHIX_TOKEN_GNOSIS = '0xec3f3e6d7907acDa3A7431abD230196CDA3FbB19';

async function borrowed(api) {
  const borrowedAmount = await api.call({ target: api.chain == "ethereum" ? MINIMICE_BOND_MAINNET : LIQUIDITY_RESERVE_CELO, abi: 'uint256:totalBorrowed' });
  api.add(api.chain == "ethereum" ? ADDRESSES.ethereum.DAI : ADDRESSES.celo.cUSD, borrowedAmount);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: `
  1. TVL: Consists of stablecoins (DAI, cUSD, cEUR, USDC) deposited in the bonding contracts (Mainnet) and reserves (Celo) to lend to farmers.
  2. Pool2: Total liquidity in the ETHIX Uniswap V2/V3 and Sushiswap pairs.
  3. Staking: ETHIX tokens locked by users in the main staking contracts and Originator nodes.
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
    borrowed,
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
    // borrowed,
  },
  xdai: {
    pool2: sumTokensExport({
      tokens: [ETHIX_TOKEN_GNOSIS, ADDRESSES.xdai.WXDAI, ADDRESSES.xdai.WETH],
      owners: [LP_ETHIX_WXDAI_SUSHI, LP_ETHIX_WETH_UNIV2_GNOSIS],
    })
  },
  hallmarks: [
    ["2020-12-22", "Ethix launch"],
    ["2022-06-20", "Ethix on Celo network"],
  ]
}; 