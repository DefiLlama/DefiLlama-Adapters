const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { transformBalances } = require('../helper/portedTokens');

const abi = require('./abi.json');
const config = require("./config.json");


async function staking(chain, chainBlocks) {
  const balances = {};

  const value = (await sdk.api.abi.call({
    abi: abi.BlueshiftEarning.getAccDeposit,
    chain: chain,
    target: config.manualPool[chain],
    params: [],
    block: chainBlocks[chain],
  })).output;

  const tokenAddress = (await sdk.api.abi.call({
    abi: abi.BlueshiftEarning.getToken,
    chain: chain,
    target: config.manualPool[chain],
    params: [],
    block: chainBlocks[chain],
  })).output;

  sdk.util.sumSingleBalance(balances, tokenAddress, value);
  return transformBalances(chain, balances)
}

async function tvl(chain, chainBlocks) {
  const balances = {};

  const portfolios = (await sdk.api.abi.call({
    abi: abi.BlueshiftRegistry.getPortfolios,
    chain: chain,
    target: config.registry[chain],
    params: [],
    block: chainBlocks[chain],
  })).output;

  for (let portfolio of portfolios) {
    const value = portfolio.totalValue;
    sdk.util.sumSingleBalance(balances, portfolio.baseTokenAddress, value);
  }
  return transformBalances(chain, balances)
}

module.exports = {
  methodology: 'Accumulates TVL of all Blueshift portfolios calculated in base tokens. Adds TVL of BLUES tokens staked in Blueshift yield pools.',
  milkomeda: {
    start: 2023331,
    staking: (timestamp, block, chainBlocks) => staking('milkomeda',chainBlocks),
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda',chainBlocks)
  },
  milkomeda_a1: {
    start: 1300,
    staking: (timestamp, block, chainBlocks) => staking('milkomeda_a1',chainBlocks),
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda_a1',chainBlocks)
  }
};
