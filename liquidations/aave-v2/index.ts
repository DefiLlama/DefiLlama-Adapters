import * as sdk from "@defillama/sdk";
import { gql, request } from "graphql-request";
import { Liq } from "../utils/types";
import { getPagedGql } from "../utils/gql";

const query = gql`
  query users($lastId: String, $pageSize: Int) {
    users(first: $pageSize, where: { id_gt: $lastId, reserves_: { currentTotalDebt_gt: "0" } }) {
      id
      reserves {
        usageAsCollateralEnabledOnUser
        reserve {
          symbol
          usageAsCollateralEnabled
          underlyingAsset
          price {
            priceInEth
          }
          decimals
          reserveLiquidationThreshold
        }
        currentATokenBalance
        currentTotalDebt
      }
    }
    _meta {
      block {
        number
      }
    }
  }
`;

interface User {
  id: string;
  reserves: {
    usageAsCollateralEnabledOnUser: boolean;
    reserve: {
      symbol: string;
      usageAsCollateralEnabled: boolean;
      underlyingAsset: string;
      price: {
        priceInEth: string;
      };
      decimals: string;
      reserveLiquidationThreshold: string;
    };
    currentATokenBalance: string;
    currentTotalDebt: string;
  }[];
}

const ethPriceQuery = (usdcAddress: string) => gql`
  {
    priceOracleAsset(id: "${usdcAddress}") {
      priceInEth
    }
  }
`;

enum Chains {
  ethereum = "ethereum",
  // polygon = "polygon",
}

type AaveAdapterResource = {
  name: "aave";
  chain: Chains;
  usdcAddress: string;
  subgraphUrl: string;
  explorerBaseUrl: string;
};

const rc: { [chain in Chains]: AaveAdapterResource } = {
  [Chains.ethereum]: {
    name: "aave",
    chain: Chains.ethereum,
    usdcAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    subgraphUrl: sdk.graph.modifyEndpoint('8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N'),
    explorerBaseUrl: "https://etherscan.io/address/",
  },
  // [Chains.polygon]: {
  //   name: "aave",
  //   chain: Chains.polygon,
  //   usdcAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  //   subgraphUrl: sdk.graph.modifyEndpoint('H1Et77RZh3XEf27vkAmJyzgCME2RSFLtDS2f4PPW6CGp'),
  //   explorerBaseUrl: "https://polygonscan.com/address/",
  // },
};

const positions = (chain: Chains) => async () => {
  const explorerBaseUrl = rc[chain].explorerBaseUrl;
  const subgraphUrl = rc[chain].subgraphUrl;
  const usdcAddress = rc[chain].usdcAddress;
  const _ethPriceQuery = ethPriceQuery(usdcAddress);
  const users = (await getPagedGql(rc[chain].subgraphUrl, query, "users")) as User[];
  const ethPrice = 1 / ((await request(subgraphUrl, _ethPriceQuery)).priceOracleAsset.priceInEth / 1e18);
  const positions = users
    .map((user) => {
      let totalDebt = 0,
        totalCollateral = 0;
      const debts = (user.reserves as any[]).map((reserve) => {
        const decimals = 10 ** reserve.reserve.decimals;
        const price = (Number(reserve.reserve.price.priceInEth) / 1e18) * ethPrice;
        const liqThreshold = Number(reserve.reserve.reserveLiquidationThreshold) / 1e4; // belongs to [0, 1]
        let debt = Number(reserve.currentTotalDebt);
        if (reserve.usageAsCollateralEnabledOnUser === true) {
          debt -= Number(reserve.currentATokenBalance) * liqThreshold;
        }
        debt *= price / decimals;
        if (debt > 0) {
          totalDebt += debt;
        } else {
          totalCollateral -= debt;
        }
        return {
          debt,
          price,
          token: reserve.reserve.underlyingAsset,
          totalBal: reserve.currentATokenBalance,
          decimals,
        };
      });

      const liquidablePositions: Liq[] = debts
        .filter(({ debt }) => debt < 0)
        .map((pos) => {
          const usdPosNetCollateral = -pos.debt;
          const otherCollateral = totalCollateral - usdPosNetCollateral;
          const diffDebt = totalDebt - otherCollateral;
          if (diffDebt > 0) {
            const amountCollateral = usdPosNetCollateral / pos.price; // accounts for liqThreshold
            const liqPrice = diffDebt / amountCollateral;
            // if liqPrice > pos.price -> bad debt
            return {
              owner: user.id as string,
              liqPrice,
              collateral: `${chain}:` + pos.token,
              collateralAmount: pos.totalBal as string,
              extra: {
                url: explorerBaseUrl + user.id,
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
    liquidations: positions(Chains.ethereum),
  },
  // polygon: {
  //   liquidations: positions(Chains.polygon),
  // },
};
