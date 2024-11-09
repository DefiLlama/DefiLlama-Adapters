const { post } = require('../helper/http')

const TREASURY_ADDRESS = "5HZAAREPzwBc4EPWWeTHA2WRcJoCgy4UBk8mwYFWR5BTCNcT";

const TAO_STATS_SUBQUERY = "https://api.subquery.network/sq/TaoStats/bittensor-indexer";

const taoQuery = async () => {
  const query = `{
        query{
            account(id: "${TREASURY_ADDRESS}"){
                id
                nodeId
                balanceTotal
                balanceStaked
                balanceFree
                address
            }
        }
    }`;

  const variables = {};

  return post(TAO_STATS_SUBQUERY, {
    query,
    variables,
  });
};

module.exports = {
  timetravel: false,
  bittensor: {
    tvl: async () => {
      const { data: { query: { account: { balanceTotal } } } } = await taoQuery();
      return {
        bittensor: balanceTotal / 1e9,
      };
    },
  },
}
