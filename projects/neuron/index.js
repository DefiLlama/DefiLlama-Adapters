const { getConfig } = require('../helper/cache')

const { chainExports } = require('../helper/exports');
const { sumTokens } = require("../helper/unwrapLPs");

const http_api_url = 'https://brain.goneuron.xyz/api_special/getChainTVL';
const operator = '0xebb14128e98b2966EAb5b7da3a83e8c2edca0313';
const chainIds = {
  arbitrum : 42161,
  optimism : 10,
  linea : 59144,
  base: 8453,
};

function chainTvl(chain) {
  return async (timestamp, ethBlock, {[chain]: block}) => {
    const balances = {};
    const transformAddress = id=>`${chain}:${id}`;

    const url = `${http_api_url}?chainId=${chainIds[chain]}`;
    const neuron_response = await getConfig('neuron/'+chain, url);

    const tokensAndOwners = neuron_response.map(subArray => [subArray[0], operator]);

    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress);
    
    return balances
  };
}

module.exports = chainExports(chainTvl, [
  'arbitrum', 
  'optimism', 
  'linea',
  'base', 
]),
module.exports.methodology = 'neuron TVL is made of token balances of the neuron Outpost constracts. The deployed tokens are retrieved using HTTP REST API.'
