const axios = require('axios')

const CONTANGO_PROXY = "0x6Cae28b3D09D8f8Fc74ccD496AC986FC84C0C24E";
const CONTANGO_LENS_PROXY = "0xe03835Dfae2644F37049c1feF13E8ceD6b1Bb72a";
const alchemyGraphUrl = (chain) => `https://subgraph.satsuma-prod.com/773bd6dfe1c6/egills-team/v2-${chain}/api`

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
    graphUrl: alchemyGraphUrl('arbitrum'),
    excludedIds: excludedIds_arb
  },
  optimism: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('optimism'),
  },
  ethereum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('mainnet'),
  },
  polygon: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('polygon'),
  },
  xdai: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('gnosis'),
  },
  base: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('base'),
  },
  avax: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('avalanche'),
  },
  bsc: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('bsc'),
  },
  linea: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('linea'),
  },
  scroll: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    graphUrl: alchemyGraphUrl('scroll'),
  },
};

const abis = {
  balances: "function balances(bytes32 positionId) view returns (uint256 collateral, uint256 debt)",
};

const graphQueries = {
  position: `
    query MyQuery($lastId: BigInt, $block: Int) {
      positions(
        block: {number: $block}
        where: {and: [{number_gt: $lastId}, {quantity_not: "0"}]}
        first: 10000
      ) {
        id
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
    query MyQuery($block: Int) {
      assets(block: {number: $block}, first: 10000) {
        id
      }
    }`,
};


const getPositionsTvl = async (api, lens, graphUrl, borrowed, block, excludedIds) => {
  const { data } = await axios.post(graphUrl, { query: graphQueries.position, variables: { lastId: "0", block } });
  const parts = data.data.positions
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
  const { data } = await axios.post(graphUrl, { query: graphQueries.asset, variables: { lastId: "0", block } });
  const vault = await api.call({ abi: "address:vault", target: contango });
  await api.sumTokens({ owner: vault, tokens: data.data.assets.map(({ id }) => id) });
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
  hallmarks: [[1729036800, "Affected by the Radiant hack"]],
  doublecounted: true,
  methodology: `Counts the tokens locked in the positions to be used as margin + user's tokens locked in the protocol's vault. Borrowed coins are discounted from the TVL, so only the position margins are counted. The reason behind this is that the protocol only added the user's margin to the underlying money market. Adding the borrowed coins to the TVL can be used as a proxy for the protocol's open interest.`,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})