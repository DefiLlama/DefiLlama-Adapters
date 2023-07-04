const sdk = require('@defillama/sdk');
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
  return transformBalances(chain, balances);
}

async function tvl(chain, chainBlocks) {
  const balances = {};

  // Blueschain reserves
  if (config.blueschain[chain]) {
    const tokenBalances = await Promise.all(
      config.blueschain[chain].tokens.map(async token => (await sdk.api.abi.call({
        abi: abi.ERC20.balanceOf,
        chain: chain,
        target: token,
        params: [config.blueschain[chain].reserve],
        block: chainBlocks[chain],
      })).output)
    );

    for (let i = 0; i < tokenBalances.length; ++i) {
      sdk.util.sumSingleBalance(balances, config.blueschain[chain].tokens[i], tokenBalances[i]);
    }
  }

  // Local reserves
  if (config.registry[chain]) {
    const portfolios = (await sdk.api.abi.call({
      abi: abi.BlueshiftRegistry.getPortfolios,
      chain: chain,
      target: config.registry[chain],
      params: [],
      block: chainBlocks[chain],
    })).output;

    for (let i = 0; i < portfolios.contractAddress.length; ++i) {
      sdk.util.sumSingleBalance(balances, portfolios.baseTokenAddress[i], portfolios.totalValue[i]);
    }
  }

  return transformBalances(chain, balances);
}

module.exports = {
  methodology: 'Accumulates TVL of all Blueshift portfolios calculated in base tokens. Adds TVL of BLUES tokens staked in Blueshift yield pools.',
  milkomeda: {
    start: 2023331,
    staking: (timestamp, block, chainBlocks) => staking('milkomeda', chainBlocks),
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda', chainBlocks)
  },
  milkomeda_a1: {
    start: 1300,
    staking: (timestamp, block, chainBlocks) => staking('milkomeda_a1', chainBlocks),
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda_a1', chainBlocks)
  },
  kava: {
    start: 2499737,
    staking: (timestamp, block, chainBlocks) => staking('kava', chainBlocks),
    tvl: (timestamp, block, chainBlocks) => tvl('kava', chainBlocks)
  },
  polygon: {
    start: 43057589,
    tvl: (timestamp, block, chainBlocks) => tvl('polygon', chainBlocks)
  }
};
