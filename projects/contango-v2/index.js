const { getLogs } = require("../helper/cache/getLogs");
const { blockQuery } = require("../helper/http");

const CONTANGO_PROXY = "0x6Cae28b3D09D8f8Fc74ccD496AC986FC84C0C24E";
const CONTANGO_LENS_PROXY = "0xe03835Dfae2644F37049c1feF13E8ceD6b1Bb72a";

const config = {
  arbitrum: {
    contango: CONTANGO_PROXY,
    contango_lens: CONTANGO_LENS_PROXY,
    fromBlock: 137136154,
    grapUrl: "https://api.thegraph.com/subgraphs/name/contango-xyz/v2-arbitrum",
  },
};

Object.keys(config).forEach((chain) => {
  const { contango, fromBlock, contango_lens, grapUrl } = config[chain];
  module.exports[chain] = {
    tvl: async (_1, _2, _3, { api }) => {
      await Promise.all([
        positionsTvl(api, chain, contango_lens, grapUrl),
        vaultTvl(api, contango, fromBlock),
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

async function vaultTvl(api, contango, fromBlock) {
  const logs = await getLogs({
    api,
    target: contango,
    eventAbi: abis.InstrumentCreated,
    onlyArgs: true,
    fromBlock,
  });
  const vault = await api.call({ abi: "address:vault", target: contango });
  await api.sumTokens({
    owner: vault,
    tokens: logs.flatMap((log) => [log.base, log.quote]),
  });
}

const abis = {
  InstrumentCreated:
    "event InstrumentCreated(bytes16 indexed symbol, address base, address quote)",
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
};
