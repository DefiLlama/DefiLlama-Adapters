import { gql } from "graphql-request";
import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import { getPagedGql } from "../utils/gql";

// we do all prices in ETH until the end

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

const getUnderwaterAccounts = (accounts: Account[]) => {
  const underwaterAccounts = accounts.filter((account) => {
    const { health, totalBorrowValueInEth } = account;
    return Number(health) < 1 && Number(health) > 0 && Number(totalBorrowValueInEth) > 0;
  });
  return underwaterAccounts;
};

const getCTokenData = (token: Token) => {
  const { market } = token;
  const { underlyingAddress, underlyingPrice, underlyingDecimals } = market;

  return {
    underlyingAddress,
    underlyingPrice,
    underlyingDecimals,
  };
};

const getBorrowValueInEth = (token: Token) => {
  const { borrowBalanceUnderlying, market } = token;
  const { underlyingPrice } = market;
  return parseFloat(borrowBalanceUnderlying) * parseFloat(underlyingPrice);
};

const getSupplyValueInEth = (token: Token) => {
  const { supplyBalanceUnderlying, market } = token;
  const { underlyingPrice } = market;
  return parseFloat(supplyBalanceUnderlying) * parseFloat(underlyingPrice);
};

/**
 * Find seizable supply position with conditions:
 * 1. enteredMarket === true
 * 2. supplyValue >= borrowValue * 0.5
 */
const findSupplyPositionToSeize = (tokens: Token[], borrowId: string, borrowValueInEth: number) => {
  for (const token of tokens) {
    const { enteredMarket, id: supplyId } = token;

    // Borrow and supply position can't be the same token
    if (!enteredMarket || borrowId === supplyId) {
      continue;
    }

    const supplyValueInEth = getSupplyValueInEth(token);
    // Must have enough supply to seize 50% of borrow value
    if (supplyValueInEth >= borrowValueInEth * 0.5) {
      return { token, supplyValueInEth };
    }
  }
  return null;
};

/**
 * Finds a supply position to seize given a borrow position to repay given
 * the tokens of an underwater account.
 */
const findBorrowAndSupplyPosition = (tokens: Token[]) => {
  for (const token of tokens) {
    const { id: borrowId } = token;
    const borrowValueInEth = getBorrowValueInEth(token);
    if (borrowValueInEth > 0) {
      const supplyPositionToSeize = findSupplyPositionToSeize(tokens, borrowId, borrowValueInEth);
      if (supplyPositionToSeize !== null) {
        return { borrowPositionToRepay: { token, borrowValueInEth }, supplyPositionToSeize };
      }
    }
  }
  return null;
};

const getLiquidatablePosition = (account: Account) => {
  const { tokens } = account;

  const borrowAndSupplyPosition = findBorrowAndSupplyPosition(tokens);
  if (!borrowAndSupplyPosition) {
    return null;
  }

  const { supplyPositionToSeize } = borrowAndSupplyPosition;

  const {
    underlyingAddress: collateralAddress,
    underlyingPrice: liqPriceInEth,
    underlyingDecimals,
  } = getCTokenData(supplyPositionToSeize.token);
  const { id: owner } = account;

  return {
    owner,
    // supplyBalanceUnderlying is also calculated from cToken balance while indexing, so there's fractional
    collateralAmount: (
      Number(supplyPositionToSeize.token.supplyBalanceUnderlying) *
      10 ** underlyingDecimals
    ).toFixed(),
    collateral: "ethereum:" + collateralAddress,
    liqPriceInEth,
  };
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

const liqs = async () => {
  const accounts = (await getPagedGql(subgraphUrl, accountsQuery, "accounts")) as Account[];
  const ethPriceInUsd = Number(await uniswapAnchoredView.price("ETH")) / 1e6;

  // all the liquidable positions across all users
  const underwaterAccounts = getUnderwaterAccounts(accounts);
  const liquidablePositions = underwaterAccounts
    .map((account) => getLiquidatablePosition(account))
    .filter((position) => !!position)
    .map((position) => ({
      owner: position?.owner,
      liqPrice: Number(position?.liqPriceInEth) * ethPriceInUsd,
      collateral: position?.collateral,
      collateralAmount: position?.collateralAmount,
    }));
  return liquidablePositions;
};

module.exports = {
  ethereum: {
    liquidations: liqs,
  },
};
