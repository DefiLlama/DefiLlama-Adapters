const { GraphQLClient } = require("graphql-request");
const { getResources } = require("../helper/chain/aptos");

const graphQLClient = new GraphQLClient("https://api.mainnet.aptoslabs.com/v1/graphql");

// every MoveFast launch is a sticky object created under 0xdead, so the creator
// address is what identifies the set of pools without a hardcoded token list
const POOL_OWNER = "0x000000000000000000000000000000000000000000000000000000000000dead";
const POOL_SUFFIX = "::pool::Pool";

const TOKENS_QUERY = `query MoveFastTokens($creator: String!, $limit: Int!, $offset: Int!) {
  fungible_asset_metadata(
    where: { creator_address: { _eq: $creator } }
    order_by: { asset_type: asc }
    limit: $limit
    offset: $offset
  ) {
    asset_type
  }
}`;

async function launchedTokens() {
  const limit = 100;
  const tokens = [];
  for (let offset = 0; ; offset += limit) {
    const { fungible_asset_metadata: rows } = await graphQLClient.request(TOKENS_QUERY, {
      creator: POOL_OWNER,
      limit,
      offset,
    });
    tokens.push(...rows.map((row) => row.asset_type));
    if (rows.length < limit) return tokens;
  }
}

const tvl = async (api) => {
  const tokens = await launchedTokens();
  const resources = await Promise.all(tokens.map((token) => getResources(token)));

  resources.forEach((list) => {
    const pool = list.find((resource) => resource.type.endsWith(POOL_SUFFIX));
    // quote_reserve is the quote actually deposited by traders. the curve also
    // carries a virtual_quote term used only for pricing, which is never
    // deposited and can never be withdrawn, so it is left out of TVL.
    if (!pool || pool.data.quote_reserve === undefined) return;
    api.add(pool.data.quote.inner, pool.data.quote_reserve);
  });
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "MoveFast launches each token as a sticky object created under 0xdead that holds a Pool " +
    "resource. TVL is the sum of every pool's quote_reserve, the quote asset (APT, USDC, USDt, " +
    "WBTC) that traders have deposited and that backs sells. The bonding curve also carries a " +
    "virtual_quote term used only for pricing; it is never deposited and cannot be withdrawn, so " +
    "counting it would overstate TVL roughly tenfold. Unsold token inventory held by the pool and " +
    "unclaimed creator fees are excluded as well.",
  aptos: { tvl },
};
