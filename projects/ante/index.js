const sdk = require('@defillama/sdk');
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const { createIncrementArray } = require('../helper/utils');

const CONFIG = {
  ethereum: {
    factories: [
      {
        factory: '0xa03492A9A663F04c51684A3c172FC9c4D7E02eDc',
        version: '0.5.0',
      },
      {
        factory: '0x89E583A67B5FA1B39b8CE7E77654071c3a34cc48',
        version: '0.6.0',
      },
    ],
    startBlock: 13234803,
    gasToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  avax: {
    factories: [
      {
        factory: '0x18aB6357f673696375018f006B86fE44F195DE1f',
        version: '0.5.1',
      },
    ],
    startBlock: 16037331,
    gasToken: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  },
  polygon: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
      },
    ],
    startBlock: 32245577,
    gasToken: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  bsc: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
      },
    ],
    startBlock: 20928838,
    gasToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  fantom: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
      },
    ],
    startBlock: 46604874,
    gasToken: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  },
  optimism: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.2',
      },
      {
        factory: '0x4f2be0244146b4408154504a481c799ba1a9a355',
        version: '0.6.0',
      },
    ],
    startBlock: 39240199,
    gasToken: '0x4200000000000000000000000000000000000006',
  },
  arbitrum: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.2',
      },
    ],
    startBlock: 33495774,
    gasToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  aurora: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.2',
      },
    ],
    startBlock: 80670441,
    gasToken: '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb',
  },
};

Object.keys(CONFIG).forEach((chain) => {
  const { startBlock, factories } = CONFIG[chain];
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      let calls, currentRes;
      const pools = [];
      let tokens = [];
      let i = 0;
      const length = 4;

      for (const factory of factories) {
        if (factory.version >= '0.6') {
          const controller = await sdk.api.abi.call({
            target: factory.factory,
            abi: abis.getController,
            chain,
            block,
          });
          const allowedTokens = await sdk.api.abi.call({
            target: controller.output,
            abi: abis.getAllowedTokens,
            chain,
            block,
          });

          tokens = [...new Set([...tokens, ...allowedTokens.output])];
        }
        do {
          calls = createIncrementArray(4).map((j) => ({
            params: j + i * length,
          }));
          const { output: res } = await sdk.api.abi.multiCall({
            target: factory.factory,
            abi: abis.allPools,
            calls,
            chain,
            block,
          });

          currentRes = res.map((i) => i.output).filter((i) => i);

          pools.push(...currentRes);

          i++;
        } while (currentRes.length === length);
      }
      return sumTokens2({
        tokens: [nullAddress, ...tokens],
        owners: pools,
        chain,
        block,
      });
    },
    start: startBlock,
  };
});

const abis = {
  allPools: 'function allPools(uint256) view returns (address)',
  getController: 'function controller() view returns (address)',
  getAllowedTokens: 'function getAllowedTokens() view returns (address[])',
};
