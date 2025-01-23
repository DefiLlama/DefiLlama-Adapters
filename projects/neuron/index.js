const { getConfig } = require('../helper/cache')
const { chainExports } = require('../helper/exports');

const http_api_url = 'https://brain.goneuron.xyz/api_special/getChainTVL';
const operator = '0xebb14128e98b2966EAb5b7da3a83e8c2edca0313';
const chainIds = {
  arbitrum : 42161,
  optimism : 10,
  linea : 59144,
  base: 8453,
};

const outpostAddresses = {
  42161 : "0x2395e53b250f091f38858ca9e75398181d45682b",
  10 : "0x2395e53b250f091f38858ca9e75398181d45682b",
  59144 : "0x2395e53b250f091f38858ca9e75398181d45682b",
  8453 : "0xe204912f188514ab33ba75c96bc81fe973db1046",
};

function chainTvl(chain) {
  return async (api) => {
    const urlTvl = `${http_api_url}?chainId=${api.getChainId()}`;
    const neuron_response_tvl = await getConfig('neuron/'+chain, urlTvl);
    var [address, tokensAndAmounts] = neuron_response_tvl;
    const outpostAddress = outpostAddresses[api.getChainId()];
    return api.sumTokens({ owner: outpostAddress, tokens: tokensAndAmounts.map(i => i[0]) })
  };
}

module.exports = chainExports(chainTvl, Object.keys(chainIds)),
module.exports.methodology = 'neuron TVL is made of token balances of the neuron Outpost constracts. The deployed tokens are retrieved using HTTP REST API.'
