import { gql, request } from "graphql-request";
import BigNumber from "bignumber.js";
import { getPagedGql } from "../utils/gql";
import { Liq } from "../utils/types";

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
  const systemState = (await request(subgraphUrl, globalQuery)).global.currentSystemState as SystemState;
  return systemState;
};

// 1.1 * debt / collateral = price
const calculateLiquidationPrice = (debt: string, collateral: string, isRecoveryMode: boolean) => {
  const collateralRatioThreshold = isRecoveryMode ? 1.5 : 1.1;
  const price = new BigNumber(collateralRatioThreshold).times(debt).div(collateral).toString();
  return price;
};

const EXPLORER_BASE_URL = "https://etherscan.io/address/";

const positions = async () => {
  const { totalCollateralRatio } = await getSystemState();
  const _isRecoveryMode = isRecoveryMode(totalCollateralRatio);

  const troves = (await getPagedGql(subgraphUrl, trovesQuery, "troves")) as Trove[];
  const _troves = troves.map(({ collateral: _collateral, debt, owner, rawCollateral }) => {
    return {
      owner: owner.id,
      liqPrice: Number(calculateLiquidationPrice(debt, _collateral, _isRecoveryMode)),
      collateral: "ethereum:" + "0x0000000000000000000000000000000000000000", // ETH
      collateralAmount: rawCollateral,
      extra: {
        url: EXPLORER_BASE_URL + owner.id,
      },
    } as Liq;
  });

  return _troves;
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};
