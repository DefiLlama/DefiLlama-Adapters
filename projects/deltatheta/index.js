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

    // Parse addresses of the pairs
    const pairs = [];
    for (let i = 0; i < pairsLength; i++) {
      pairs.push((await sdk.api.abi.call({
        abi: factoryABI.pairsList,
        chain,
        target: FACTORY_ADDRESS,
        params: [i],
        block: chainBlocks[chain],
      })).output);
    }

    for (let i = 0; i < pairsLength; i++) {
      // Parse tokens list for each of pair addresses
      const tokens = await getTokens(pairs[i], chain);

      await Promise.all(
        tokens.map(async (token) => {
          // Get token balance for each of tokens
          const tokenBalance = (await sdk.api.abi.call({
            abi: 'erc20:balanceOf',
            chain,
            target: token,
            params: [pairs[i]],
            block: chainBlocks[chain],
          })).output;
        
          // Add a parsed balance to our TVL
          await sdk.util.sumSingleBalance(
            balances,
            transform(token),
            tokenBalance,
          );
        }),
      );
    }

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
