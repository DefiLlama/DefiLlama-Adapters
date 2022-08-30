import { gql } from "graphql-request";
import { ethers } from "ethers";
import { providers, queryEvents } from "../utils/ethers";
import { getPagedGql } from "../utils/gql";
import BigNumber from "bignumber.js";
import fs from "fs";

// ALGORITHM:
// 1. get all accounts-ctoken pairs currently in market
// 2. calculate all positions for each account on chain

// price oracle used in comptroller
const uniswapAnchoredView = new ethers.Contract(
  "0x65c816077C29b557BEE980ae3cC2dCE80204A0C5",
  ["function price(string memory symbol) external view returns (uint256)"],
  providers.ethereum
);

const comptroller = new ethers.Contract(
  "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b",
  ["event MarketEntered(address cToken, address account)", "event MarketExited(address cToken, address account)"],
  providers.ethereum
);

const func = async () => {
  const filterMarketEntered = comptroller.filters.MarketEntered(null, null);
  // const eventsMarketEntered = await comptroller.queryFilter(filterMarketEntered, 7710671);
  const eventsMarketEntered = await queryEvents(comptroller, filterMarketEntered, 7710671);
  const enteredMarket = eventsMarketEntered.map((e) => ({
    blockNumber: e.blockNumber,
    cToken: e.args?.cToken as string,
    account: e.args?.account as string,
  }));
  const accountsEntered = enteredMarket.reduce((acc, { account, cToken }) => {
    if (!acc[account]) {
      acc[account] = [];
    }
    acc[account].push(cToken);
    return acc;
  }, {} as { [account: string]: string[] });

  const filterMarketExited = comptroller.filters.MarketExited(null, null);
  const eventsMarketExited = await queryEvents(comptroller, filterMarketExited, 7710671);
  const exitedMarket = eventsMarketExited.map((e) => ({
    blockNumber: e.blockNumber,
    cToken: e.args?.cToken as string,
    account: e.args?.account as string,
  }));
  const accountsExited = exitedMarket.reduce((acc, { account, cToken }) => {
    if (!acc[account]) {
      acc[account] = [];
    }
    acc[account].push(cToken);
    return acc;
  }, {} as { [account: string]: string[] });

  const accountsStillEntered = Object.keys(accountsEntered).reduce((acc, account) => {
    if (!accountsExited[account]) {
      acc[account] = accountsEntered[account];
    }
    return acc;
  }, {} as { [account: string]: string[] });

  const payload = JSON.stringify(accountsStillEntered, null, 2);
  fs.writeFileSync("./accountsStillEntered.json", payload);

  console.log(Object.entries(accountsStillEntered)[100]);
};

func();

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2";

const accountsQuery = gql`
  query accounts($lastId: ID) {
    accounts(first: 1000, where: { hasBorrowed: true, id_gt: $lastId }) {
      id
      totalBorrowValueInEth
      totalCollateralValueInEth
      tokens {
        id
        symbol
        market {
          name
          symbol
          collateralFactor
          # underlyingPriceUSD
          underlyingPrice
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
  totalBorrowValueInEth: string;
  totalCollateralValueInEth: string;
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
  underlyingPrice: string;
  underlyingDecimals: number;
  underlyingAddress: string;
};

const positions = async () => {
  const accounts = (await getPagedGql(subgraphUrl, accountsQuery, "accounts")) as Account[];

  const ethPriceInUsd = Number(await uniswapAnchoredView.price("ETH")) / 1e6;

  // all positions across all users
  const positions = accounts.flatMap((account) => {
    const { totalBorrowValueInEth, totalCollateralValueInEth } = account;

    const debts = account.tokens
      .filter((token) => !(Number(token.borrowBalanceUnderlying) === 0 && Number(token.supplyBalanceUnderlying) === 0))
      .map((token) => {
        const decimals = token.market.underlyingDecimals;
        const price = Number(token.market.underlyingPrice) * ethPriceInUsd;
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
        const otherCollateral = new BigNumber(totalCollateralValueInEth)
          .times(ethPriceInUsd)
          .minus(usdPosNetCollateral);
        const diffDebt = new BigNumber(totalBorrowValueInEth).times(ethPriceInUsd).minus(otherCollateral);
        if (diffDebt.gt(0)) {
          const amountCollateral = usdPosNetCollateral.div(pos.price);
          const liqPrice = diffDebt.div(amountCollateral);
          return {
            owner: account.id,
            liqPrice: Number(liqPrice.toFixed(6)),
            collateral: "ethereum:" + pos.token,
            collateralAmount: new BigNumber(pos.totalBal).times(10 ** pos.decimals).toFixed(0),
          };
        }
      })
      .filter((t) => t !== undefined);

    return liquidablePositions;
  });

  return positions;
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
