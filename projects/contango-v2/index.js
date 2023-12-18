const { getLogs } = require("../helper/cache/getLogs");
const { blockQuery } = require("../helper/http");

const CONTANGO_PROXY = "0x6Cae28b3D09D8f8Fc74ccD496AC986FC84C0C24E";
const CONTANGO_LENS_PROXY = "0xe03835Dfae2644F37049c1feF13E8ceD6b1Bb72a";

const config = {
  arbitrum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: "https://api.thegraph.com/subgraphs/name/contango-xyz/v2-arbitrum",
  },
  optimism: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: "https://api.thegraph.com/subgraphs/name/contango-xyz/v2-optimism",
  },
  ethereum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: "https://api.thegraph.com/subgraphs/name/contango-xyz/v2-mainnet",
  },
  polygon: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: "https://api.thegraph.com/subgraphs/name/contango-xyz/v2-polygon",
  },
  xdai: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: "https://api.thegraph.com/subgraphs/name/contango-xyz/v2-gnosis",
  },
  base: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl:
      "https://graph.contango.xyz:18000/subgraphs/name/contango-xyz/v2-base",
  },
};

Object.keys(config).forEach((chain) => {
  const { contango, contango_lens, grapUrl } = config[chain];
  module.exports[chain] = {
    tvl: async (_1, _2, _3, { api }) => {
      await Promise.all([
        positionsTvl(api, chain, contango_lens, grapUrl),
        vaultTvl(api, contango, grapUrl),
      ]);

      return api.getBalances();
    },
  };
});

async function positionsTvl(
  api,
  chain,
  contangoLens,
  grapUrl,
  first = 1000,
  skip = 0
) {
  const { positions } = await blockQuery(
    grapUrl,
    graphQueries.positions(first, skip),
    { api }
  );

  const parts = positions.map(({ id, instrument: { base, quote } }) => [
    id,
    [base.id, quote.id],
  ]);

  const balances = await api.multiCall({
    target: contangoLens,
    calls: parts.map(([id]) => id),
    abi: abis.balances,
    chain,
  });

  balances.forEach(([collateral, debt], i) => {
    api.addTokens(parts[i][1], [collateral, -debt]);
  });

  if (positions.length === first) {
    await positionsTvl(api, chain, contangoLens, grapUrl, first, skip + first);
  }
}

async function vaultTvl(api, contango, grapUrl, first = 1000, skip = 0) {
  const { assets } = await blockQuery(
    grapUrl,
    graphQueries.assets(first, skip),
    { api }
  );
  const vault = await api.call({ abi: "address:vault", target: contango });

  await api.sumTokens({ owner: vault, tokens: assets.map(({ id }) => id) });
}

const abis = {
  balances:
    "function balances(bytes32 positionId) view returns (uint256 collateral, uint256 debt)",
};

const graphQueries = {
  positions: (first = 1000, skip = 0) => `
    query MyQuery {
      positions(
        first: ${first}
        skip: ${skip}
        where: {quantity_not: "0"}
        orderBy: id
        orderDirection: asc
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
  assets: (first = 1000, skip = 0) => `
    query MyQuery {
      assets(first: ${first} skip: ${skip}) {
        id
      }
    }`,
};
