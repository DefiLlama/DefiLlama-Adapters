const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

const MintingHub = "0x7bbe8F18040aF0032f4C2435E7a76db6F1E346DF";
const Collaterals = ["0xb4272071ecadd69d933adcd19ca99fe80664fc08"]; // XCHF

async function tvl(api) {
  const tokensAndOwners = Collaterals.map(i => [i, MintingHub])
  const { positions } = await cachedGraphQuery('frankencoin', 'https://api.thegraph.com/subgraphs/name/frankencoin-zchf/frankencoin-subgraph', '{ positions { position collateral } }')
  positions.forEach(i => tokensAndOwners.push([i.collateral, i.position]))
  return sumTokens2({ api, tokensAndOwners, })
}

module.exports = {
  ethereum: {
    tvl,
  },
  start: '2023-10-28',
};
