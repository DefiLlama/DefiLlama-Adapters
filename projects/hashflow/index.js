const axios = require("axios");
const retry = require('../helper/retry');
const sdk = require("@defillama/sdk");
const { getChainTransform } = require('../helper/portedTokens')
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
    const transformAddress = await getChainTransform(chain);
    const chainId = chainIds[chain]
    const url = `${http_api_url}?networkId=${chainId}&lp=${null_addr}`;
    let pools_response = (await retry(async () => await axios.get(url))).data

    const pools = pools_response.pools.map(pool => 
      ({
        pool: pool.pool, 
        tokens: pool.tokens.map(t => t.token)
      })
    );

    const tokensAndOwners = pools.map(p => p.tokens.map(t => [t, p.pool]))
      .reduce((a, b) => a.concat(b), []) // flatten
      .filter(x => x[0] !== null_addr);  // remove 0x000 from tokens

    const poolBalances = await sdk.api.eth.getBalances({
      targets: pools.map(i => i.pool),
      block,
      chain,
    })

    poolBalances.output.forEach(({ balance }) => sdk.util.sumSingleBalance(
      balances,
      transformAddress("0x0000000000000000000000000000000000000000"),
      balance
    ))
    
    return sumTokens(balances, tokensAndOwners, block, chain, transformAddress);
  }
}

module.exports = chainExports(chainTvl, [
  'ethereum', 
  'polygon', 
  'bsc', 
  'arbitrum', 
  'avax'
]),
module.exports.methodology = 'Hashflow TVL is made of all pools token balances. Pools and their tokens are retrieved by Hashflow HTTP REST API.'
module.exports.broken = 'Server IP is blocked, so api call fails'