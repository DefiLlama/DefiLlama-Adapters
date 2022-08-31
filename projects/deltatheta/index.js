const sdk = require('@defillama/sdk');
const {
  transformBscAddress,
  transformPolygonAddress,
} = require('../helper/portedTokens');
const { getTokens } = require('../helper/getTokens');

// Delta.theta Factory ABI (for needed calls)
const factoryABI = require('./factory.abi');

// Delta.theta Factory Address (On all chains)
const FACTORY_ADDRESS = '0x000000000092126dc1bcec881165f92169733106';

// Idk why, but convenient [...Array(10).keys()] method is not working in adapter testing
const range = (n) => Array.from({ length: n }, (_, i) => i);

// TVL function generator (for BSC & POLYGON chains)
function tvl(chain) {
  const balances = {};

  return async (_, __, chainBlocks) => {
    // Prepare transform function for the selected chain
    const transform = await (
      chain === 'bsc'
        ? transformBscAddress()
        : transformPolygonAddress()
    );

    // Parse factory's pairs length
    const pairsLength = (await sdk.api.abi.call({
      abi: factoryABI.pairsLength,
      chain,
      target: FACTORY_ADDRESS,
      params: [],
      block: chainBlocks[chain],
    })).output;

    const pairsOutput = (await sdk.api.abi.multiCall({
      abi: factoryABI.pairsList,
      chain,
      calls: range(pairsLength).map((index) => ({
        target: FACTORY_ADDRESS,
        params: [index]
      })),
      block: chainBlocks[chain],
      requery: true
    })).output
    const pairs = pairsOutput.map(result => result.output.toLowerCase())

    await Promise.all(range(pairsLength).map(
      async (i) => {
        // Parse tokens list for each of pair addresses
        const tokens = await getTokens(pairs[i], chain);

        // Parse all balances
        const balancesOutput = (await sdk.api.abi.multiCall({
          abi: 'erc20:balanceOf',
          chain,
          calls: tokens.map((token) => ({
            target: token,
            params: [pairs[i]]
          })),
          block: chainBlocks[chain],
          requery: true,
        }));

        // Sum all balances
        await sdk.util.sumMultiBalanceOf(
          balances,
          balancesOutput,
          true,
          transform,
        );
      }
    ));

    return balances;
  };
}
module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Parsing the balances of all tokens on the pair addresses of decentralized exchange Delta.theta',
  start: 0,
  bsc: {
    tvl: tvl('bsc'),
  },
  polygon: {
    tvl: tvl('polygon'),
  },
};
