// QVTX TVL Protocol Adapter for DefiLlama
// Tracks liquidity pools: wQVTX/QUSD on Polygon, DBIS LP on QVTX Chain 138
// Canonical registry: https://raw.githubusercontent.com/quant-oss/qone/main/qusd.tokenlist.json
// Protocol: https://qvtx.net

const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const QVTX_POOLS = {
  polygon: {
    // wQVTX/QUSD pool on Polygon
    pools: [
      {
        contract: '0xEf12DC21C0A74a975741e975f2893Ff78F12b0C1',
        tokens: [
          '0x8d58dEbF89740Da1416d5f1904E4286096174B5A', // pQUSD
          '0x1F5D2bD0D05e4c8Fde53c5a6B2A0B2F5d53B0F7a', // wQVTX placeholder
        ],
      },
    ],
  },
  base: {
    pools: [
      {
        contract: '0x0000000000000000000000000000000000000001', // TBD pending TVL reach
        tokens: [
          '0x02DAE538b3Cf726c04990520454Dd7AD42550b3F', // baseQUSD
        ],
      },
    ],
  },
}

async function tvl(api) {
  const chain = api.chain
  if (!QVTX_POOLS[chain]) return {}

  const { pools } = QVTX_POOLS[chain]
  const tokensAndOwners = pools.flatMap(p =>
    p.tokens.map(t => [t, p.contract])
  )
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'Sum of tokens locked in QVTX liquidity pools. QUSD is a fiat-backed USD stablecoin; pQUSD is its Polygon deployment.',
  polygon: { tvl },
  base: { tvl },
}