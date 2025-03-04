import * as sdk from "@defillama/sdk";
import { gql, request } from "graphql-request";
import { Liq } from "../utils/types";
import { getPagedGql } from "../utils/gql";

const lastId = "0x00";
const pageSize = 5;

const query = gql`
query users($lastId: String, $pageSize: Int) {
  accounts(
    first: $first
    where: {id_gt: $lastId, openPositionCount_gt: 0, borrows_: {amountUSD_gt: "0"}}
  ) {
    borrows: positions(where: {balance_gt: "0", side: BORROWER, timestampClosed: null}) {
      balance
      _eMode
      asset {
        symbol
        name
        decimals
        lastPriceUSD
      }
    }
    collateral: positions(where: {balance_gt: "0", side: COLLATERAL, timestampClosed: null}) {
      balance
      _eMode
      asset {
        symbol
        name
        decimals
        lastPriceUSD
      }
    }
    id
  }
}`;

interface User {
    id: string;
    borrows: {
      emode: boolean;
      balance: string;
      asset: {
        name: string;
        symbol: string;
        decimals: number;
        lastPriceUSD: string;
      };
    }[];
    collateral: {
      emode: boolean;
      balance: string;
      asset: {
        symbol: string;
        name: string;
        decimals: number;
        lastPriceUSD: string;
      };
      isCollateral: boolean;
    }[];
  }[];

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
    subgraphUrl: sdk.graph.modifyEndpoint('JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk'), // Messari AAVE v3
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

// Consider adding helper to derive live values from contracts; The subgraph does not contain emode LT values
const LT: { [chain in Chains]: { [asset: string]: { normal: number, emode: number } } } = {
  [Chains.ethereum]: {
    "ETH": { normal: 0.75, emode: 0.95 },
    "USDC": { normal: 0.78, emode: 0.92 },
    "GHO": { normal: 0, emode: null },
    "DAI": { normal: 0.77, emode: 0.92 },
    "wstETH": { normal: 0.81, emode: 0.95 },
    "PYUSD": { normal: 0.78, emode: null },
    "tBTC": { normal: 0.78, emode: 0.86 },
    "STG": { normal: 0.37, emode: null },
    "ETHx": { normal: 0.77, emode: 0.95 },
    "USDT": { normal: 0.78, emode: 0.92 },
    "BAL": { normal: 0.59, emode: null },
    "rsETH": { normal: 0.75, emode: 0.95 },
    "USDS": { normal: 0.78, emode: 0.92 },
    "LUSD": { normal: 0.77, emode: 0.92 },
    "sUSDe": { normal: 0.75, emode: 0.92 },
    "WBTC": { normal: 0.78, emode: 0.86 },  
    "sDAI": { normal: 0.78, emode: 0.92 }, 
    "WETH": { normal: 0.83, emode: 0.95 },
    "USDe": { normal: 0.75, emode: 0.92 },
    "ENS": { normal: 0.49, emode: null },
    "KNC": { normal: 0.37, emode: null },
    "cbBTC": { normal: 0.78, emode: 0.86 },
    "LBTC": { normal: 0.75, emode: 0.86 },
    "1INCH": { normal: 0.67, emode: null },
    "CRV": { normal: 0.41, emode: null },
    "FXS": { normal: 0.42, emode: null },
    "MKR": { normal: 0.7, emode: null },
    "osETH": { normal: 0.75, emode: 0.95 },
    "cbETH": { normal: 0.75, emode: 0.95 },
    "LDO": { normal: 0.5, emode: null },
    "AAVE": { normal: 0.76, emode: null },
    "RPL": { normal: 0, emode: null },
    "crvUSD": { normal: 0, emode: null },
    "weETH": { normal: 0.8, emode: 0.95 },
    "SNX": { normal: 0.65, emode: null },
    "rETH": { normal: 0.79, emode: 0.95 },
    "FRAX": { normal: 0.72, emode: null },
    "UNI": { normal: 0.74, emode: null },
    "LINK": { normal: 0.71, emode: null }
  },
  // [Chains.polygon]: {
  //   "MATIC": { normal: 0.6, emode: 0.65 },
  //   "USDC": { normal: 0.85, emode: 0.9 },
  // },
};

const positions = (chain: Chains) => async () => {
    const explorerBaseUrl = rc[chain].explorerBaseUrl;
    const subgraphUrl = rc[chain].subgraphUrl;
    const usdcAddress = rc[chain].usdcAddress;
    const users = (await request(subgraphUrl, query, { lastId, pageSize })).accounts as User[];

    // Filter for active debt and remove users with no collateral, these should be accounted elsewhere as bad debt
    const debts = users
      .filter(user => user.collateral.length > 0)
      .filter(user => user.borrows.length > 0)
      .reduce((acc, user) => {
        const totalDebt = user.borrows.reduce((debts, b) => {
            const normalizedBalance = ((parseFloat(b.balance) / 10**b.asset.decimals) * parseFloat(b.asset.lastPriceUSD == null ? "0" : b.asset.lastPriceUSD)).toString();
            debts += parseFloat(normalizedBalance);
            return debts;
        }, 0);

        const totalCollateral = user.collateral.reduce((collateral, c) => {
            const normalizedBalance = ((parseFloat(c.balance) / 10**c.asset.decimals) * parseFloat(c.asset.lastPriceUSD == null ? "0" : c.asset.lastPriceUSD));
            collateral += normalizedBalance;
            return collateral;
        }, 0);

        // Early return for positions in liquidation range; Likely stale data or unprofitable to liquidate
        if (totalDebt >= totalCollateral) {
          return acc;
        }; 

        const collateralWeights = user.collateral.map((c) => {
            const normalizedBalance = ((parseFloat(c.balance) / 10**c.asset.decimals) * parseFloat(c.asset.lastPriceUSD == null ? "0" : c.asset.lastPriceUSD)).toString();
            return parseFloat(normalizedBalance) / totalCollateral; 
        }, [] as { weight: Number; asset: { name: string; symbol: string; decimals: number; lastPriceUSD: string; } }[]);

        const weightedLT = user.collateral.reduce((lt, c) => {
            const normalizedBalance = ((parseFloat(c.balance) / 10**c.asset.decimals) * parseFloat(c.asset.lastPriceUSD == null ? "0" : c.asset.lastPriceUSD)).toString();
            LT[chain][c.asset.symbol] ? (lt += (parseFloat(normalizedBalance) / totalCollateral) * (c.emode ? LT[chain][c.asset.symbol].emode : LT[chain][c.asset.symbol].normal)) : console.log("No LT for ", c.asset.symbol);
            return lt; 
        }, 0);

        const priceImpact = totalDebt / totalCollateral / weightedLT;

        // Return for positions in liquidation range; Likely stale data or unprofitable to liquidate 
        if (weightedLT < totalDebt / totalCollateral) {
          return acc;
        } else {
          acc.push(...user.collateral.map((collateral, i) => {
            return { 
              owner: user.id,
              liqPrice: parseFloat(collateral.asset.lastPriceUSD == null ? "0" : collateral.asset.lastPriceUSD) * priceImpact * collateralWeights[i],
              collateral: collateral.asset.symbol,
              collateralAmount: collateral.balance,
              extra: {
                url: explorerBaseUrl + user.id,
              }, 
            } as Liq;
          })
        );
          // console.log(user.id, "Total Debt: ", totalDebt, "Total Collateral: ", totalCollateral);
          // console.log(user.id, "Collateral Weights: ", collateralWeights);
          // console.log("LT: ", weightedLT, "LTV: ", totalDebt / totalCollateral, "Price impact to liquidate: ", 1 - totalDebt / totalCollateral / weightedLT, "PI: ", priceImpact);
          console.log("Liquidation Prices: ", acc);
        }
        return acc;
    }, [] as Liq[]).flat();
    return debts;
};

// const positions = (chain: Chains) => async () => {
//   const explorerBaseUrl = rc[chain].explorerBaseUrl;
//   const subgraphUrl = rc[chain].subgraphUrl;
//   const usdcAddress = rc[chain].usdcAddress;
//   const _ethPriceQuery = ethPriceQuery(usdcAddress);
//   const users = (await getPagedGql(rc[chain].subgraphUrl, query, "users")) as User[];
//   const ethPrice = 1 / ((await request(subgraphUrl, _ethPriceQuery)).priceOracleAsset.priceInEth / 1e18);
//   const positions = users
//     .map((user) => {
//       let totalDebt = 0,
//         totalCollateral = 0;
//       const debts = (user.reserves as any[]).map((reserve) => {
//         const decimals = 10 ** reserve.reserve.decimals;
//         const price = (Number(reserve.reserve.price.priceInEth) / 1e18) * ethPrice;
//         const liqThreshold = Number(reserve.reserve.reserveLiquidationThreshold) / 1e4; // belongs to [0, 1]
//         let debt = Number(reserve.currentTotalDebt);
//         if (reserve.usageAsCollateralEnabledOnUser === true) {
//           debt -= Number(reserve.currentATokenBalance) * liqThreshold;
//         }
//         debt *= price / decimals;
//         if (debt > 0) {
//           totalDebt += debt;
//         } else {
//           totalCollateral -= debt;
//         }
//         return {
//           debt,
//           price,
//           token: reserve.reserve.underlyingAsset,
//           totalBal: reserve.currentATokenBalance,
//           decimals,
//         };
//       });

//       const liquidablePositions: Liq[] = debts
//         .filter(({ debt }) => debt < 0)
//         .map((pos) => {
//           const usdPosNetCollateral = -pos.debt;
//           const otherCollateral = totalCollateral - usdPosNetCollateral;
//           const diffDebt = totalDebt - otherCollateral;
//           if (diffDebt > 0) {
//             const amountCollateral = usdPosNetCollateral / pos.price; // accounts for liqThreshold
//             const liqPrice = diffDebt / amountCollateral;
//             // if liqPrice > pos.price -> bad debt
//             return {
//               owner: user.id as string,
//               liqPrice,
//               collateral: `${chain}:` + pos.token,
//               collateralAmount: pos.totalBal as string,
//               extra: {
//                 url: explorerBaseUrl + user.id,
//               },
//             } as Liq;
//           } else {
//             return {
//               owner: "",
//               liqPrice: 0,
//               collateral: "",
//               collateralAmount: "",
//             };
//           }
//         })
//         .filter((t) => !!t.owner);

//       return liquidablePositions;
//     })
//     .flat();
//   return positions;
// };

(async () => {
  try {
      console.log(await positions(Chains.ethereum)());
  } catch (error) {
      console.error("Error fetching positions:", error);
  }
})();

// module.exports = {
//   ethereum: {
//     liquidations: positions(Chains.ethereum),
//   },
//   // polygon: {
//   //   liquidations: positions(Chains.polygon),
//   // },
// };
