const client = require("./client");
const BigNumber = require("bignumber.js");
const { gql } = require("graphql-request");

const INITIAL_EXCHANGE_RATE = "1000000000000000000";
const WAD = BigNumber(1e18).toString();

const getLiquidStakingAddress = async () => {
   const TVLLiquidStakingQuery = gql`
    query QueryLiquidStaking {
      queryLiquidStaking {
        id
      }
    }
  `;
   const liquidStakingData = await client('hatom-TVLLiquidStakingQuery', TVLLiquidStakingQuery);
   const { id = "" } = liquidStakingData?.queryLiquidStaking?.[0] || {};
   return id
};

const calcLiquidStakingExchangeRate = (cashReserve, totalShares) => {
   if (totalShares === "0") {
      return INITIAL_EXCHANGE_RATE;
   }
   return BigNumber(cashReserve)
      .multipliedBy(WAD)
      .dividedBy(totalShares)
      .toFixed(0, BigNumber.ROUND_DOWN);
};

const getMoneyMarkets = async () => {
   const TVLLendingProtocolQuery = gql`
    query QueryMoneyMarket {
      queryMoneyMarket {
        address
        underlying {
          name
          decimals
          id
        }
      }
    }
  `;

   const lendingProtocolData = await client('hatom-TVLLendingProtocolQuery', TVLLendingProtocolQuery);
   return lendingProtocolData?.queryMoneyMarket || [];
};

const formatTokenPrices = ({ queryToken = [], queryLiquidStaking = [] }) => {
   const liquidStakingExchangeRate = calcLiquidStakingExchangeRate(
      queryLiquidStaking?.[0]?.state?.cashReserve,
      queryLiquidStaking?.[0]?.state?.totalShares
   );

   const queryTokenPopulated = queryToken
      .filter(
         ({ dailyPriceHistory, symbol }) =>
            dailyPriceHistory.length > 0 || symbol === "EGLD"
      )
      .map((tokenItem) => {
         const priceEgld =
            tokenItem.dailyPriceHistory?.[0]?.quote?.priceInEgld || "0";

         let dailyPriceInEgld = "0";

         if (tokenItem.symbol == "EGLD") {
            dailyPriceInEgld = "1";
         } else if (tokenItem.symbol == "SEGLD") {
            dailyPriceInEgld = BigNumber(1)
               .multipliedBy(liquidStakingExchangeRate)
               .dividedBy(WAD)
               .toString();
         } else {
            dailyPriceInEgld = priceEgld;
         }

         const dailyPriceInUSD =
            tokenItem.dailyPriceHistory?.[0]?.price?.price || "0";

         return {
            ...tokenItem,
            dailyPriceInEgld,
            dailyPriceInUSD,
         };
      });

   const itemEgldInUSD = queryTokenPopulated.find(
      ({ symbol }) => symbol === "EGLD"
   );
   const itemEgldInUSDC = queryTokenPopulated.find(
      ({ symbol }) => symbol === "USDC"
   );

   const agregatorEGLDInUSD = BigNumber(itemEgldInUSD?.dailyPriceInUSD || "0")
      .dividedBy(1e18)
      .toString();

   const priceHistoryEGLDInUSDC =
      BigNumber(1)
         .dividedBy(itemEgldInUSDC?.dailyPriceInEgld || 0)
         .toString() || "0";

   const usdcPriceInEgld = BigNumber(agregatorEGLDInUSD).isZero()
      ? priceHistoryEGLDInUSDC
      : agregatorEGLDInUSD;

   const egldInUsdc = usdcPriceInEgld !== "0" ? usdcPriceInEgld : "0";

   return queryTokenPopulated.reduce(
      (prev, { id, dailyPriceInEgld, dailyPriceInUSD }) => {
         const priceUSD =
            !BigNumber(egldInUsdc).isEqualTo("0") ||
               !BigNumber(dailyPriceInEgld).isEqualTo("0")
               ? BigNumber(egldInUsdc).multipliedBy(dailyPriceInEgld).toString()
               : "0";

         const value = !BigNumber(dailyPriceInUSD).isZero()
            ? BigNumber(dailyPriceInUSD).dividedBy(1e18).toString()
            : priceUSD;

         return {
            ...prev,
            [id]: value,
         };
      },
      {}
   );
};

const getTokenPrices = async () => {
   const TokenPricesQuery = gql`
    query Common_QueryTokenPrices {
      queryLiquidStaking {
        state {
          cashReserve
          totalShares
        }
      }
      queryToken {
        id
        symbol
        dailyPriceHistory(first: 1, order: { desc: day }) {
          quote {
            priceInEgld
            timestamp
          }
          price {
            price
            timestamp
          }
        }
      }
    }
  `;

   const tokenPrices = await client('hatom-TokenPricesQuery', TokenPricesQuery);
   const formattedTokenPrices = formatTokenPrices(tokenPrices);
   return formattedTokenPrices;
};

module.exports = {
   getLiquidStakingAddress,
   getMoneyMarkets,
   getTokenPrices,
};
