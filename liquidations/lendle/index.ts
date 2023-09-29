import { gql, request } from "graphql-request";
import { Liq } from "../utils/types";
import { getPagedGql } from "../utils/gql";

const query = gql`
  query liquidates($lastId: String, $pageSize: Int) {
    liquidates(where: { id_gt: $lastId }, first: $pageSize) {
      id
      amountUSD
      amount
      timestamp
      liquidatee {
        id
      }
      market {
        inputToken {
          decimals
          id
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

interface LiquidatePosition {
  id: string;
  amountUSD: string;
  amount: string;
  timestamp: string;
  liquidatee: {
    id: string;
  };
  market: {
    inputToken: {
      decimals: string;
      id: string;
    };
  };
}

enum Chains {
  mantle = "mantle",
}

type AaveAdapterResource = {
  name: "lendle";
  chain: Chains;
  usdcAddress: string;
  subgraphUrl: string;
  explorerBaseUrl: string;
};

const rc: { [chain in Chains]: AaveAdapterResource } = {
  [Chains.mantle]: {
    name: "lendle",
    chain: Chains.mantle,
    usdcAddress: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
    subgraphUrl:
      "https://subgraph.lendle.xyz/subgraphs/name/lendle-finance/lendle-finance-mantle",
    explorerBaseUrl: "https://explorer.mantle.xyz/address/",
  },
};

const positions = (chain: Chains) => async () => {
  const explorerBaseUrl = rc[chain].explorerBaseUrl;
  const subgraphUrl = rc[chain].subgraphUrl;

  const liquidates = (await getPagedGql(
    subgraphUrl,
    query,
    "liquidates"
  )) as LiquidatePosition[];

  const positions = liquidates.map((liquidate) => {
    const owner = liquidate.liquidatee.id;
    const decimals = Number(liquidate.market.inputToken.decimals);
    const collateralAmount = Number(liquidate.amount);
    const collateralAmountUSD = Number(liquidate.amountUSD);
    const liqPrice = collateralAmountUSD / (collateralAmount / 10 ** decimals);

    return {
      owner,
      liqPrice,
      collateral: `${chain}:` + liquidate.market.inputToken.id,
      collateralAmount: collateralAmount.toString(),
      extra: {
        url: explorerBaseUrl + owner,
      },
    } as Liq;
  });

  return positions;
};

module.exports = {
  mantle: {
    liquidations: positions(Chains.mantle),
  },
};
