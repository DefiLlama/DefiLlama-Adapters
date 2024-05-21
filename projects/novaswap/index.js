const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");
const graphs = {
  zklink: "https://graph.zklink.io/subgraphs/name/novaswap",
};
function v3TvlPaged(chain) {
  return async (api) => {
    let graphQueryPaged = `
      query poolQuery($lastId: String) {
        pools( first:1000 where: {id_gt: $lastId } subgraphError: allow) {
          id
          token0 { id }
          token1 { id }
        }
      }
    `;

    const pools = await cachedGraphQuery(
      "novaswap/" + api.chain,
      graphs[chain],
      graphQueryPaged,
      { variables: {}, fetchById: true }
    );
    const tokensAndOwners = pools
      .map((i) => [
        [i.token0.id, i.id],
        [i.token1.id, i.id],
      ])
      .flat();
    return sumTokens2({
      api,
      tokensAndOwners,
      permitFailure: true,
    });
  };
}

const chains = ["zklink"];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: v3TvlPaged(chain),
  };
});
