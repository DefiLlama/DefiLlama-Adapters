import axios from "axios";
import BigNumber from "bignumber.js";
import { gql } from "graphql-request";
import { getPagedGql } from "./gql";
import { Prices } from "./types";

export const bignum = (value: string | number) => new BigNumber(value);

export type CToken = {
  cTokenBalance: string;
  accountBorrowIndex: string;
  storedBorrowBalance: string;
  market: Market;
  enteredMarket: boolean;
};

export type Market = {
  id: string;
  name: string;
  symbol: string;

  exchangeRate: string;
  collateralFactor: string;
  borrowIndex: string;

  // underlyingPrice: string; // not available in some forks
  underlyingAddress: string; // to be used with price api
};

export type Account = {
  id: string;
  tokens: CToken[];
  hasBorrowed: boolean;
};

export const getUnderlyingPrices = async (markets: Market[], chainPrefix: string): Promise<Prices> => {
  const tokens = markets.map((m) => m.underlyingAddress).map((a) => chainPrefix + a.toLowerCase());
  const prices = (await axios.get("https://coins.llama.fi/prices/current/" + tokens.join(","))).data.coins as Prices;
  return prices;
};

export const getMarkets = async (subgraphUrl: string) => {
  const marketsQuery = gql`
    query markets {
      markets {
        id
        name
        symbol
        exchangeRate
        collateralFactor
        borrowIndex
        underlyingPrice
        underlyingAddress
      }
    }
  `;

  const markets = (await getPagedGql(subgraphUrl, marketsQuery, "markets")) as Market[];
  return markets;
};

export const supplyBalanceUnderlying = (cToken: CToken): BigNumber =>
  bignum(cToken.cTokenBalance).times(cToken.market.exchangeRate);

export const borrowBalanceUnderlying = (cToken: CToken): BigNumber =>
  bignum(cToken.accountBorrowIndex).eq(bignum("0"))
    ? bignum("0")
    : bignum(cToken.storedBorrowBalance).times(cToken.market.borrowIndex).dividedBy(cToken.accountBorrowIndex);

export const tokenInUsd = (market: Market, prices: Prices, chainPrefix: string): BigNumber => {
  // console.log("market", JSON.stringify(market));
  return bignum(market.collateralFactor)
    .times(market.exchangeRate)
    .times(prices[chainPrefix + market.underlyingAddress]?.price ?? 0);
};

export const totalCollateralValueInUsd = (account: Account, prices: Prices, chainPrefix: string): BigNumber =>
  account.tokens.reduce(
    (acc, token) => acc.plus(tokenInUsd(token.market, prices, chainPrefix).times(token.cTokenBalance)),
    bignum("0")
  );

export const totalBorrowValueInUsd = (account: Account, prices: Prices, chainPrefix: string): BigNumber =>
  !account.hasBorrowed
    ? bignum("0")
    : account.tokens.reduce(
        (acc, token) =>
          acc.plus(
            bignum(prices[chainPrefix + token.market.underlyingAddress]?.price ?? 0).times(
              borrowBalanceUnderlying(token)
            )
          ),
        bignum("0")
      );
