const { request, gql } = require("graphql-request");

const MARS_RED_BANK = "terra19dtgj9j5j7kyf3pmejqv8vzfpxtejaypgzkz5u";
const MALUNA_TOKEN = "terra1x4rrkxx5pyuce32wsdn8ypqnpx8n27klnegv0d";
const MAUST_TOKEN = "terra1cuku0vggplpgfxegdrenp302km26symjk4xxaf";

const graphUrl = "https://mantle.terra.dev";

async function calculateRedBankTvl() {
  const scaledAmountsQuery = gql`
    query scaledAmounts($cw20TokenInfoQuery: String!) {
      maLunaTokenInfo: WasmContractsContractAddressStore(
        ContractAddress: "${MALUNA_TOKEN}",
        QueryMsg: $cw20TokenInfoQuery
      ) {
        Result
      },
      maUstTokenInfo: WasmContractsContractAddressStore(
        ContractAddress: "${MAUST_TOKEN}",
        QueryMsg: $cw20TokenInfoQuery
      ) {
        Result
      },
    }
  `;

  const scaledAmountsResponses = await request(graphUrl, scaledAmountsQuery, {
    cw20TokenInfoQuery: JSON.stringify({
      token_info: {},
    }),
  });

  const lunaLiquidityScaled = JSON.parse(scaledAmountsResponses.maLunaTokenInfo.Result).total_supply;
  const ustLiquidityScaled = JSON.parse(scaledAmountsResponses.maUstTokenInfo.Result).total_supply;

  const underlyingAmountsQuery = gql`
    query underlyingAmounts(
      $lunaUnderlyingLiquidityQuery: String!,
      $ustUnderlyingLiquidityQuery: String!,
    ) {
      lunaLiquidity: WasmContractsContractAddressStore(
        ContractAddress: "${MARS_RED_BANK}",
        QueryMsg: $lunaUnderlyingLiquidityQuery
      ) {
        Result
      },
      ustLiquidity: WasmContractsContractAddressStore(
        ContractAddress: "${MARS_RED_BANK}",
        QueryMsg: $ustUnderlyingLiquidityQuery
      ) {
        Result
      },
    }
  `;

  const underlyingAmountsResponses = await request(graphUrl, underlyingAmountsQuery, {
    lunaUnderlyingLiquidityQuery: JSON.stringify({
      underlying_liquidity_amount: {
        ma_token_address: MALUNA_TOKEN,
        amount_scaled: lunaLiquidityScaled.toString()
      }
    }),
    ustUnderlyingLiquidityQuery: JSON.stringify({
      underlying_liquidity_amount: {
        ma_token_address: MAUST_TOKEN,
        amount_scaled: ustLiquidityScaled.toString()
      }
    }),
  });

  const lunaLiquidity = parseInt(JSON.parse(underlyingAmountsResponses.lunaLiquidity.Result)) / 1e6;
  const ustLiquidity = parseInt(JSON.parse(underlyingAmountsResponses.ustLiquidity.Result)) / 1e6;

  return { 
    "terra-luna": lunaLiquidity,
    "terrausd": ustLiquidity,
  };
}

async function calculateRedBankBorrowed() {
  const scaledAmountsQuery = gql`
    query scaledAmounts($lunaMarketQuery: String!, $ustMarketQuery: String!) {
      lunaMarket: WasmContractsContractAddressStore(
        ContractAddress: "${MARS_RED_BANK}",
        QueryMsg: $lunaMarketQuery
      ) {
        Result
      },
      ustMarket: WasmContractsContractAddressStore(
        ContractAddress: "${MARS_RED_BANK}",
        QueryMsg: $ustMarketQuery
      ) {
        Result
      },
    }
  `;

  const scaledAmountsResponses = await request(graphUrl, scaledAmountsQuery, {
    lunaMarketQuery: JSON.stringify({
      market: {
        asset: {
          native: {
            denom: "uluna"
          }
        }
      }
    }),
    ustMarketQuery: JSON.stringify({
      market: {
        asset: {
          native: {
            denom: "uusd"
          }
        }
      }
    })
  });

  const lunaDebtScaled = JSON.parse(scaledAmountsResponses.lunaMarket.Result).debt_total_scaled;
  const ustDebtScaled = JSON.parse(scaledAmountsResponses.ustMarket.Result).debt_total_scaled;

  const underlyingAmountsQuery = gql`
    query underlyingAmounts(
      $lunaUnderlyingDebtQuery: String!,
      $ustUnderlyingDebtQuery: String!
    ) {
      lunaDebt: WasmContractsContractAddressStore(
        ContractAddress: "${MARS_RED_BANK}",
        QueryMsg: $lunaUnderlyingDebtQuery
      ) {
        Result
      },
      ustDebt: WasmContractsContractAddressStore(
        ContractAddress: "${MARS_RED_BANK}",
        QueryMsg: $ustUnderlyingDebtQuery
      ) {
        Result
      }
    }
  `;

  const underlyingAmountsResponses = await request(graphUrl, underlyingAmountsQuery, {
    lunaUnderlyingDebtQuery: JSON.stringify({
      underlying_debt_amount: {
        asset: {
          native: {
            denom: "uusd"
          }
        },
        amount_scaled: lunaDebtScaled
      }
    }),
    ustUnderlyingDebtQuery: JSON.stringify({
      underlying_debt_amount: {
        asset: {
          native: {
            denom: "uusd"
          }
        },
        amount_scaled: ustDebtScaled
      }
    })
  });

  const lunaDebt = parseInt(JSON.parse(underlyingAmountsResponses.lunaDebt.Result)) / 1e6;
  const ustDebt = parseInt(JSON.parse(underlyingAmountsResponses.ustDebt.Result)) / 1e6;

  return {
    "terra-luna": lunaDebt,
    "terrausd": ustDebt,
  }
}

module.exports = { calculateRedBankTvl, calculateRedBankBorrowed };
