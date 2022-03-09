const { request, gql } = require("graphql-request");

const ASTRO_GENERATOR = "terra1zgrx9jjqrfye8swykfgmd6hpde60j0nszzupp9";
const MARS_RED_BANK = "terra19dtgj9j5j7kyf3pmejqv8vzfpxtejaypgzkz5u";

const graphUrl = "https://mantle.terra.dev";

async function calculateStrategyTvl(strategy, pair, lpToken) {
  const query = gql`
    query fieldsTvl($poolQuery: String!, $bondQuery: String!, $debtQuery: String!) {
      pool: WasmContractsContractAddressStore(
        ContractAddress: "${pair}",
        QueryMsg: $poolQuery
      ) {
        Result
      },
      bond: WasmContractsContractAddressStore(
        ContractAddress: "${ASTRO_GENERATOR}",
        QueryMsg: $bondQuery
      ) {
        Result
      },
      debt: WasmContractsContractAddressStore(
        ContractAddress: "${MARS_RED_BANK}",
        QueryMsg: $debtQuery
      ) {
        Result
      }
    }
  `;

  const responses = await request(graphUrl, query, {
    poolQuery: JSON.stringify({
      pool: {},
    }),
    bondQuery: JSON.stringify({
      deposit: {
        lp_token: lpToken,
        user: strategy,
      },
    }),
    debtQuery: JSON.stringify({
      user_asset_debt: {
        user_address: strategy,
        asset: {
          native: {
            denom: "uusd",
          },
        },
      },
    }),
  });

  const poolResponse = JSON.parse(responses.pool.Result);
  const bondResponse = JSON.parse(responses.bond.Result);
  const debtResponse = JSON.parse(responses.debt.Result);

  const primaryDepth = parseInt(
    poolResponse.assets.find(
      (asset) => JSON.stringify(asset.info) != '{"native_token":{"denom":"uusd"}}',
    ).amount,
  );
  const ustDepth = parseInt(
    poolResponse.assets.find(
      (asset) => JSON.stringify(asset.info) == '{"native_token":{"denom":"uusd"}}',
    ).amount,
  );

  const bondedShares = parseInt(bondResponse);
  const totalShares = parseInt(poolResponse.total_share);

  const primaryBonded = (primaryDepth * bondedShares) / totalShares / 1e6;
  const ustBonded = (ustDepth * bondedShares) / totalShares / 1e6;

  const ustBorrowed = parseInt(debtResponse.amount) / 1e6;

  return { primaryBonded, ustBonded, ustBorrowed };
}

module.exports = { calculateStrategyTvl };
