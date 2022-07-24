import { gql, request } from "graphql-request";
import BigNumber from "bignumber.js";
import { getPagedGql } from "../utils/gql";

// we do all prices in ETH until the end

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/liquity/liquity";

const globalQuery = gql`
  {
    global(id: "only") {
      currentSystemState {
        price
        totalCollateral
        totalDebt
        totalCollateralRatio
      }
    }
  }
`;

type SystemState = {
  price: string;
  totalCollateral: string;
  totalDebt: string;
  totalCollateralRatio: string;
};

const trovesQuery = gql`
  query troves($lastId: String) {
    troves(first: 1000, where: { status: open, id_gt: $lastId }) {
      id
      collateral
      rawCollateral
      debt
      owner {
        id
      }
    }
  }
`;

type Trove = {
  id: string;
  collateral: string;
  rawCollateral: string;
  debt: string;
  owner: {
    id: string;
  };
};

const getCurrentPrice = async () => {
  const price = (
    (await request(subgraphUrl, globalQuery)).global
      .currentSystemState as SystemState
  ).price;
  return price;
};

const calculateCollateralRatio = (
  collateral: string,
  debt: string,
  price: string
) => {
  const ratio = new BigNumber(collateral).times(price).div(debt).toString();
  return ratio;
};

// 1.1 * debt / collateral = price
const calculateLiquidationPrice = (debt: string, collateral: string) => {
  const price = new BigNumber(1.1).times(debt).div(collateral).toString();
  return price;
};

const liqs = async () => {
  const price = await getCurrentPrice();
  const troves = (await getPagedGql(
    subgraphUrl,
    trovesQuery,
    "troves"
  )) as Trove[];
  const liquidableTroves = troves
    .filter((trove) => {
      const collateralRatio = calculateCollateralRatio(
        trove.collateral,
        trove.debt,
        price
      );
      return Number(collateralRatio) < 1.1;
    })
    .map(({ collateral: _collateral, debt, owner, rawCollateral }) => {
      return {
        owner: owner.id,
        liqPrice: Number(calculateLiquidationPrice(debt, _collateral)),
        collateral: "ethereum:" + "0x0000000000000000000000000000000000000000", // ETH
        collateralAmount: rawCollateral,
      };
    });

  return liquidableTroves;
};

module.exports = {
  ethereum: {
    liquidations: liqs,
  },
};
