const { sumTokens2 } = require("../helper/unwrapLPs");
const { cachedGraphQuery } = require('../helper/cache')

const v2Deposits = "0xC3EcaDB7a5faB07c72af6BcFbD588b7818c4a40e";
const v3Deposits = "0xc28EffdfEF75448243c1d9bA972b97e32dF60d06";

// https://docs.hyperlock.finance/developers/hyperlock-contracts
module.exports = {
  doublecounted: true,
  blast: {
    tvl,
  },
}


const query = `{
  pools(where:{type: V2}) { id type }
}`


async function tvl(api) {
  const { pools } = await cachedGraphQuery('hyperlock/v2', 'https://graph.hyperlock.finance/subgraphs/name/hyperlock/points-blast-mainnet', query)
  console.log(pools)
  await sumTokens2({ api, owner: v2Deposits, tokens: pools.map(i => i.id), resolveLP: true, })
  return sumTokens2({ api, owner: v3Deposits, resolveUniV3: true })

}