import { gql } from "graphql-request";
import { ethers } from "ethers";
import { providers } from "../utils/ethers";
import { getPagedGql } from "../utils/gql";
import BigNumber from "bignumber.js";

const subgraphUrl =
  "https://api.thegraph.com/subgraphs/name/euler-xyz/euler-mainnet";

// Contains information about all Euler markets
const assetsQuery = gql`
  query assets($lastId: ID) {
    assets(first: 1000, where: { id_gt: $lastId }) {
      id
      symbol
      currPriceUsd
      # config can be null -> "isolated"
      config {
        id
        borrowFactor
        borrowIsolated
        collateralFactor
        tier # "collateral" | "isolated" | "cross"
      }
    }
  }
`;

// A Balance represents the current amount of each assets held by an account
const balancesQuery = gql`
  query balances($lastId: ID) {
    balances(first: 1000, where: { hasBorrowed: true, id_gt: $lastId }) {
      # account_address:asset_address
      id
      account {
        id
        topLevelAccount {
          id # if account != topLevelAccount then it's a sub-account, needs to be remapped for "owner" in the end
        }
      }
      amount
      asset {
        id
        symbol
        currPriceUsd
        config {
          id
          borrowFactor
          borrowIsolated
          collateralFactor
          tier # "collateral" | "isolated" | "cross"
        }
      }
    }
  }
`;

// [samples]
// 0x0006b0a9bf479bc741265073e34fcf646ff0bc90 has 2 balances
// USDC and ENS

type Asset = {
  id: string;
  symbol: string;
  currPriceUsd: string;
  config: AssetConfig | null;
};

type AssetConfig = {
  id: string;
  borrowFactor: string;
  borrowIsolated: boolean;
  collateralFactor: string;
  tier: "collateral" | "isolated" | "cross";
};

type Balance = {
  id: string;
  account: {
    id: string;
    topLevelAccount: {
      id: string;
    };
  };
  amount: string;
  asset: Asset;
};

const positions = async () => {
  const balances = (await getPagedGql(
    subgraphUrl,
    balancesQuery,
    "balances"
  )) as Balance[];

  const positions = balances.map((balance) => {
    const { account, amount, asset } = balance;
    const owner = account.topLevelAccount.id;
    const { symbol, currPriceUsd, config } = asset;
    const tier = config?.tier ?? "isolated";

    // liquidation in euler works like this:
    // suppose a user has $1000 of USDC (collateral factor cf=0.9), and wants to borrow UNI (borrow factor of bf=0.7)
    // then they can borrow up to $1000 * 0.9 * 0.7 = $630
    // liquidation price is calculated so:
    // collateralAmount * liqPrice * cf * bf = borrowedAmount * borrowedCoinPrice = borrowedValue
    // liqPrice = borrowedValue / (collateralAmount * cf * bf)
  });

  return () => [];
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
