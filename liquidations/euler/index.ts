import * as sdk from "@defillama/sdk";
import { gql } from "graphql-request";
import { getPagedGql } from "../utils/gql";
import BigNumber from "bignumber.js";
import { Liq } from "../utils/types";

const subgraphUrl = sdk.graph.modifyEndpoint('EQBXhrF4ppZy9cBYnhPdrMCRaVas6seNpqviih5VRGmU');

const accountsQuery = gql`
  query accounts($lastId: ID, $pageSize: Int) {
    # subgraph bug - balances_: {amount_not: "0"} filter doesn't work
    accounts(first: $pageSize, where: { id_gt: $lastId }) {
      id
      # if account_id != topLevelAccount_id then it's a sub-account, needs to be remapped for "owner" in the end
      topLevelAccount {
        id
      }
      balances {
        amount
        asset {
          id
          symbol
          decimals
          currPriceUsd
          # config can be null -> "isolated"
          config {
            # borrowFactor and collateralFactor can be transformed in a decimal fraction by dividing by 4e9
            borrowFactor
            borrowIsolated
            collateralFactor
            tier # "collateral" | "isolated" | "cross"
          }
        }
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
  topLevelAccount: {
    id: string;
  };
  balances: Balance[];
};

type Balance = {
  amount: string;
  asset: Asset;
};

type Asset = {
  id: string;
  symbol: string;
  decimals: string;
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

type MappedAsset = {
  id: string;
  symbol: string;
  decimals: string;
  currPriceUsd: BigNumber;
  borrowFactor: BigNumber;
  borrowIsolated: boolean;
  collateralFactor: BigNumber;
  tier: Tier;
};

// [sample]
// 0x7bfee91193d9df2ac0bfe90191d40f23c773c060
// debt WETH = 512.88 = $724,198; balance = -511e18; adjustedDebt = 724,198 / 0.91 = 795,821
// supply wstETH = 1,531.38 = $2,668,688; balance = 1531e18; adjustedDebt = -2,668,688 * 0.85 = -2,268,384
// supply LINK = 54,315.69 = $347,954.85; balance = 54315e18; adjustedDebt = -347,954 * 0.66 = -229,649
// supply STG = 50,000.00 = $20,023.55; balance = 50000e18; adjustedDebt = 0

const mapAsset = (asset: Asset): MappedAsset => {
  const config = asset.config;
  const id = asset.id;
  const symbol = asset.symbol;
  const decimals = asset.decimals;
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
    decimals,
    currPriceUsd,
    borrowFactor,
    borrowIsolated,
    collateralFactor,
    tier,
  };
};

const INSPECTOR_BASE_URL = "https://app.euler.finance/dashboard?spy=";

const positions = async () => {
  const _accounts = (await getPagedGql(subgraphUrl, accountsQuery, "accounts")) as Account[];

  const accounts = _accounts.map((x) => {
    const _balances = x.balances.filter((b) => b.amount !== "0");
    return {
      ...x,
      balances: _balances,
    };
  });

  // liquidation in euler works like this:
  // suppose a user has $1000 of USDC (collateral factor cf=0.9), and wants to borrow UNI (borrow factor of bf=0.7)
  // then they can borrow up to $1000 * 0.9 * 0.7 = $630
  // liquidation price is calculated so:
  // collateralAmount * liqPrice * cf * bf = borrowedAmount * borrowedCoinPrice = borrowedValue
  // liqPrice = borrowedValue / (collateralAmount * cf * bf)
  const positions = accounts
    .map((account) => {
      let totalAdjustedDebt = new BigNumber(0);
      let totalAdjustedCollateral = new BigNumber(0);
      const debts = account.balances.map((balance) => {
        const mappedAsset = mapAsset(balance.asset);
        const { id, borrowFactor, decimals, borrowIsolated, collateralFactor, currPriceUsd, symbol, tier } =
          mappedAsset;
        // everything is in WAD on euler
        const amount = new BigNumber(balance.amount).div(1e18);
        let adjustedDebt: BigNumber;
        if (amount.lt(0)) {
          adjustedDebt = amount.div(borrowFactor).times(currPriceUsd).negated();
        } else {
          adjustedDebt =
            tier === "collateral" ? amount.times(collateralFactor).times(currPriceUsd).negated() : new BigNumber(0);
        }

        if (adjustedDebt.gt(0)) {
          totalAdjustedDebt = totalAdjustedDebt.plus(adjustedDebt);
        } else {
          totalAdjustedCollateral = totalAdjustedCollateral.minus(adjustedDebt);
        }

        return {
          adjustedDebt,
          currPriceUsd,
          symbol,
          decimals,
          borrowFactor,
          collateralFactor,
          token: id,
          amount,
        };
      });

      const liquidablePositions = debts
        .filter(({ adjustedDebt }) => adjustedDebt.lt(0))
        .map((pos) => {
          const usdPosNetAdjustedCollateral = pos.adjustedDebt.negated();
          const otherAdjustedCollateral = totalAdjustedCollateral.minus(usdPosNetAdjustedCollateral);
          const diffAdjustedDebt = totalAdjustedDebt.minus(otherAdjustedCollateral);

          if (diffAdjustedDebt.gt(0)) {
            const amountAdjustedCollateral = usdPosNetAdjustedCollateral.div(pos.currPriceUsd);
            const liquidationPrice = diffAdjustedDebt.div(amountAdjustedCollateral);
            return {
              owner: account.topLevelAccount.id,
              liqPrice: liquidationPrice.toNumber(),
              collateral: "ethereum:" + pos.token,
              collateralAmount: pos.amount.times(10 ** Number(pos.decimals)).toFixed(0),
              extra: {
                url: INSPECTOR_BASE_URL + account.topLevelAccount.id,
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
    })
    .flat();

  return positions;
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
