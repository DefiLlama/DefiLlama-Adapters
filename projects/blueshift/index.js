const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform } = require('../helper/portedTokens');

const abi = require('./abi.json');
const config = require("./config.json");


async function staking(chain, timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await getChainTransform(chain);

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

  sdk.util.sumSingleBalance(balances, transform(baseTokenAddress), valueInBaseToken.toNumber());

  if (balances["algorand"] !== undefined) {
    balances["algorand"] = BigNumber(balances["algorand"]).div(10**18);
  }
  // ----------------------------------------

  // CoinGecko solution
  // sdk.util.sumSingleBalance(balances, transform(tokenAddress), value);
  return balances;
}

async function tvl(chain, timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await getChainTransform(chain);

  const portfolios = (await sdk.api.abi.call({
    abi: abi.BlueshiftRegistry.getPortfolios,
    chain: chain,
    target: config.registry[chain],
    params: [],
    block: chainBlocks[chain],
  })).output;

  for (let portfolio of portfolios) {
    const value = portfolio.totalValue;
    sdk.util.sumSingleBalance(balances, transform(portfolio.baseTokenAddress), value);
  }

  if (balances["algorand"] !== undefined) {
    balances["algorand"] = BigNumber(balances["algorand"]).div(10**18);
  }

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'Accumulates TVL of all Blueshift portfolios calculated in base tokens. Adds TVL of BLUES tokens staked in Blueshift yield pools.',
  milkomeda: {
    start: 2023331,
    staking: (timestamp, block, chainBlocks) => staking('milkomeda', timestamp, block, chainBlocks),
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda', timestamp, block, chainBlocks)
  },
  milkomeda_a1: {
    start: 1300,
    // staking: (timestamp, block, chainBlocks) => staking('milkomeda_a1', timestamp, block, chainBlocks),
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda_a1', timestamp, block, chainBlocks)
  }
};
