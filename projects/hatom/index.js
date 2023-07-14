const BigNumber = require("bignumber.js");
const graphql = require("../helper/utils/graphql");
const ADDRESSES = require("../helper/coreAssets.json");

const INITIAL_EXCHANGE_RATE = "1000000000000000000";
const WAD = BigNumber(1e18).toString();

const API_URL = "https://mainnet-api.hatom.com/graphql";

const TokenPricesQuery = `
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

const TVLLiquidStakingQuery = `query QueryLiquidStaking {
	queryLiquidStaking {
		state {
      cashReserve
  	   }
	}
}`;

const TVLLendingProtocolQuery = `query QueryMoneyMarket {
	queryMoneyMarket {
		address
		underlying {
			name
         decimals
			id
		}
		 stateHistory(first: 1, order: {desc: timestamp}) {
			cash
			borrows
		}
	}
}
`;

const calcLiquidStakingExchangeRate = (cashReserve, totalShares) => {
  if (totalShares === "0") {
    return INITIAL_EXCHANGE_RATE;
  }
  return BigNumber(cashReserve)
    .multipliedBy(WAD)
    .dividedBy(totalShares)
    .toFixed(0, BigNumber.ROUND_DOWN);
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
      const filteredToken = tokenItem.dailyPriceHistory;
      const priceEgld = filteredToken?.[0]?.quote.priceInEgld || "0";
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
      const dailyPriceInUSD = filteredToken?.[0]?.price?.price || "0";
      return {
        ...tokenItem,
        dailyPriceInEgld,
        dailyPriceInUSD,
      };
    });
  const usdcPriceInEgld =
    queryTokenPopulated.find(({ symbol }) => symbol === "USDC")
      ?.dailyPriceInEgld || "0";
  const egldInUsdc =
    usdcPriceInEgld !== "0"
      ? BigNumber(1).dividedBy(usdcPriceInEgld).toString()
      : "0";
  return queryTokenPopulated.reduce(
    (prev, { id, dailyPriceInEgld, dailyPriceInUSD }) => {
      const priceUSD =
        !BigNumber(egldInUsdc).isEqualTo("0") ||
        !BigNumber(dailyPriceInEgld).isEqualTo("0")
          ? BigNumber(egldInUsdc).multipliedBy(dailyPriceInEgld).toString()
          : "0";
      const value = !BigNumber(dailyPriceInUSD).isZero()
        ? new BigNumber(dailyPriceInUSD).dividedBy(1e18).toString()
        : priceUSD;
      return {
        ...prev,
        [id]: value,
      };
    },
    {}
  );
};

async function tvl() {
  // Getting token prices
  const tokenPrices = await graphql.request(API_URL, TokenPricesQuery);
  const formattedTokenPrices = formatTokenPrices(tokenPrices);
  const egldUsdcPrice = BigNumber(formattedTokenPrices.EGLD || 0);

  // Fetching TVL data from api
  const liquidStakingData = await graphql.request(
    API_URL,
    TVLLiquidStakingQuery
  );
  const lendingProtocolData = await graphql.request(
    API_URL,
    TVLLendingProtocolQuery
  );

  //Total reserve of liquid staking protocol
  const liquidStakingElrndReserveInEgld =
    liquidStakingData.queryLiquidStaking[0].state.cashReserve;
  const liquidStakingElrndReserveInUSD = BigNumber(
    liquidStakingElrndReserveInEgld
  )
    .dividedBy(1e18)
    .multipliedBy(egldUsdcPrice);

  //Total reserve of lending protocol
  const lendingProtocolCashReserveInUsd =
    lendingProtocolData.queryMoneyMarket.reduce((acc, item) => {
      const { cash, borrows } = item.stateHistory[0];
      const { id, decimals } = item.underlying;
      const cashBigNumber = BigNumber(cash).dividedBy(`1e${decimals}`);
      const borrowsBigNumber = BigNumber(borrows).dividedBy(`1e${decimals}`);
      const total = cashBigNumber.plus(borrowsBigNumber);

      return acc.plus(total.multipliedBy(formattedTokenPrices[id] || 0));
    }, BigNumber(0));

  const totalLiquidity = liquidStakingElrndReserveInUSD.plus(
    lendingProtocolCashReserveInUsd
  );

  return { [ADDRESSES.ethereum.USDC]: totalLiquidity.multipliedBy(1e6) };
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology:
    "The Total Value Locked (TVL) is computed as the aggregate sum of the EGLD reserve held within the liquid staking protocol, in conjunction with the USD reserve held within the lending protocol. This calculation encompasses not only the liquid balance but also takes into consideration the borrowing activity.",
  elrond: {
    tvl: tvl,
  },
};
