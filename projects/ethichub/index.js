const sdk = require('@defillama/sdk');
const { transformCeloAddress } = require('../helper/portedTokens');
const { pool2 } = require("../helper/pool2");
const { staking, stakings } = require('../helper/staking');
const { unwrapBalancerToken, unwrapBalancerPool, unwrapUniswapLPs } = require('../helper/unwrapLPs');

// Mainnet
const ETHIX_TOKEN = '0xFd09911130e6930Bf87F2B0554c44F400bD80D3e';
const COLLATERAL_RESERVE_MAINNET = '0xb97Ef216006d72128576D662CFFEd2B4406E3518';
const STAKED_ETHIX_MAINNET = '0x5b2bbbe7DFD83aA1f1CD0c498690E6EcC939CC2D';
const MULTISIG_ETHICHUB_MAINNET = '0xA8f0A7dC8695c2233D847c7E34719830cdFaa4E1';
// Uniswap Mainnet Staking (Stake Contract + Multisig)
const UNISWAP_LP_ETHIXWETH = '0xb14b9464b52F502b0edF51bA3A529bC63706B458';
const STAKED_UNISWAP_LP_CONTRACT = '0x89cea15F68950DF830dFE3630d635a9eD79478F5';
// Balancer Mainnet Staking (Multisig)
const BALANCER_LP_ETHIXDAI = '0x69183d2ce96B6b8962f3013e0Af4545F26F00293';
// Bonds Mainnet
const MINIMICE_ETH = '0x21320683556BB718c8909080489F598120C554D9';
// Originators
const ORIGINATOR_BRAZIL = '0x3B61CD481Be3BA62a9a544c49d6C09FCb804d0e3';
const ORIGINATOR_HONDURAS = '0x7435C0232A69270D19F8E4010571175c3f1dd955';

// -------------------
// Celo
const ETHIX_TOKEN_CELO = '0x9995cc8F20Db5896943Afc8eE0ba463259c931ed';
const COLLATERAL_RESERVE_CELO = '0xA14B1D7E28C4F9518eb7757ddeE35a18423e1567';
const STAKED_ETHIX_CELO = '0xCb16E29d0B667BaD7266E5d0Cd59b711b6273C6B';
const MULTISIG_ETHICHUB_CELO = '0xB721E887FA79Ce52f9F86958C128fa9eD3f1c5D3';
// Ubeswap Celo Staking (Stake Contract + Multisig)
const UBESWAP_LP_ETHIXCUSD = '0x62cfA295864cfF683CDE9B47D4bACC77B885DdB7';
const STAKED_UBESWAP_LP_CONTRACT = '0xbfa2748a60976Cd18b835C75C6a20328E9a72684';
// Balancer Mainnet Staking (SymmChef + Multisig)
const SYMMETRIC_LP_ETHIXCELO = '0xaD2F9f4CD2Ae4f2dD2841EB1ea7e162fb4767D4D';
const STAKED_SYMMETRIC_LP_CONTRACT = '0x359a3060A68488F0ea43D5cD8F6F53fe81A15f59';
// Bonds Celo
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

async function poolsTvlMainnet(timestamp, block, chainBlocks) {
  const balances = {};
  const lpMultisigBalance = (await sdk.api.erc20.balanceOf({
    block: chainBlocks['ethereum'],
    target: UNISWAP_LP_ETHIXWETH,
    owner: MULTISIG_ETHICHUB_MAINNET
  })).output;
  await unwrapUniswapLPs(balances, [{ balance: lpMultisigBalance, token: UNISWAP_LP_ETHIXWETH }], chainBlocks['ethereum']);
  await unwrapBalancerToken({ block: chainBlocks['ethereum'], owner:  MULTISIG_ETHICHUB_MAINNET, balancerToken: BALANCER_LP_ETHIXDAI, balances: balances });
  return balances;
}

async function poolsTvlCelo(timestamp, block, chainBlocks) {
  const balances = {};
  const lpMultisigBalance = (await sdk.api.erc20.balanceOf({
    chain: 'celo',
    block: chainBlocks['celo'],
    target: UBESWAP_LP_ETHIXCUSD,
    owner: MULTISIG_ETHICHUB_CELO
  })).output;
  await unwrapUniswapLPs(balances, [{ balance: lpMultisigBalance, token: UBESWAP_LP_ETHIXCUSD }], chainBlocks['celo'], 'celo');
  await unwrapBalancerPool({ chain: 'celo', block: chainBlocks['celo'], owner:  MULTISIG_ETHICHUB_CELO, balancerPool: SYMMETRIC_LP_ETHIXCELO, balances: balances });
  return balances;
}

async function stakedMainnet(timestamp, block, chainBlocks) {
  const stkUniswapBalance = await pool2(STAKED_UNISWAP_LP_CONTRACT, UNISWAP_LP_ETHIXWETH)(timestamp, block, chainBlocks);
  const stkETHIXBalance = await stakings([STAKED_ETHIX_MAINNET, ORIGINATOR_BRAZIL, ORIGINATOR_HONDURAS], ETHIX_TOKEN)(timestamp, block, chainBlocks);
  const balances = { ...stkETHIXBalance, ...stkUniswapBalance };
  return balances;
}

async function stakedCelo(timestamp, block, chainBlocks) {
  const stkSymmetricBalance = {}
  const stkUbeswapBalance = await pool2(STAKED_UBESWAP_LP_CONTRACT, UBESWAP_LP_ETHIXCUSD, 'celo')(timestamp, block, chainBlocks);
  await unwrapBalancerPool({ chain: 'celo', block, owner:  STAKED_SYMMETRIC_LP_CONTRACT, balancerPool: SYMMETRIC_LP_ETHIXCELO, balances: stkSymmetricBalance });
  const stkETHIXBalance = await staking(STAKED_ETHIX_CELO, ETHIX_TOKEN_CELO, 'celo')(timestamp, block, chainBlocks);
  const balances = { ...stkUbeswapBalance, ...stkSymmetricBalance, ...stkETHIXBalance };
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: `
    1. Our general TVL is the ETHIX locked in our collateral reserves. They are found in our compensation reserves in different chains and in bond issuance contracts. These ETHIX would only move when a farmer's default appears.
    2. In the different AMM pools we have blocked an initial amount of LP tokens, in a multisig belonging to Ethichub.
    3. We have ETHIX staked in the different staking contracts in the chains where we operate. There are staked ETHIX, staked LP tokens, and ETHIX belonging to staked originator nodes.
    Active networks: ETH/CELO/GNOSIS.
    All our pools and staking options are in: https://ethix.ethichub.com, and info about project: https://ethichub.com
    `,
  start: 1608640693,
  ethereum: {
    tvl: tvlMainnet,
    pool2: poolsTvlMainnet,
    staking: stakedMainnet
  },
  celo: {
    tvl: tvlCelo,
    pool2: poolsTvlCelo,
    //staking: stakedCelo
  },
  hallmarks:[
    [1608640694, "Ethix launch"],
    [1655719625, "Ethix on Celo network"],
    [1626704101, "Originator Brazil"],
    [1634714203, "Originator Honduras"],
    [1610472600, "Grand Opening Cryptocafé in Madrid"],
  ]
};
