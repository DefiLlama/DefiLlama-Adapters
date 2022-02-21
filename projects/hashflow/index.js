const sdk = require("@defillama/sdk");
const retry = require('../helper/retry')
const axios = require("axios");
const {chainExports} = require('../helper/exports');
const { transformPolygonAddress } = require("../helper/portedTokens");
const { sumTokens } = require("../helper/unwrapLPs");
const { getBlock } = require('../helper/getBlock');

const chainIds = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
  avax: 43114
}

const null_addr = '0x0000000000000000000000000000000000000000'
const http_api_url = 'https://api.hashflow.com/internal/pool/getPools'

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const block = (chain === 'ethereum') ? ethBlock : await getBlock(timestamp, chain, chainBlocks)

    const url = `${http_api_url}?networkId=${chainIds[chain]}`
    const pools_response = await retry(async bail => await axios.get(url))
    const pools = pools_response.data.pools.map(pool => 
      ({pool: pool.pool, tokens: pool.tokens.map(t => t.token)}))

    const tokensAndOwners = pools.map(p => p.tokens.map(t => [t, p.pool]))
      .reduce((a, b) => a.concat(b), [])
      .filter(x => x[0] !== null_addr);
    console.log(`${chain} ${block} - ${pools.length} pools and ${tokensAndOwners.length} tokensAndOwners`)
    
    const transformAddress = id=>`${chain}:${id}`
    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress)
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
module.exports.methodology = 'TVL is all tokens on pools'
