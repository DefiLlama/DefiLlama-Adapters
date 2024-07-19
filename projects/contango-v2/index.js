const sdk = require("@defillama/sdk");
const { blockQuery } = require("../helper/http");
const { cachedGraphQuery } = require("../helper/cache");

const CONTANGO_PROXY = "0x6Cae28b3D09D8f8Fc74ccD496AC986FC84C0C24E";
const CONTANGO_LENS_PROXY = "0xe03835Dfae2644F37049c1feF13E8ceD6b1Bb72a";

const config = {
  arbitrum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: sdk.graph.modifyEndpoint('BmHqxUxxLuMoDYgbbXU6YR8VHUTGPBf9ghD7XH6RYyTQ'),
  },
  optimism: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: sdk.graph.modifyEndpoint('PT2TcgYqhQmx713U3KVkdbdh7dJevgoDvmMwhDR29d5'),
  },
  ethereum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: sdk.graph.modifyEndpoint('FSn2gMoBKcDXEHPvshaXLPC1EJN7YsfCP78swEkXcntY'),
  },
  polygon: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: sdk.graph.modifyEndpoint('5t3rhrAYt79iyjm929hgwyiaPLk9uGxQRMiKEasGgeSP'),
  },
  xdai: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl: sdk.graph.modifyEndpoint('9h1rHUKJK9CGqztdaBptbj4Q9e2zL9jABuu9LpRQ1XkC'),
  },
  base: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    grapUrl:
      "https://graph.contango.xyz:18000/subgraphs/name/contango-xyz/v2-base",
  },
};

module.exports = {
  doublecounted: true,
  methodology: `Counts the tokens locked in the positions to be used as margin + user's tokens locked in the protocol's vault. Borrowed coins are discounted from the TVL, so only the position margins are counted. The reason behind this is that the protocol only added the user's margin to the underlying money market. Adding the borrowed coins to the TVL can be used as a proxy for the protocol's open interest.`,
};

Object.keys(config).forEach((chain) => {
  const { contango, contango_lens, grapUrl } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      await Promise.all([
        positionsTvl(api, contango_lens, grapUrl, false),
        vaultTvl(api, contango, grapUrl),
      ]);
      return api.getBalances();
    },
    borrowed: async (api) =>
      positionsTvl(api, contango_lens, grapUrl, true),
  };
});

async function positionsTvl(
  api,
  contangoLens,
  grapUrl,
  borrowed,
) {
  const cacheKey = `contango-positions-${api.chain}`;
  const positions = await cachedGraphQuery(cacheKey, grapUrl, graphQueries.position, {
    api,
    useBlock: true,
    fetchById: true,
    safeBlockLimit: 3000,
  })
  const parts = positions.map(({ id, instrument: { base, quote } }) => [
    id,
    [base.id, quote.id],
  ]);

  const balances = await api.multiCall({
    target: contangoLens,
    calls: parts.map(([id]) => id),
    abi: abis.balances,
  });

  balances.forEach(([collateral, debt], i) => {
    const [base, quote] = parts[i][1];
    if (borrowed) {
      api.add(quote, debt);
    } else {
      api.add(quote, -debt);
      api.add(base, collateral);
    }
  });
}

async function vaultTvl(api, contango, grapUrl) {
  const cacheKey = `contango-vaultAssets-${api.chain}`;
  const assets = await cachedGraphQuery(cacheKey, grapUrl, graphQueries.asset, {
    api,
    useBlock: true,
    fetchById: true,
    safeBlockLimit: 3000,
  })

  const vault = await api.call({ abi: "address:vault", target: contango });

  await api.sumTokens({ owner: vault, tokens: assets.map(({ id }) => id) });
}

const abis = {
  balances:
    "function balances(bytes32 positionId) view returns (uint256 collateral, uint256 debt)",
};

const graphQueries = {
  position: `
query MyQuery($lastId: ID, $block: Int) {
  positions(
    block: {number: $block}
    where: {and: [{id_gt: $lastId}, {quantity_not: "0"}]}
    first: 1000
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
query MyQuery($lastId: ID, $block: Int) {
  assets(block: {number: $block}, where: {id_gt: $lastId} first: 1000) {
    id
  }
}`,
};
