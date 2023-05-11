const sdk = require('@defillama/sdk');
const {
  transformBscAddress,
  transformPolygonAddress,
} = require('../helper/portedTokens');
const { covalentGetTokens } = require('../helper/http');

// Delta.theta Factory ABI (for needed calls)
const factoryABI = require('./factory.abi');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Delta.theta Factory Address (On all chains)
const FACTORY_ADDRESS = '0x000000000092126dc1bcec881165f92169733106';

// Idk why, but convenient [...Array(10).keys()] method is not working in adapter testing
const range = (n) => Array.from({ length: n }, (_, i) => i);

// TVL function generator (for BSC & POLYGON chains)
function tvl(chain) {
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
    console.log(chain, pairs)
    const toa = []

    await Promise.all(range(pairsLength).map(
      async (i) => {
        // Parse tokens list for each of pair addresses
        const tokens = await covalentGetTokens(pairs[i], chain);
        tokens.forEach(t => toa.push([t, pairs[i]]))
       }));

    return sumTokens2({ chain, block: chainBlocks[chain], tokensAndOwners: toa, });
  };
}
module.exports = {
  methodology: 'Parsing the balances of all tokens on the pair addresses of decentralized exchange Delta.theta',
  start: 0,
  bsc: {
    tvl: tvl('bsc'),
  },
  polygon: {
    tvl: tvl('polygon'),
  },
};
