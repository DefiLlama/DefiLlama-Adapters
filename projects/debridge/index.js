const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');

const http_api_url = 'https://api.debridge.finance/api/Pairs/getForChain';
const debridgeGate = '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA';

const isEvmAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

const tvl = async (api) => {
  const { chain, chainId } = api
  const url = `${http_api_url}?chainId=${chainId}`;
  const debridge_response = await getConfig('debridge/' + chain, url);

  const tokens = debridge_response
    .filter(t => t.tokenAddress && isEvmAddress(t.tokenAddress) && !t.tokenName.startsWith('deBridge '))
    .map(t => t.tokenAddress);

  return sumTokens2({ api, owner: debridgeGate, tokens })
}

const chains = ['ethereum', 'bsc', 'heco', 'polygon', 'arbitrum', 'sei']
chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
module.exports.methodology = 'Debridge TVL is made of token balances of the DebridgeGate contracts. The deployed tokens are retrieved using Debridge HTTP REST API.'
