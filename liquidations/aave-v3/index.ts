import * as sdk from "@defillama/sdk";
import { gql, request } from "graphql-request";
import { Liq } from "../utils/types";
import { getPagedGql } from "../utils/gql";

const query = gql`
query users($lastId: String, $pageSize: Int) {
  accounts(
    first: $pageSize
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
  arbitrum = "arbitrum",
  base = "base",
  polygon = "polygon",
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
  [Chains.arbitrum]: {
    name: "aave",
    chain: Chains.arbitrum,
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    subgraphUrl: sdk.graph.modifyEndpoint('4xyasjQeREe7PxnF6wVdobZvCw5mhoHZq3T7guRpuNPf'), // Messari AAVE v3
    explorerBaseUrl: "https://arbiscan.io/address/",
  },
  [Chains.polygon]: {
    name: "aave",
    chain: Chains.polygon,
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    subgraphUrl: sdk.graph.modifyEndpoint('6yuf1C49aWEscgk5n9D1DekeG1BCk5Z9imJYJT3sVmAT'),
    explorerBaseUrl: "https://polygonscan.com/address/",
  },
  [Chains.base]: {
    name: "aave",
    chain: Chains.base,
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    subgraphUrl: sdk.graph.modifyEndpoint('D7mapexM5ZsQckLJai2FawTKXJ7CqYGKM8PErnS3cJi9'),
    explorerBaseUrl: "https://basescan.org/address/",
  }
};

const LT: { [chain in Chains]: { [asset: string]: { normal: number, emode: number } } } = {
  [Chains.ethereum]: {},
  [Chains.polygon]: {},
  [Chains.arbitrum]: {},
  [Chains.base]: {},
};

// Consider adding helper to derive live values from contracts; The subgraph does not contain emode LT values or categories
const emodeCategories: { [chain in Chains]: { [symbol: string]: number } } = {
  [Chains.ethereum]: {
    // ETH Correlated
    "WETH": 0.95,
    "wstETH": 0.95,
    "weETH": 0.95,
    "osETH": 0.95,
    "rETH": 0.95,
    "ETHx": 0.95,
    "cbETH": 0.95,
    // sUSDe Stablecoins
    "USDT": 0.92,
    "USDC": 0.92,
    "USDS": 0.92,
    "sUSDe": 0.92,
    // rsETH LST Main
    "rsETH": 0.945,
    // LBTC / WBTC
    "LBTC": 0.86,
    "WBTC": 0.86,
  },
  [Chains.arbitrum]: {
    // ETH Correlated
    "WETH": 0.95,
    "wstETH": 0.95,
    "weETH": 0.95,
    // Stablecoins
    "USDT": 0.95,
    "USD₮0": 0.95,
    "USDC": 0.95,
    "USDC.e": 0.95,
    "DAI": 0.95,
    // ezETH wstETH
    "ezETH": 0.95,
  },
  [Chains.polygon]: {
    // ETH Correlated
    "WETH": 0.95,
    "wstETH": 0.95,
    "weETH": 0.95,
    "osETH": 0.95,
    "rETH": 0.95,
    "ETHx": 0.95,
    "cbETH": 0.95,
    // sUSDe Stablecoins
    "USDT": 0.92,
    "USDC": 0.92,
    "USDS": 0.92,
    "sUSDe": 0.92,
    // rsETH LST Main
    "rsETH": 0.945,
    // LBTC / WBTC
    "LBTC": 0.86,
    "WBTC": 0.86,
  },
  [Chains.base]: {
    // ETH Correlated
    "WETH": 0.93,
    "weETH": 0.93,
    "osETH": 0.93,
    "cbETH": 0.93,
    // ezETH wstETH
    "ezETH": 0.95,
  }
};

const populateLT = async (chain: Chains) => {
  const subgraphUrl = rc[chain].subgraphUrl;
  const data = await request(subgraphUrl, gql`
    query {
      markets {
        inputToken {
          symbol
        }
        liquidationThreshold
      }
    }
  `);

  data.markets.forEach((market: any) => {
    const symbol = market.inputToken.symbol;
    const liquidationThreshold = parseFloat(market.liquidationThreshold) / 100;
    const emodeThreshold = emodeCategories[chain][symbol] || null;
    LT[chain][symbol] = { normal: liquidationThreshold, emode: emodeThreshold };
  });
};

const positions = (chain: Chains) => async () => {
    const explorerBaseUrl = rc[chain].explorerBaseUrl;
    const users = (await getPagedGql(rc[chain].subgraphUrl, query, "accounts")) as User[];

    await populateLT(chain);

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
      };
      return acc;
    }, [] as Liq[]).flat();
    return debts;
};

module.exports = {
  ethereum: {
    liquidations: positions(Chains.ethereum),
  },
  polygon: {
    liquidations: positions(Chains.polygon),
  },
  base: {
    liquidations: positions(Chains.base),
  },
  arbitrum: {
    liquidations: positions(Chains.arbitrum),
  },
};
