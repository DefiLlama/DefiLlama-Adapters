const ADDRESSES = require('../helper/coreAssets.json')
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
  const tokens = pools.map(i => i.id)
  await sumTokens2({ api, owner: v2Deposits, tokens: pools.map(i => i.id), resolveLP: true, })
  await sumTokens2({ api, tokensAndOwners: [
    [ADDRESSES.blast.USDB, '0x390b781BAf1e6Db546cF4e3354b81446947838d2'],
    [ADDRESSES.blast.WETH, '0x1856c7e0b559e9d7287473cb4b4786398db4032a'],
  ] })
  return sumTokens2({ api, owner: v3Deposits, resolveUniV3: true })
}