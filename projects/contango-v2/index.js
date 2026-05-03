const { request } = require('../helper/utils/graphql')

const CONTANGO_PROXY = "0x6Cae28b3D09D8f8Fc74ccD496AC986FC84C0C24E";
const CONTANGO_LENS_PROXY = "0xe03835Dfae2644F37049c1feF13E8ceD6b1Bb72a";
const goldskyGraphUrl = (chain) => `https://api.goldsky.com/api/public/project_cmgz86r3700015ep2fvxn0ipr/subgraphs/v2-${chain}/v0.0.24/gn`
const PAGE_SIZE = 1000

const excludedIds_arb = [
  "0x415242555344540000000000000000000bffffffff0000000000000000000623",
  "0x555344435745544800000000000000000bffffffff000000000000000000030a",
  "0x574554485553444300000000000000000bffffffff00000000000000000001df",
  "0x574554485553444300000000000000000bffffffff00000000000000000001e8",
  "0x574554485553444300000000000000000bffffffff0000000000000000000309",
  "0x776545544857455448000000000000000bffffffff0000000000000000003099",
  "0x777374455448574554480000000000000bffffffff00000000000000000010a7"
];

const config = {
  arbitrum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('arbitrum'),
    excludedIds: excludedIds_arb
  },
  optimism: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('optimism'),
  },
  ethereum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('mainnet'),
  },
  polygon: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('polygon'),
  },
  xdai: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('gnosis'),
  },
  base: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('base'),
  },
  avax: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('avalanche'),
  },
  bsc: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('bsc'),
  },
  linea: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('linea'),
  },
  scroll: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: goldskyGraphUrl('scroll'),
  },
};

const abis = {
  balances: "function balances(bytes32 positionId) view returns (uint256 collateral, uint256 debt)",
};

const graphQueries = {
  position: `
    query MyQuery($lastNumber: BigInt, $block: Int) {
      positions(
        block: {number: $block}
        where: {and: [{number_gt: $lastNumber}, {quantity_not: "0"}]}
        first: ${PAGE_SIZE}
        orderBy: number
        orderDirection: asc
      ) {
        id
        number
        instrument {
          base {
            id
          }
          quote {
            id
          }
        }
      }
    }`,
  asset: `
    query MyQuery($lastId: String, $block: Int) {
      assets(
        block: {number: $block}
        where: {id_gt: $lastId}
        first: ${PAGE_SIZE}
        orderBy: id
        orderDirection: asc
      ) {
        id
      }
    }`,
};

async function queryGraphPage(graphUrl, query, variables, key) {
  const data = await request(graphUrl, query, { variables });

  if (!Array.isArray(data?.[key])) throw new Error(`Missing Contango subgraph ${key} response`)

  return data[key]
}

async function queryPositions(graphUrl, block) {
  let positions = []
  let lastNumber = "0"

  while (true) {
    const page = await queryGraphPage(graphUrl, graphQueries.position, { lastNumber, block }, 'positions')
    positions = positions.concat(page)
    if (page.length < PAGE_SIZE) break
    lastNumber = page[page.length - 1].number
  }

  return positions
}

async function queryAssets(graphUrl, block) {
  let assets = []
  let lastId = ""

  while (true) {
    const page = await queryGraphPage(graphUrl, graphQueries.asset, { lastId, block }, 'assets')
    assets = assets.concat(page)
    if (page.length < PAGE_SIZE) break
    lastId = page[page.length - 1].id
  }

  return assets
}

const getPositionsTvl = async (api, lens, graphUrl, borrowed, block, excludedIds) => {
  const positions = await queryPositions(graphUrl, block)
  const parts = positions
    .filter(({ id }) => !excludedIds.includes(id))
    .map(({ id, instrument: { base, quote } }) => [id, [base.id, quote.id]]);

  const calls = parts.map(([id]) => ({ target: lens, params: [id] }))
  const balances = await api.multiCall({ calls, abi: abis.balances })

  balances.forEach(([collateral, debt], i) => {
    const [base, quote] = parts[i][1]
    if (borrowed) api.add(quote, debt)
    else {
      api.add(quote, -debt);
      api.add(base, collateral);
    }
  })
}

const getVaultTvl = async (api, contango, graphUrl, block) => {
  const assets = await queryAssets(graphUrl, block)
  const vault = await api.call({ abi: "address:vault", target: contango });
  await api.sumTokens({ owner: vault, tokens: assets.map(({ id }) => id) });
}

const tvl = async (api) => {
  const { contango, contango_lens, graphUrl, excludedIds = [] } = config[api.chain]
  const block = await api.getBlock() - 3_000
  await getPositionsTvl(api, contango_lens, graphUrl, false, block, excludedIds)
  await getVaultTvl(api, contango, graphUrl, block)
}

const borrowed = async (api) => {
  const { contango_lens, graphUrl, excludedIds = [] } = config[api.chain]
  const block = await api.getBlock() - 3_000
  await getPositionsTvl(api, contango_lens, graphUrl, true, block, excludedIds)
}

module.exports = {
  hallmarks: [['2024-10-16', "Affected by the Radiant hack"]],
  doublecounted: true,
  methodology: `Counts the tokens locked in the positions to be used as margin + user's tokens locked in the protocol's vault. Borrowed coins are discounted from the TVL, so only the position margins are counted. The reason behind this is that the protocol only added the user's margin to the underlying money market. Adding the borrowed coins to the TVL can be used as a proxy for the protocol's open interest.`,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})
