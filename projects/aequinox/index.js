const { getLogs } = require("../helper/cache/getLogs");
const { getUniqueAddresses } = require("../helper/utils");
const { sumTokens2 } = require('../helper/unwrapLPs')

const vault = '0xee1c8dbfbf958484c6a4571f5fb7b99b74a54aa7'

async function tvl(_, _b, _cb, { api, }) {
  const data = await getLogs({
    api,
    target: vault,
    topics: ['0xf5847d3f2197b16cdcd2098ec95d0905cd1abdaf415f07bb7cef2bba8ac5dec4'],
    fromBlock: 20457369,
    eventAbi: 'event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)'
  })
  let tokens = []
  data.forEach(i => tokens.push(...i.args.tokens))
  tokens = getUniqueAddresses(tokens)
  return sumTokens2({ api, tokens, owner: vault, })
}

module.exports = {
  methodology: `TVL is computed by summing up all the tokens in the vault: ${vault}`,
  bsc: {
    tvl,    
  },
};
