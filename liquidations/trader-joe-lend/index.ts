import * as sdk from "@defillama/sdk";
import { gql } from "graphql-request";
import { getPagedGql } from "../utils/gql";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/types";

const subgraphUrl = sdk.graph.modifyEndpoint('JB5EdQqbddMjawMLYe3C5ifmhN9WKYvLdgAKoUy1CyYy');

const accountsQuery = gql`
  query accounts($lastId: ID, $pageSize: Int) {
    accounts(first: $pageSize, where: { hasBorrowed: true, id_gt: $lastId }) {
      id
      health
      totalBorrowValueInUSD
      totalCollateralValueInUSD
      tokens {
        id
        symbol
        market {
          name
          symbol
          collateralFactor
          underlyingPriceUSD
          exchangeRate
          reserveFactor
          underlyingDecimals
          underlyingAddress
        }
        borrowBalanceUnderlying
        supplyBalanceUnderlying
        enteredMarket
      }
    }
    _meta {
      block {
        number
      }
    }
  }
`;

type Account = {
  id: string;
  health: string;
  totalBorrowValueInUSD: string;
  totalCollateralValueInUSD: string;
  tokens: Token[];
};

type Token = {
  id: string;
  symbol: string;
  market: Market;
  borrowBalanceUnderlying: string;
  supplyBalanceUnderlying: string;
  enteredMarket: boolean;
};

type Market = {
  name: string;
  symbol: string;
  collateralFactor: string;
  underlyingPriceUSD: string;
  exchangeRate: string;
  reserveFactor: string;
  underlyingDecimals: number;
  underlyingAddress: string;
};

const EXPLORER_BASE_URL = "https://snowtrace.io/address/";

const positions = async () => {
  const accounts = (await getPagedGql(subgraphUrl, accountsQuery, "accounts")) as Account[];

  // all positions across all users
  const positions = accounts.flatMap((account) => {
    const { totalBorrowValueInUSD, totalCollateralValueInUSD } = account;

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
        const otherCollateral = new BigNumber(totalCollateralValueInUSD).minus(usdPosNetCollateral);
        const diffDebt = new BigNumber(totalBorrowValueInUSD).minus(otherCollateral);
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
