import { gql, request } from "graphql-request";
import BigNumber from "bignumber.js";
import { getPagedGql } from "../utils/gql";
import { Liq } from "../utils/types";

const subgraphUrl = "https://graph.cronoslabs.com/subgraphs/name/orby/orby";

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
    _meta {
      block {
        number
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
  query troves($lastId: String, $pageSize: Int) {
    troves(first: $pageSize, where: { status: open, id_gt: $lastId }) {
      id
      collateral
      rawCollateral
      debt
      owner {
        id
      }
    }
    _meta {
      block {
        number
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

const isRecoveryMode = (totalCollateralRatio: string) => {
  return Number(totalCollateralRatio) < 1.5;
};

const getSystemState = async () => {
  const systemState = (await request(subgraphUrl, globalQuery)).global
    .currentSystemState as SystemState;
  return systemState;
};

// 1.35 * debt / collateral = price
const calculateLiquidationPrice = (
  debt: string,
  collateral: string,
  isRecoveryMode: boolean
) => {
  const collateralRatioThreshold = isRecoveryMode ? 1.5 : 1.35;
  const price = new BigNumber(collateralRatioThreshold)
    .times(debt)
    .div(collateral)
    .toString();
  return price;
};

const EXPLORER_BASE_URL = "https://explorer.cronos.org/address/";

const positions = async () => {
  const { totalCollateralRatio } = await getSystemState();
  const _isRecoveryMode = isRecoveryMode(totalCollateralRatio);

  const troves = (await getPagedGql(
    subgraphUrl,
    trovesQuery,
    "troves"
  )) as Trove[];
  const _troves = troves.map(
    ({ collateral: _collateral, debt, owner, rawCollateral }) => {
      return {
        owner: owner.id,
        liqPrice: Number(
          calculateLiquidationPrice(debt, _collateral, _isRecoveryMode)
        ),
        collateral: "cronos:" + "0x7a7c9db510aB29A2FC362a4c34260BEcB5cE3446", // cdcETH
        collateralAmount: rawCollateral,
        extra: {
          url: EXPLORER_BASE_URL + owner.id,
        },
      } as Liq;
    }
  );

  return _troves;
};

module.exports = {
  cronos: {
    liquidations: positions,
  },
};
