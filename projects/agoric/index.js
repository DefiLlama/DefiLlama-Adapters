const sdk = require("@defillama/sdk");
const { postURL } = require('../helper/utils')

const coinGeckoId = 'inter-stable-token';

const queryData = async (query) => {
  const url = 'https://api.subquery.network/sq/agoric-labs/agoric-mainnet-v2';
  try {
    const response = await postURL(url, { query });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching data from Subquery:', error);
    throw error;
  }
}

const tvl = async () => {
  const query = `
    query {
      vaultManagerMetrics {
        nodes {
          liquidatingCollateralBrand
          totalCollateral
        }
      }
      oraclePrices {
        nodes {
          typeInAmount
          typeOutAmount
          typeInName
        }
      }
      boardAuxes {
        nodes {
          allegedName
          decimalPlaces
        }
      }
    }
  `;
  const data = await queryData(query);
  let totalTVL = BigInt(0);

  const collaterals = data.vaultManagerMetrics.nodes.reduce((acc, curr) => {
    acc[curr.liquidatingCollateralBrand] = BigInt(curr.totalCollateral);
    return acc;
  }, {});

  const oraclePrices = data.oraclePrices.nodes.reduce((acc, curr) => {
    const typeOutAmount = BigInt(curr.typeOutAmount ?? '1');
    const typeInAmount = BigInt(curr.typeInAmount ?? '1');
    acc[curr.typeInName] = { numerator: typeOutAmount, denominator: typeInAmount };
    return acc;
  }, {});

  const decimals = data.boardAuxes.nodes.reduce((acc, curr) => {
    acc[curr.allegedName] = curr.decimalPlaces;
    return acc;
  }, {});

  Object.entries(collaterals).forEach(([brand, collateralValue]) => {
    const oraclePrice = oraclePrices[brand];
    const decimalValues = BigInt(10) ** BigInt(decimals[brand] ?? 6);
    const priceNumerator = oraclePrice.numerator * collateralValue;
    const priceDenominator = oraclePrice.denominator * decimalValues;
    totalTVL += priceNumerator / priceDenominator;
  });

  const balances = {};
  sdk.util.sumSingleBalance(balances, coinGeckoId, totalTVL);
  return balances;
}

module.exports = {
  agoric: {
    tvl,
  },
}
