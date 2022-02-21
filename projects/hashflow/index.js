const axios = require("axios");
const retry = require('../helper/retry');
const { chainExports } = require('../helper/exports');
const { sumTokens } = require("../helper/unwrapLPs");
const { getBlock } = require('../helper/getBlock');

const http_api_url = 'https://api.hashflow.com/internal/pool/getPools';
const null_addr = '0x0000000000000000000000000000000000000000';
const chainIds = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
  avax: 43114
};

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);
    const transformAddress = id=>`${chain}:${id}`;

    const url = `${http_api_url}?networkId=${chainIds[chain]}`;
    const pools_response = await retry(async () => await axios.get(url));
    const pools = pools_response.data.pools.map(pool => 
      ({
        pool: pool.pool, 
        tokens: pool.tokens.map(t => t.token)
      })
    );

    const tokensAndOwners = pools.map(p => p.tokens.map(t => [t, p.pool]))
      .reduce((a, b) => a.concat(b), []) // flatten
      .filter(x => x[0] !== null_addr);  // remove 0x000 from tokens
    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress);
    console.log(`${chain} ${block} - ${pools.length} pools and ${tokensAndOwners.length} tokensAndOwners`);
    return balances
  };
}

module.exports = chainExports(chainTvl, [
  'ethereum', 
  'polygon', 
  'bsc', 
  'arbitrum', 
  'avax'
]),
module.exports.methodology = 'Hashflow TVL is made of all pools token balances. Pools and their tokens are retrieved by Hashflow HTTP REST API.'
