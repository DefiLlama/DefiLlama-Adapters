import { gql } from "graphql-request";
import { getPagedGql } from "../utils/gql";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/binResults";
import {
  Account,
  getMarkets,
  getUnderlyingPrices,
  totalBorrowValueInUsd,
  totalCollateralValueInUsd,
} from "../utils/compound-helpers";

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/lending";

const accountsQuery = gql`
  query accounts($lastId: ID) {
    accounts(first: 1000, where: { hasBorrowed: true, id_gt: $lastId }) {
      id
      tokens {
        cTokenBalance
        accountBorrowIndex
        storedBorrowBalance
        market {
          name
          symbol

          exchangeRate
          collateralFactor
          borrowIndex

          underlyingAddress
        }
      }
      hasBorrowed
    }
    _meta {
      block {
        number
      }
    }
  }
`;

const EXPLORER_BASE_URL = "https://snowtrace.io/address/";

const positions = async () => {
  const accounts = (await getPagedGql(subgraphUrl, accountsQuery, "accounts")) as Account[];
  const markets = await getMarkets(subgraphUrl);
  const prices = await getUnderlyingPrices(markets, "avax");

  // all positions across all users
  const positions = accounts.flatMap((account) => {
    const _totalBorrowValueInUsd = totalBorrowValueInUsd(account, prices);
    const _totalCollateralValueInUsd = totalCollateralValueInUsd(account, prices);

    const debts = account.tokens
      .filter((token) => !(Number(token.borrowBalanceUnderlying) === 0 && Number(token.supplyBalanceUnderlying) === 0))
      .map((token) => {
        const decimals = token.market.underlyingDecimals;
        const price = Number(token.market.underlyingPriceUSD);
        const collateralFactor = Number(token.market.collateralFactor); // equivalent to liqThreshold in aave
        let debt = new BigNumber(token.borrowBalanceUnderlying);
        if (token.enteredMarket) {
          const factoredSupply = new BigNumber(token.supplyBalanceUnderlying).times(collateralFactor);
          debt = debt.minus(factoredSupply);
        }
        debt = debt.times(price);
        return {
          debt,
          price,
          token: token.market.underlyingAddress,
          totalBal: token.supplyBalanceUnderlying,
          decimals,
        };
      });

    const liquidablePositions = debts
      .filter(({ debt }) => debt.lt(0))
      .map((pos) => {
        const usdPosNetCollateral = pos.debt.negated();
        const otherCollateral = new BigNumber(_totalCollateralValueInUsd).minus(usdPosNetCollateral);
        const diffDebt = new BigNumber(_totalBorrowValueInUsd).minus(otherCollateral);
        if (diffDebt.gt(0)) {
          const amountCollateral = usdPosNetCollateral.div(pos.price);
          const liqPrice = diffDebt.div(amountCollateral);
          return {
            owner: account.id,
            liqPrice: Number(liqPrice.toFixed(6)),
            collateral: "avax:" + pos.token,
            collateralAmount: new BigNumber(pos.totalBal).times(10 ** pos.decimals).toFixed(0),
            extra: {
              url: EXPLORER_BASE_URL + account.id,
            },
          } as Liq;
        } else {
          return {
            owner: "",
            liqPrice: 0,
            collateral: "",
            collateralAmount: "",
          };
        }
      })
      .filter((t) => !!t.owner);

    return liquidablePositions;
  });

  return positions;
};

module.exports = {
  avalanche: {
    liquidations: positions,
  },
};
