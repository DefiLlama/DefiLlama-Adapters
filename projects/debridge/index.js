const { getConfig } = require('../helper/cache')

const { chainExports } = require('../helper/exports');
const { sumTokens } = require("../helper/unwrapLPs");

const http_api_url = 'https://api.debridge.finance/api/Pairs/getForChain';
const debridgeGate = '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA';
const chainIds = {
  ethereum: 1,
  bsc: 56,
  heco: 128,
  polygon: 137,
  arbitrum: 42161,
};

function chainTvl(chain) {
  return async (timestamp, ethBlock, {[chain]: block}) => {
    const balances = {};
    const transformAddress = id=>`${chain}:${id}`;

    const url = `${http_api_url}?chainId=${chainIds[chain]}`;
    const debridge_response = await getConfig('debridge/'+chain,url);
    const tokensAndOwners = debridge_response
      .filter(t => !t.tokenName.startsWith('deBridge '))
      .map(t => [t.tokenAddress, debridgeGate]);

    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress);
    
    return balances
  };
}

module.exports = chainExports(chainTvl, [
  'ethereum', 
  'bsc', 
  'heco',
  'polygon', 
  'arbitrum', 
]),
module.exports.methodology = 'Debridge TVL is made of token balances of the DebridgeGate contracts. The deployed tokens are retrieved using Debridge HTTP REST API.'
