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


  // temporary solution using BLUES/(ADA or ALGO) price
  const portfolios = (await sdk.api.abi.call({
    abi: abi.BlueshiftRegistry.getPortfolios,
    chain: chain,
    target: config.registry[chain],
    params: [],
    block: chainBlocks[chain],
  })).output;

  const bluesPortfolio = portfolios.filter(portfolio => portfolio.contractAddress === config.blueshiftPortfolio[chain])[0];
  if (!bluesPortfolio) {
    return balances;
  }

  const baseTokenAddress = bluesPortfolio.baseTokenAddress;
  const baseTokenPrice = bluesPortfolio.tokens.filter(token => token.tokenAddress === baseTokenAddress)[0].price;
  const tokenPrice = bluesPortfolio.tokens.filter(token => token.tokenAddress === tokenAddress)[0].price;
  const valueInBaseToken = BigNumber(value).multipliedBy(tokenPrice).div(baseTokenPrice);

  sdk.util.sumSingleBalance(balances, baseTokenAddress, valueInBaseToken.toNumber());
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
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda_a1',chainBlocks)
  }
};
