const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');
const { transformFantomAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")

const ExodStaking = "0x8b8d40f98a2f14e2dd972b3f2e2a2cc227d1e3be"
const exod = "0x3b57f3feaaf1e8254ec680275ee6e7727c7413c7"
const exodDaiSLP = "0xc0c1dff0fe24108586e11ec9e20a7cbb405cb769"
const treasury = "0x6a654d988eebcd9ffb48ecd5af9bd79e090d8347"
const dai = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"

async function exodPrice(block) {
  let balances = {};

  const totalSupply = (await sdk.api.abi.call({
    block,
    target: exodDaiSLP,
    abi: 'erc20:totalSupply',
    chain: 'fantom'
  })).output;

  await unwrapUniswapLPs(
    balances, 
    [{token: exodDaiSLP, balance: totalSupply}],
    block,
    'fantom');

  return balances[dai] / balances[exod]
};

const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformFantomAddress();
  const stakingBalance = await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: exod,
      params: ExodStaking,
      block: chainBlocks.fantom,
      chain: 'fantom'
    });

    const price = await exodPrice(chainBlocks.fantom)
    const balanceInUSD = 
      stakingBalance.output * (await exodPrice(chainBlocks.fantom));

    sdk.util.sumSingleBalance(
      balances, 
      '0x6b175474e89094c44da98b954eedeac495271d0f', 
      balanceInUSD);

  return balances;
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [dai, false],
      [exodDaiSLP, true]
    ],
    [treasury],
    chainBlocks.fantom,
    'fantom',
    transformAddress
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl,
  },
  staking: {
    tvl: staking,
  },
  tvl,
  methodology:
    "Counts tokens on the treasury for TVL and staked EXOD for staking",
};