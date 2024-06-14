import { gql } from "graphql-request";
import { getPagedGql } from "../utils/gql";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/types";
import {
  Account,
  borrowBalanceUnderlying,
  CToken,
  getMarkets,
  getUnderlyingPrices,
  Market,
  supplyBalanceUnderlying,
  totalBorrowValueInUsd,
  totalCollateralValueInUsd,
} from "../utils/compound-helpers";
const sdk = require("@defillama/sdk");

const subgraphUrl = sdk.graph.modifyEndpoint('7h65Zf3pXXPmf8g8yZjjj2bqYiypVxems5d8riLK1DyR');

const accountsQuery = gql`
  query accounts($lastId: ID, $pageSize: Int) {
    accounts(first: $pageSize, where: { hasBorrowed: true, id_gt: $lastId }) {
      id
      tokens {
        id
        vTokenBalance
        accountBorrowIndex
        storedBorrowBalance
        market {
          id
          name
          symbol

          exchangeRate
          collateralFactor
          borrowIndex

          underlyingAddress
        }
        enteredMarket
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

const EXPLORER_BASE_URL = "https://bscscan.com/address/";
const C_TOKEN_DECIMALS = 8;
type MulticallResponse<T> = {
  output: {
    input: any;
    success: boolean;
    output: T;
  }[];
};

const balanceOfs = async (market: Market, accounts: Account[]): Promise<{ [account: string]: string }> => {
  const token = market.id;
  const results = (
    (await sdk.api.abi.multiCall({
      calls: accounts.map((account) => ({
        target: token,
        params: account.id,
      })),
      abi: "erc20:balanceOf",
      chain: "bsc",
      requery: true,
    })) as MulticallResponse<string>
  ).output;

  return results.reduce((acc, result) => {
    if (result.success) {
      acc[result.input.params[0]] = BigNumber(result.output)
        .div(10 ** C_TOKEN_DECIMALS)
        .toString();
    }
    return acc;
  }, {} as { [account: string]: string });
};

const positions = async () => {
  const markets = await getMarkets(subgraphUrl);
  const prices = await getUnderlyingPrices(markets, "bsc:");

  const _accounts = (await getPagedGql(subgraphUrl, accountsQuery, "accounts")) as Account[];

  const cTokenBalances: { [cToken: string]: { [account: string]: string } } = {};
  for (const market of markets) {
    const balances = await balanceOfs(market, _accounts);
    cTokenBalances[market.id] = balances;
  }

  const accounts: Account[] = _accounts.map((account) => {
    const tokens = account.tokens.map((token) => {
      const market = markets.find((market) => market.id === token.market.id)!;

      return {
        ...token,
        market,
        cTokenBalance: cTokenBalances[market.id][account.id],
      };
    });

    return {
      ...account,
      tokens,
    };
  });

  // all positions across all users
  const positions = accounts.flatMap((account) => {
    const _totalBorrowValueInUsd = totalBorrowValueInUsd(account, prices, "bsc:");
    const _totalCollateralValueInUsd = totalCollateralValueInUsd(account, prices, "bsc:");

    const debts = account.tokens
      .filter((token) => {
        const _borrowBalanceUnderlying = borrowBalanceUnderlying(token);
        const _supplyBalanceUnderlying = supplyBalanceUnderlying(token);
        return !(_borrowBalanceUnderlying.eq(0) && _supplyBalanceUnderlying.eq(0));
      })
      .map((token) => {
        const _borrowBalanceUnderlying = borrowBalanceUnderlying(token);
        const _supplyBalanceUnderlying = supplyBalanceUnderlying(token);
        const _price = prices["bsc:" + token.market.underlyingAddress];
        if (!_price) {
          // console.log("no price for", "bsc:" + token.market.underlyingAddress);
          return {
            debt: new BigNumber(0),
            price: 0,
            token: "bsc:" + token.market.underlyingAddress,
            totalBal: _supplyBalanceUnderlying,
            decimals: 0,
          };
        }
        const decimals = _price.decimals;
        const price = _price.price;
        const collateralFactor = Number(token.market.collateralFactor); // equivalent to liqThreshold in aave
        let debt = _borrowBalanceUnderlying;
        if (token.enteredMarket) {
          const factoredSupply = _supplyBalanceUnderlying.times(collateralFactor);
          debt = debt.minus(factoredSupply);
        }
        debt = debt.times(price);
        return {
          debt,
          price,
          token: "bsc:" + token.market.underlyingAddress,
          totalBal: _supplyBalanceUnderlying,
          decimals,
        };
      });

    const liquidablePositions = debts
      .filter(({ debt }) => debt.lt(0))
      .map((pos) => {
        const usdPosNetCollateral = pos.debt.negated();
        const otherCollateral = _totalCollateralValueInUsd.minus(usdPosNetCollateral);
        const diffDebt = _totalBorrowValueInUsd.minus(otherCollateral);
        if (diffDebt.gt(0)) {
          const amountCollateral = usdPosNetCollateral.div(pos.price);
          const liqPrice = diffDebt.div(amountCollateral);
          return {
            owner: account.id,
            liqPrice: Number(liqPrice.toFixed(6)),
            collateral: pos.token,
            collateralAmount: pos.totalBal.times(10 ** pos.decimals).toFixed(0),
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
  bsc: {
    liquidations: positions,
  },
};
