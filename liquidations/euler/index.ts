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
        # borrowFactor and collateralFactor can be transformed in a decimal fraction by dividing by 4e9
        borrowFactor
        borrowIsolated
        collateralFactor
        tier # "collateral" | "isolated" | "cross"
      }
    }
  }
`;

const accountsQuery = gql`
  query accounts($lastId: ID) {
    # subgraph bug - balances_: {amount_not: "0"} filter doesn't work
    accounts(first: 1000, where: { id_gt: $lastId }) {
      id
      # if account_id != topLevelAccount_id then it's a sub-account, needs to be remapped for "owner" in the end
      topLevelAccount {
        id
      }
      balances {
        id
        amount
        asset {
          id
          symbol
          currPriceUsd
          # config can be null -> "isolated"
          config {
            id
            # borrowFactor and collateralFactor can be transformed in a decimal fraction by dividing by 4e9
            borrowFactor
            borrowIsolated
            collateralFactor
            tier # "collateral" | "isolated" | "cross"
          }
        }
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

// [sample]
// 0x7bfee91193d9df2ac0bfe90191d40f23c773c060
// dToken WETH = 512.88 = $724,198; balance = -511645289607802011271
// eToken wstETH = 1,531.38 = $2,668,688; balance = 1531384695311005494914
// eToken LINK = 54,315.69 = $347,954.85; balance = 54315693499704372034252
// eToken STG = 50,000.00 = $20,023.55; balance = 50000000000000000000000

type Account = {
  id: string;
  topLevelAccount: {
    id: string;
  };
  balances: {
    amount: string;
    asset: Asset;
  }[];
};

type Asset = {
  id: string;
  symbol: string;
  currPriceUsd: string;
  config: AssetConfig | null;
};

type Tier = "collateral" | "isolated" | "cross";

type AssetConfig = {
  borrowFactor: string;
  borrowIsolated: boolean;
  collateralFactor: string;
  tier: Tier;
};

type AssetMapped = {
  id: string;
  symbol: string;
  currPriceUsd: BigNumber;
  borrowFactor: BigNumber;
  borrowIsolated: boolean;
  collateralFactor: BigNumber;
  tier: Tier;
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

  const assets = (await getPagedGql(
    subgraphUrl,
    assetsQuery,
    "assets"
  )) as Asset[];

  const assetsMapped: AssetMapped[] = assets.map((asset) => {
    const config = asset.config;
    const id = asset.id;
    const symbol = asset.symbol;
    const currPriceUsd = new BigNumber(asset.currPriceUsd).div(1e18);
    // tiers are treated differently
    // isolated: no collateral, can be borrowed, one borrow per account
    // cross: no collateral, can be borrowed alongside other assets
    // collateral: cross + can be used as collateral
    const tier = config?.tier ?? "isolated";
    const borrowIsolated = config?.borrowIsolated ?? true;

    // isolation by default borrowFactor is 0.28
    // reserveFactor is default reserve factor is 0.23
    // isolation collateralFactor is 0 obviously
    const borrowFactorRaw = config?.borrowFactor ?? "1120000000";
    const borrowFactor = new BigNumber(borrowFactorRaw).div(4e9);
    const collateralFactorRaw = config?.collateralFactor ?? "0";
    const collateralFactor = new BigNumber(collateralFactorRaw).div(4e9);
    return {
      id,
      symbol,
      currPriceUsd,
      borrowFactor,
      borrowIsolated,
      collateralFactor,
      tier,
    };
  });

  const positions = balances.map((balance) => {
    const { account, amount, asset } = balance;
    const owner = account.topLevelAccount.id;
    const { id } = asset;
    const {
      symbol,
      currPriceUsd,
      borrowFactor,
      borrowIsolated,
      collateralFactor,
      tier,
    } = assetsMapped.find((assetMapped) => assetMapped.id === id) ?? {};

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
