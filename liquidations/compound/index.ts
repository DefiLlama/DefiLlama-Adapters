import { gql } from "graphql-request";
import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import { getPagedGql } from "../utils/gql";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/binResults";

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2";

const accountsQuery = gql`
  query accounts($lastId: ID) {
    accounts(first: 1000, where: { hasBorrowed: true, id_gt: $lastId }) {
      id
      health
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
  exchangeRate: string;
  reserveFactor: string;
  underlyingDecimals: number;
  underlyingAddress: string;
};

// price oracle used in comptroller
const uniswapAnchoredView = new ethers.Contract(
  "0x65c816077C29b557BEE980ae3cC2dCE80204A0C5",
  [
    {
      inputs: [{ internalType: "string", name: "symbol", type: "string" }],
      name: "price",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ],
  providers.ethereum
);

const EXPLORER_BASE_URL = "https://etherscan.io/address/";

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
  ethereum: {
    liquidations: positions,
  },
};
