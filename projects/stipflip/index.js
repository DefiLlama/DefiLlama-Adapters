const { sumTokensExport } = require("../helper/unwrapLPs");
const { cachedGraphQuery } = require("../helper/cache");

const synthQuery = `{
  synths {
    id
  }
}`;

const poolQuery = `{
  pools {
    id
  }
}`;

const WETC = "0x82A618305706B14e7bcf2592D4B9324A366b6dAd";
const ETC = "0x0000000000000000000000000000000000000000";

const endpoint = "https://ether-graphiql.sf.exchange/subgraphs/name/sotachi/sf";

async function tvl(api) {
  const { pools } = await cachedGraphQuery(
    "stipflip/pools/ethereumclassic",
    endpoint,
    poolQuery,
    {
      api,
    }
  );
  const { synths } = await cachedGraphQuery(
    "stipflip/synths/ethereumclassic",
    endpoint,
    synthQuery,
    {
      api,
    }
  );

  return sumTokensExport({
    owners: [...synths.map((s) => s.id), ...pools.map((p) => p.id)],
    tokens: [WETC, ETC],
  })(api);
}

module.exports = {
  methodology:
    "Fetch all the pools and synths from the subgraph and sum their balance up. Synths balances are in the native ETC token, pool balance is in WETC wrapped token.",
  ethereumclassic: {
    tvl,
  },
};
