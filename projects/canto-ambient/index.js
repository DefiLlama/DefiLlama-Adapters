const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");

const vault = "0x9290c893ce949fe13ef3355660d07de0fb793618";

async function tvl(_, _b, _cb, { api }) {
  const { pools } = await cachedGraphQuery(
    `canto-ambient/${api.chain}`,
    `https://canto-subgraph.plexnode.wtf/subgraphs/name/ambient-graph`,
    "{  pools {    base    quote  }}"
  );
  const tokens = pools.map((i) => [i.base, i.quote]).flat();

  return sumTokens2({ api, owner: vault, tokens });
}

module.exports = {
  misrepresentedTokens: true,
  canto: { tvl },
};
