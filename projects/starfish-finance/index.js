const { staking } = require("../helper/staking.js");
const { cachedGraphQuery } = require('../helper/cache')

const addresses = {
  astar: {
    seanStaking: "0xa86dc743efBc24AF4c1FC5d150AaDb4DCF52c868",
    seanToken: "0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E",
  },
}

async function tvl(api) {
  
  const vault = '0x496F6125E1cd31f268032bd4cfaA121D203639b7'
  const vaultQuery = `{ pools(first: 1000 offset: 0 ) { nodes { tokensList } } }`
  const { pools: { nodes } } = await cachedGraphQuery('starfish-fi', 'https://api.subquery.network/sq/Starfish-Finance/starfish-finance', vaultQuery)
  return api.sumTokens({ owner: vault, tokens: nodes.map(p => p.tokensList).flat() })
}

module.exports = {
  astar: {
    tvl,
    staking: staking(addresses.astar.seanStaking, addresses.astar.seanToken,),
  },
};
