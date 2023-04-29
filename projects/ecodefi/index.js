const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const stakingAbi = require('./stakingAbi.json');
const babyRouterAbi = require('./babyRouterAbi.json');
const { toUSDTBalances } = require('../helper/balances');
const { compoundExports } = require('../helper/compound');
const BASE = BigNumber(10 ** 18);
const Double = BASE * BASE;

let EsgStaking = {
  "bsc": "0x55839fe60742c7789DaBcA85Fd693f1cAbaeDd69", // ESG staking contract  
}

let EsgToken = {
  "bsc": "0x0985205D53D575CB07Dd4Fba216034dc614eab55", // ESG Token
}

let BabySwapRouter = {
  "bsc": "0x325E343f1dE602396E256B67eFd1F61C3A6B38Bd", // Router
}

let USDT = {
  "bsc": ADDRESSES.bsc.USDT, // USDT in BSC
}
/*==================================================
  TVL
  ==================================================*/

async function getESGStakingValue(chain, block) {
  const { output: totalStaked } = await sdk.api.abi.call({
    block,
    target: EsgStaking[chain],
    abi: stakingAbi['total_deposited'],
    chain: chain
  });

  const { output: esgPrice } = await sdk.api.abi.call({
    block,
    target: BabySwapRouter[chain],
    abi: babyRouterAbi['getAmountsOut'],
    params: [BASE.toString(), [EsgToken[chain], USDT[chain]]],
    chain: chain
  });

  let stakedValue = BigNumber(totalStaked.toString()).times(BigNumber(esgPrice[1].toString())).div(Double);

  return stakedValue;
}



async function staking(timestamp, ethBlock, chainBlocks) {
  let staked = await getESGStakingValue('bsc', chainBlocks['bsc']);
  return toUSDTBalances(staked);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of Total value locked in ESG protocol.',
  bsc: {
    ...compoundExports('0xfd1f241ba25b8966a14865cb22a4ea3d24c92451', 'bsc'),
    staking,
  },
  start: 15307794, // Feb-16-2022 01:49:31 PM +UTC
}
