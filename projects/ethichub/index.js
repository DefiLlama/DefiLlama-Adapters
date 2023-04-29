const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { transformCeloAddress } = require('../helper/portedTokens');
const { pool2 } = require("../helper/pool2");
const { stakings } = require('../helper/staking');

// Mainnet
const ETHIX_TOKEN = '0xFd09911130e6930Bf87F2B0554c44F400bD80D3e';
const COLLATERAL_RESERVE_MAINNET = '0xb97Ef216006d72128576D662CFFEd2B4406E3518';
const STAKED_ETHIX_MAINNET = '0x5b2bbbe7DFD83aA1f1CD0c498690E6EcC939CC2D';
const ETHIX_WETH_UNIV2 = '0xb14b9464b52F502b0edF51bA3A529bC63706B458';
const STAKED_UETHIX_MAINNET = '0x89cea15F68950DF830dFE3630d635a9eD79478F5';
const MINIMICE_ETH = '0x21320683556BB718c8909080489F598120C554D9';
const ORIGINATOR_BRAZIL = '0x3B61CD481Be3BA62a9a544c49d6C09FCb804d0e3';
const ORIGINATOR_HONDURAS = '0x7435C0232A69270D19F8E4010571175c3f1dd955';
// Celo
const ETHIX_TOKEN_CELO = ADDRESSES.celo.ETHIX;
const COLLATERAL_RESERVE_CELO = '0xA14B1D7E28C4F9518eb7757ddeE35a18423e1567';
const STAKED_ETHIX_CELO = '0xCb16E29d0B667BaD7266E5d0Cd59b711b6273C6B';
const MINIMICE_CELO = '0x0f497a790429685a3CfD43b841865Ee185378ff0';

async function tvlMainnet(timestamp, block, chainBlocks) {
  const balances = {};

  const collateralBalanceMainnet = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'ethereum',
    target: ETHIX_TOKEN,
    params: [COLLATERAL_RESERVE_MAINNET],
    block: chainBlocks['ethereum'],
  })).output;
  sdk.util.sumSingleBalance(balances, ETHIX_TOKEN, collateralBalanceMainnet);

  const minimiceBalanceMainnet = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'ethereum',
    target: ETHIX_TOKEN,
    params: [MINIMICE_ETH],
    block: chainBlocks['ethereum'],
  })).output;
  sdk.util.sumSingleBalance(balances, ETHIX_TOKEN, minimiceBalanceMainnet);

  return balances;
}

async function tvlCelo(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformCeloAddress();

  const collateralBalanceCelo = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'celo',
    target: ETHIX_TOKEN_CELO,
    params: [COLLATERAL_RESERVE_CELO],
    block: chainBlocks['celo'],
  })).output;
  sdk.util.sumSingleBalance(balances, transform(ETHIX_TOKEN_CELO), collateralBalanceCelo);

  const minimiceBalanceCelo = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'celo',
    target: ETHIX_TOKEN_CELO,
    params: [MINIMICE_CELO],
    block: chainBlocks['celo'],
  })).output;
  sdk.util.sumSingleBalance(balances, transform(ETHIX_TOKEN_CELO), minimiceBalanceCelo);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Count of the tokens in pools, reserves...',
  start: 1608640693,
  ethereum: {
    tvl: () => ({}),
    pool2: pool2(STAKED_UETHIX_MAINNET, ETHIX_WETH_UNIV2),
    staking: stakings([STAKED_ETHIX_MAINNET, ORIGINATOR_BRAZIL, ORIGINATOR_HONDURAS], ETHIX_TOKEN)
  },
  celo: {
    tvl: () => ({}),
    staking: stakings([STAKED_ETHIX_CELO], ETHIX_TOKEN_CELO, 'celo')
  },
  hallmarks:[
    [1608640694, "Ethix launch"],
    [1655719625, "Ethix on Celo network"],
    [1626704101, "Originator Brazil"],
    [1634714203, "Originator Honduras"],
    [1610472600, "Grand Opening Cryptocafé in Madrid"],
  ]
}; 
