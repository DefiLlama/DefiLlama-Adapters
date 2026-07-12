const { sumTokensExport } = require('../helper/unwrapLPs')
const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');

// --- inlined from ./v1 ---
const vaultAddress = "0x86C077092018077Df34FF44D5D7d3f9A2DF03bEf"
const TVLV1 = sumTokensExport({ owner: vaultAddress, fetchCoValentTokens: true, })

// --- inlined from ./v2 ---
const config = {
  ethereum: { factory: '0xE0CF093Ce6649Ef94fe46726745346AFc25214D8', },
  avax: { factory: '0xEC143bb9FEE95B7726bF49108f085D02816e53eA', },
  era: { factory: '0x44E12D14b63806A817B1AA6886215caA6aa136a7', },
}

const tvlV2 = async function tvl(api) {
  const { factory } = config[api.chain]

  const sets = await api.call({
    target: factory,
    abi: 'address[]:getSets',
  })

  const components = await api.multiCall({
    abi: 'address[]:getComponents',
    calls: sets,
  })

  const toa = []
  components.forEach((tokens, i) => toa.push(...tokens.map(t => ([t, sets[i]]))))
  return sumTokens2({ api, tokensAndOwners: toa })
};

module.exports = {
  start: '2020-07-27', // 27/07/2020 @ 12:43:45am (UTC)
  ethereum: { tvl: sdk.util.sumChainTvls([TVLV1, tvlV2]) },
  avax: { tvl: tvlV2 },
  era: { tvl: tvlV2 }
}
