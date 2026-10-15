const { GraphQLClient } = require("graphql-request");
const { getResources } = require("../helper/chain/aptos");

const graphQLClient = new GraphQLClient("https://api.mainnet.aptoslabs.com/v1/graphql");

// every MoveFast launch is a sticky object created under 0xdead, so the creator
// address is what identifies the set of pools without a hardcoded token list
const POOL_OWNER = "0x000000000000000000000000000000000000000000000000000000000000dead";
// Both MoveFast deployments, matched by their full type. A bare "::pool::Pool"
// suffix would also match a Pool published by someone else, and enumeration keys
// on 0xdead, which other protocols use too, so an unrelated reserve could land
// in MoveFast TVL.
const POOL_TYPES = new Set([
  "0xdef6b8f06dd82104a4bd3957eb715290cc615dc5a4acd432efadd64d23975d34::pool::Pool",
  "0x8f79b6d87aca62ff5e3e9a555e69e409a3c76b7eb1283249c6998497ef1ac6d7::pool::Pool",
]);

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
    const pool = list.find((resource) => POOL_TYPES.has(resource.type));
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
