const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const Abis = require('./abi.json');
const {getTokenId} = require('./utils')

const Contracts = {
  moonbeam: {
    pools: {
      'ob3p': '0x04e274f709e1ae71aff4f994b4267143ec6a381a',
      'ob3pbusd': '0x7e758319d46E0A053220e3728B3eE47a1979316a',
    },
    ignoredLps: ['0xe7a7dfb89f84a0cf850bcd399d0ec906ab232e9d'],
  }
};

const poolTvl = async (chain, poolAddress, block) => {
  const [balances, tokens] = await Promise.all([
    sdk.api.abi.call({
      target: poolAddress,
      abi: Abis.getTokenBalances,
      chain: chain,
      block,
    }),
    sdk.api.abi.call({
      target: poolAddress,
      abi: Abis.getTokens,
      chain: chain,
      block,
    }),
  ]);

  const sum = {};

  tokens.output.forEach((token, i) => {
    if (
      Contracts[chain].ignoredLps &&
      Contracts[chain].ignoredLps.includes(token.toLowerCase())
    ) {
      return;
    }
    const [symbol, decimals] = getTokenId(token.toLowerCase());
    sum[symbol] = new BigNumber(balances.output[i]).div(new BigNumber(10).pow(decimals)).toNumber()
  });

  return sum;
};

const moonbeamTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks['moonbeam'];
  const tvl = {};

  for (let address of Object.values(Contracts.moonbeam.pools)) {
    const balances = await poolTvl(
      'moonbeam',
      address,
      block,
    );

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};

module.exports = {
  moonbeam: {
    tvl: moonbeamTvl,
  },
  
};
